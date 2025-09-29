import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/reports - Get comprehensive reports for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Verify admin role
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query parameters for date range
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d, 1y
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate date range
    let dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } else {
      const now = new Date()
      const daysBack = period === '7d' ? 7 : period === '90d' ? 90 : period === '1y' ? 365 : 30
      const pastDate = new Date()
      pastDate.setDate(now.getDate() - daysBack)

      dateFilter = {
        gte: pastDate,
        lte: now
      }
    }

    // Get previous period for comparison
    const periodLength = dateFilter.lte.getTime() - dateFilter.gte.getTime()
    const previousPeriodStart = new Date(dateFilter.gte.getTime() - periodLength)
    const previousPeriodEnd = new Date(dateFilter.lte.getTime() - periodLength)

    // Parallel data fetching for better performance
    const [
      // Current period stats
      totalUsers,
      newUsers,
      totalStores,
      newStores,
      activeStores,
      totalOrders,
      totalRevenue,
      totalSubscriptions,
      activeSubscriptions,

      // Previous period stats for comparison
      previousNewUsers,
      previousNewStores,
      previousTotalOrders,
      previousTotalRevenue,

      // Detailed analytics
      userGrowthData,
      storeGrowthData,
      revenueData,
      subscriptionData,
      topStores,
      recentActivities
    ] = await Promise.all([
      // Current period
      prisma.user.count(),
      prisma.user.count({
        where: { createdAt: dateFilter }
      }),
      prisma.store.count(),
      prisma.store.count({
        where: { createdAt: dateFilter }
      }),
      prisma.store.count({
        where: {
          isActive: true,
          createdAt: dateFilter
        }
      }),
      prisma.order.count({
        where: { createdAt: dateFilter }
      }),
      prisma.order.aggregate({
        where: {
          createdAt: dateFilter,
          status: { in: ['COMPLETED', 'DELIVERED'] }
        },
        _sum: { total: true }
      }),
      prisma.subscription.count(),
      prisma.subscription.count({
        where: { status: 'ACTIVE' }
      }),

      // Previous period
      prisma.user.count({
        where: {
          createdAt: {
            gte: previousPeriodStart,
            lte: previousPeriodEnd
          }
        }
      }),
      prisma.store.count({
        where: {
          createdAt: {
            gte: previousPeriodStart,
            lte: previousPeriodEnd
          }
        }
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: previousPeriodStart,
            lte: previousPeriodEnd
          }
        }
      }),
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: previousPeriodStart,
            lte: previousPeriodEnd
          },
          status: { in: ['COMPLETED', 'DELIVERED'] }
        },
        _sum: { total: true }
      }),

      // Growth data by day
      getUserGrowthData(dateFilter),
      getStoreGrowthData(dateFilter),
      getRevenueData(dateFilter),
      getSubscriptionData(),
      getTopStores(10),
      getRecentActivities(20)
    ])

    // Calculate growth percentages
    const userGrowth = previousNewUsers > 0 ? ((newUsers - previousNewUsers) / previousNewUsers) * 100 : 0
    const storeGrowth = previousNewStores > 0 ? ((newStores - previousNewStores) / previousNewStores) * 100 : 0
    const orderGrowth = previousTotalOrders > 0 ? ((totalOrders - previousTotalOrders) / previousTotalOrders) * 100 : 0
    const revenueGrowth = Number(previousTotalRevenue._sum.total || 0) > 0
      ? ((Number(totalRevenue._sum.total || 0) - Number(previousTotalRevenue._sum.total || 0)) / Number(previousTotalRevenue._sum.total || 0)) * 100
      : 0

    const report = {
      overview: {
        totalUsers: {
          current: totalUsers,
          new: newUsers,
          growth: userGrowth
        },
        totalStores: {
          current: totalStores,
          new: newStores,
          active: activeStores,
          growth: storeGrowth
        },
        orders: {
          total: totalOrders,
          growth: orderGrowth
        },
        revenue: {
          total: Number(totalRevenue._sum.total || 0),
          growth: revenueGrowth
        },
        subscriptions: {
          total: totalSubscriptions,
          active: activeSubscriptions,
          conversionRate: totalUsers > 0 ? (activeSubscriptions / totalUsers) * 100 : 0
        }
      },
      charts: {
        userGrowth: userGrowthData,
        storeGrowth: storeGrowthData,
        revenue: revenueData,
        subscriptions: subscriptionData
      },
      topStores,
      recentActivities,
      period: {
        start: dateFilter.gte,
        end: dateFilter.lte,
        days: Math.ceil((dateFilter.lte.getTime() - dateFilter.gte.getTime()) / (1000 * 60 * 60 * 24))
      }
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error generating reports:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions for data aggregation
async function getUserGrowthData(dateFilter: any) {
  const users = await prisma.user.groupBy({
    by: ['createdAt'],
    where: { createdAt: dateFilter },
    _count: { id: true },
    orderBy: { createdAt: 'asc' }
  })

  // Group by day
  const dailyData: Record<string, number> = {}
  users.forEach(user => {
    const date = user.createdAt.toISOString().split('T')[0]
    dailyData[date] = (dailyData[date] || 0) + user._count.id
  })

  return Object.entries(dailyData).map(([date, count]) => ({
    date,
    count
  }))
}

async function getStoreGrowthData(dateFilter: any) {
  const stores = await prisma.store.groupBy({
    by: ['createdAt'],
    where: { createdAt: dateFilter },
    _count: { id: true },
    orderBy: { createdAt: 'asc' }
  })

  // Group by day
  const dailyData: Record<string, number> = {}
  stores.forEach(store => {
    const date = store.createdAt.toISOString().split('T')[0]
    dailyData[date] = (dailyData[date] || 0) + store._count.id
  })

  return Object.entries(dailyData).map(([date, count]) => ({
    date,
    count
  }))
}

async function getRevenueData(dateFilter: any) {
  const orders = await prisma.order.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: dateFilter,
      status: { in: ['COMPLETED', 'DELIVERED'] }
    },
    _sum: { total: true },
    orderBy: { createdAt: 'asc' }
  })

  // Group by day
  const dailyData: Record<string, number> = {}
  orders.forEach(order => {
    const date = order.createdAt.toISOString().split('T')[0]
    dailyData[date] = (dailyData[date] || 0) + Number(order._sum.total || 0)
  })

  return Object.entries(dailyData).map(([date, amount]) => ({
    date,
    amount
  }))
}

async function getSubscriptionData() {
  const subscriptions = await prisma.subscription.groupBy({
    by: ['plan', 'status'],
    _count: { id: true }
  })

  return subscriptions.map(sub => ({
    plan: sub.plan,
    status: sub.status,
    count: sub._count.id
  }))
}

async function getTopStores(limit: number) {
  const stores = await prisma.store.findMany({
    select: {
      id: true,
      name: true,
      subdomain: true,
      totalRevenue: true,
      totalSales: true,
      isActive: true,
      owner: {
        select: {
          name: true,
          email: true
        }
      },
      _count: {
        select: {
          orders: true,
          products: true
        }
      }
    },
    orderBy: {
      totalRevenue: 'desc'
    },
    take: limit
  })

  return stores.map(store => ({
    id: store.id,
    name: store.name,
    subdomain: store.subdomain,
    revenue: Number(store.totalRevenue),
    sales: store.totalSales,
    orders: store._count.orders,
    products: store._count.products,
    isActive: store.isActive,
    owner: store.owner
  }))
}

async function getRecentActivities(limit: number) {
  const activities = await prisma.adminActivityLog.findMany({
    select: {
      id: true,
      action: true,
      description: true,
      targetType: true,
      targetId: true,
      createdAt: true,
      admin: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  })

  return activities
}