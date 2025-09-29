import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/superadmin/stores/[id] - Get detailed store information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify super admin role
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!admin || admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const storeId = params.id;

    // Fetch detailed store information
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            createdAt: true,
            lastLogin: true,
            subscription: {
              select: {
                id: true,
                plan: true,
                status: true,
                startDate: true,
                endDate: true,
                trialEndDate: true,
                price: true
              }
            }
          }
        },
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            isActive: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
            customer: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            products: true,
            orders: true,
            customers: true
          }
        }
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Calculate analytics
    const [
      totalRevenue,
      completedOrders,
      pendingOrders,
      monthlyRevenue,
      weeklyOrders,
      averageOrderValue
    ] = await Promise.all([
      // Total revenue
      prisma.order.aggregate({
        where: {
          storeId: storeId,
          status: 'COMPLETED'
        },
        _sum: { total: true }
      }),

      // Completed orders
      prisma.order.count({
        where: {
          storeId: storeId,
          status: 'COMPLETED'
        }
      }),

      // Pending orders
      prisma.order.count({
        where: {
          storeId: storeId,
          status: { in: ['PENDING', 'PROCESSING'] }
        }
      }),

      // Monthly revenue (last 30 days)
      prisma.order.aggregate({
        where: {
          storeId: storeId,
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        _sum: { total: true }
      }),

      // Weekly orders (last 7 days)
      prisma.order.count({
        where: {
          storeId: storeId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Average order value
      prisma.order.aggregate({
        where: {
          storeId: storeId,
          status: 'COMPLETED'
        },
        _avg: { total: true }
      })
    ]);

    // Get top products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          storeId: storeId,
          status: 'COMPLETED'
        }
      },
      _sum: {
        quantity: true
      },
      _count: {
        productId: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            price: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: {
                url: true
              }
            }
          }
        });
        return {
          ...product,
          soldQuantity: item._sum.quantity,
          orderCount: item._count.productId
        };
      })
    );

    // Get recent activity
    const recentActivity = await prisma.adminActivityLog.findMany({
      where: {
        targetType: 'store',
        targetId: storeId
      },
      include: {
        admin: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get store settings (mock for now)
    const settings = {
      currency: 'IDR',
      timezone: 'Asia/Jakarta',
      language: 'id',
      allowRegistration: true,
      requireVerification: false,
      maintenanceMode: false,
      theme: 'default'
    };

    // Calculate conversion rate (mock)
    const monthlyVisitors = Math.floor(Math.random() * 10000) + 1000;
    const conversionRate = monthlyVisitors > 0 ? (completedOrders / monthlyVisitors * 100) : 0;

    const storeWithAnalytics = {
      ...store,
      analytics: {
        totalOrders: store._count.orders,
        completedOrders,
        pendingOrders,
        totalRevenue: Number(totalRevenue._sum.total || 0),
        monthlyRevenue: Number(monthlyRevenue._sum.total || 0),
        weeklyOrders,
        averageOrderValue: Number(averageOrderValue._avg.total || 0),
        totalProducts: store._count.products,
        totalCustomers: store._count.customers,
        monthlyVisitors,
        conversionRate,
        topProducts: topProductsWithDetails
      },
      settings,
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        action: activity.action,
        description: activity.description,
        createdAt: activity.createdAt,
        admin: activity.admin
      }))
    };

    return NextResponse.json(storeWithAnalytics);
  } catch (error) {
    console.error('Error getting store details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}