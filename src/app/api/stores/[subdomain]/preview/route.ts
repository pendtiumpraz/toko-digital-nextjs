import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/stores/[subdomain]/preview - Get store preview data for admins
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  try {
    // For preview, we can allow both admin and public access
    // Admin access will show more detailed preview
    const authHeader = request.headers.get('authorization');
    let isAdmin = false;
    let adminUser = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      if (decoded) {
        adminUser = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { role: true }
        });
        isAdmin = adminUser?.role === 'SUPER_ADMIN' || adminUser?.role === 'ADMIN';
      }
    }

    const subdomain = params.subdomain;

    // Fetch store with all necessary data for preview
    const store = await prisma.store.findUnique({
      where: { subdomain },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true
          }
        },
        products: {
          where: {
            isActive: true,
            visibility: 'VISIBLE'
          },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            comparePrice: true,
            slug: true,
            featured: true,
            category: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: {
                url: true,
                alt: true
              }
            },
            tags: {
              select: {
                name: true
              }
            }
          },
          orderBy: [
            { featured: 'desc' },
            { createdAt: 'desc' }
          ],
          take: isAdmin ? 50 : 20 // Admins can see more products in preview
        },
        whatsappSettings: {
          select: {
            isEnabled: true,
            phoneNumber: true,
            businessName: true,
            greetingMessage: true
          }
        }
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Check if store should be accessible
    if (!store.isActive && !isAdmin) {
      return NextResponse.json({ error: 'Store is temporarily unavailable' }, { status: 503 });
    }

    // Format products for frontend
    const formattedProducts = store.products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      slug: product.slug,
      featured: product.featured,
      category: product.category,
      image: product.images[0]?.url || null,
      imageAlt: product.images[0]?.alt || product.name,
      tags: product.tags.map(tag => tag.name),
      discount: product.comparePrice
        ? Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100)
        : null
    }));

    // Get featured products
    const featuredProducts = formattedProducts.filter(p => p.featured);

    // Group products by category
    const productsByCategory = formattedProducts.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {} as Record<string, typeof formattedProducts>);

    // Calculate store stats for admin preview
    let storeStats = null;
    if (isAdmin) {
      const [totalOrders, totalRevenue, totalProducts] = await Promise.all([
        prisma.order.count({
          where: { storeId: store.id, status: 'COMPLETED' }
        }),
        prisma.order.aggregate({
          where: { storeId: store.id, status: 'COMPLETED' },
          _sum: { total: true }
        }),
        prisma.product.count({
          where: { storeId: store.id, isActive: true }
        })
      ]);

      storeStats = {
        totalOrders,
        totalRevenue: Number(totalRevenue._sum.total || 0),
        totalProducts,
        totalActiveProducts: formattedProducts.length
      };
    }

    const storePreview = {
      id: store.id,
      name: store.name,
      description: store.description,
      logo: store.logo,
      banner: store.banner,
      subdomain: store.subdomain,
      customDomain: store.customDomain,
      isActive: store.isActive,
      isVerified: store.isVerified,

      // Contact info
      whatsappNumber: store.whatsappNumber,
      email: store.email,

      // Address
      address: {
        street: store.street,
        city: store.city,
        state: store.state,
        country: store.country,
        postalCode: store.postalCode
      },

      // Social media
      socialMedia: {
        facebook: store.facebook,
        instagram: store.instagram,
        twitter: store.twitter,
        youtube: store.youtube
      },

      // Styling
      theme: {
        primaryColor: store.primaryColor,
        secondaryColor: store.secondaryColor,
        fontFamily: store.fontFamily,
        layout: store.layout,
        currency: store.currency
      },

      // Products
      products: formattedProducts,
      featuredProducts,
      productsByCategory,

      // WhatsApp settings
      whatsapp: store.whatsappSettings,

      // Owner info (limited for non-admins)
      owner: isAdmin ? store.owner : {
        name: store.owner.name
      },

      // Admin-only data
      ...(isAdmin && {
        adminPreview: true,
        stats: storeStats,
        storageUsed: Number(store.storageUsed),
        storageLimit: Number(store.storageLimit),
        rating: store.rating,
        totalReviews: store.totalReviews,
        totalSales: store.totalSales,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt
      })
    };

    return NextResponse.json(storePreview);
  } catch (error) {
    console.error('Error getting store preview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}