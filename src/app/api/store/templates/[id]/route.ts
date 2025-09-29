import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/store/templates/[id] - Get specific template details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;

    // Template definitions (same as in main templates route)
    const templates: { [key: string]: any } = {
      'modern-1': {
        id: 'modern-1',
        name: 'Modern Marketplace',
        description: 'Clean and contemporary design perfect for modern businesses',
        longDescription: 'This template features a modern, clean design that\'s perfect for contemporary businesses. It includes responsive layouts, advanced product filtering, and smooth user experience across all devices.',
        category: 'modern',
        isPremium: false,
        isFree: true,
        preview: '/templates/modern-1.jpg',
        thumbnail: '/templates/thumbs/modern-1.jpg',
        gallery: [
          '/templates/gallery/modern-1-home.jpg',
          '/templates/gallery/modern-1-products.jpg',
          '/templates/gallery/modern-1-detail.jpg',
          '/templates/gallery/modern-1-cart.jpg'
        ],
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b',
        fontFamily: 'Inter',
        layout: 'GRID',
        features: [
          'Responsive Design',
          'Product Grid Layout',
          'Advanced Search Filter',
          'Category Navigation',
          'Mobile Optimized',
          'Fast Loading',
          'SEO Friendly',
          'Social Media Integration'
        ],
        specifications: {
          'Layout Type': 'Grid-based',
          'Mobile Support': 'Full Responsive',
          'Load Time': '< 2 seconds',
          'Browser Support': 'All Modern Browsers',
          'Accessibility': 'WCAG 2.1 AA',
          'RTL Support': 'Yes'
        },
        isActive: true,
        requiredPlan: 'FREE',
        tags: ['modern', 'clean', 'responsive', 'ecommerce'],
        demoUrl: 'https://demo.example.com/modern-1',
        version: '1.2.0',
        lastUpdated: '2024-01-15',
        author: 'Design Team',
        downloads: 1250,
        rating: 4.8,
        reviews: 45
      },
      'classic-1': {
        id: 'classic-1',
        name: 'Classic Boutique',
        description: 'Traditional elegant design for luxury and boutique stores',
        longDescription: 'An elegant, traditional design perfect for luxury boutiques and high-end retail stores. Features sophisticated typography and refined aesthetics.',
        category: 'classic',
        isPremium: true,
        isFree: false,
        preview: '/templates/classic-1.jpg',
        thumbnail: '/templates/thumbs/classic-1.jpg',
        gallery: [
          '/templates/gallery/classic-1-home.jpg',
          '/templates/gallery/classic-1-products.jpg',
          '/templates/gallery/classic-1-detail.jpg'
        ],
        primaryColor: '#8b5a3c',
        secondaryColor: '#6b7280',
        fontFamily: 'Playfair Display',
        layout: 'LIST',
        features: [
          'Elegant Typography',
          'Product Showcase',
          'Wishlist Functionality',
          'Advanced Filters',
          'Customer Reviews',
          'Social Media Integration',
          'Newsletter Signup',
          'Contact Forms'
        ],
        specifications: {
          'Layout Type': 'List-based',
          'Mobile Support': 'Full Responsive',
          'Load Time': '< 3 seconds',
          'Browser Support': 'All Modern Browsers',
          'Accessibility': 'WCAG 2.1 AA',
          'RTL Support': 'Yes'
        },
        isActive: true,
        requiredPlan: 'STARTER',
        tags: ['classic', 'elegant', 'boutique', 'luxury'],
        demoUrl: 'https://demo.example.com/classic-1',
        version: '1.1.0',
        lastUpdated: '2024-01-10',
        author: 'Design Team',
        downloads: 890,
        rating: 4.9,
        reviews: 32
      },
      'minimal-1': {
        id: 'minimal-1',
        name: 'Minimal Clean',
        description: 'Minimalist design focusing on products and simplicity',
        longDescription: 'A clean, minimalist design that puts your products front and center. Perfect for stores that want to emphasize simplicity and fast loading times.',
        category: 'minimal',
        isPremium: false,
        isFree: true,
        preview: '/templates/minimal-1.jpg',
        thumbnail: '/templates/thumbs/minimal-1.jpg',
        gallery: [
          '/templates/gallery/minimal-1-home.jpg',
          '/templates/gallery/minimal-1-products.jpg'
        ],
        primaryColor: '#000000',
        secondaryColor: '#9ca3af',
        fontFamily: 'Roboto',
        layout: 'MASONRY',
        features: [
          'Clean Layout',
          'Focus on Products',
          'Fast Loading',
          'Mobile First',
          'Minimal Interface',
          'Easy Navigation',
          'Search Functionality',
          'Filter Options'
        ],
        specifications: {
          'Layout Type': 'Masonry',
          'Mobile Support': 'Mobile First',
          'Load Time': '< 1.5 seconds',
          'Browser Support': 'All Modern Browsers',
          'Accessibility': 'WCAG 2.1 AA',
          'RTL Support': 'Yes'
        },
        isActive: true,
        requiredPlan: 'FREE',
        tags: ['minimal', 'clean', 'simple', 'fast'],
        demoUrl: 'https://demo.example.com/minimal-1',
        version: '1.0.5',
        lastUpdated: '2024-01-20',
        author: 'Design Team',
        downloads: 2100,
        rating: 4.7,
        reviews: 67
      }
    };

    const template = templates[templateId];

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Check user authentication and plan access
    const authHeader = request.headers.get('authorization');
    let userPlan = 'FREE';
    let hasAccess = true;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      if (decoded) {
        try {
          // Get user's subscription plan
          const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
              subscription: {
                select: {
                  plan: true,
                  status: true
                }
              }
            }
          });

          if (user?.subscription?.status === 'ACTIVE') {
            userPlan = user.subscription.plan;
          }
        } catch (error) {
          console.error('Error fetching user subscription:', error);
        }
      }
    }

    // Check template access
    hasAccess = hasTemplateAccess(userPlan, template.requiredPlan);

    // Return template with access information
    return NextResponse.json({
      ...template,
      hasAccess,
      userPlan,
      accessMessage: hasAccess
        ? 'You have access to this template'
        : `This template requires ${template.requiredPlan} plan or higher`
    });
  } catch (error) {
    console.error('Error getting template details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Check if user has access to a template based on their plan
 */
function hasTemplateAccess(userPlan: string, requiredPlan: string): boolean {
  const planHierarchy: { [key: string]: number } = {
    'FREE': 0,
    'STARTER': 1,
    'PROFESSIONAL': 2,
    'ENTERPRISE': 3
  };

  const userLevel = planHierarchy[userPlan] || 0;
  const requiredLevel = planHierarchy[requiredPlan] || 0;

  return userLevel >= requiredLevel;
}

/**
 * POST /api/store/templates/[id] - Apply template to user's store
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const templateId = params.id;
    const body = await request.json();
    const { customSettings = {} } = body;

    // Get template details (you might want to fetch from database in real app)
    const templates: { [key: string]: any } = {
      'modern-1': {
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b',
        fontFamily: 'Inter',
        layout: 'GRID',
        requiredPlan: 'FREE'
      },
      'classic-1': {
        primaryColor: '#8b5a3c',
        secondaryColor: '#6b7280',
        fontFamily: 'Playfair Display',
        layout: 'LIST',
        requiredPlan: 'STARTER'
      },
      'minimal-1': {
        primaryColor: '#000000',
        secondaryColor: '#9ca3af',
        fontFamily: 'Roboto',
        layout: 'MASONRY',
        requiredPlan: 'FREE'
      }
    };

    const template = templates[templateId];
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Check user's plan access
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        subscription: {
          select: {
            plan: true,
            status: true
          }
        },
        store: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!user || !user.store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const userPlan = user.subscription?.status === 'ACTIVE' ? user.subscription.plan : 'FREE';
    const hasAccess = hasTemplateAccess(userPlan, template.requiredPlan);

    if (!hasAccess) {
      return NextResponse.json({
        error: 'Insufficient plan',
        message: `This template requires ${template.requiredPlan} plan or higher`
      }, { status: 403 });
    }

    // Apply template to store
    const templateSettings = {
      logoPosition: customSettings.logoPosition || 'left',
      showSearch: customSettings.showSearch !== undefined ? customSettings.showSearch : true,
      showCategories: customSettings.showCategories !== undefined ? customSettings.showCategories : true,
      showFeatured: customSettings.showFeatured !== undefined ? customSettings.showFeatured : true,
      showReviews: customSettings.showReviews !== undefined ? customSettings.showReviews : true,
      darkMode: customSettings.darkMode || false,
      appliedAt: new Date().toISOString(),
      ...customSettings
    };

    const updatedStore = await prisma.store.update({
      where: { id: user.store.id },
      data: {
        templateId: templateId,
        primaryColor: customSettings.primaryColor || template.primaryColor,
        secondaryColor: customSettings.secondaryColor || template.secondaryColor,
        fontFamily: customSettings.fontFamily || template.fontFamily,
        layout: customSettings.layout || template.layout,
        templateSettings: templateSettings,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Template applied successfully',
      store: {
        id: updatedStore.id,
        templateId: templateId,
        primaryColor: updatedStore.primaryColor,
        secondaryColor: updatedStore.secondaryColor,
        fontFamily: updatedStore.fontFamily,
        layout: updatedStore.layout,
        templateSettings
      }
    });
  } catch (error) {
    console.error('Error applying template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}