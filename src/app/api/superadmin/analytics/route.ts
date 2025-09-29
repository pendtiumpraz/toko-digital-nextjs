import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

/**
 * GET /api/superadmin/analytics - Get comprehensive analytics overview for super admin
 */
export async function GET(request: NextRequest) {
  try {
    // Verify super admin authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('start') ? new Date(searchParams.get('start')!) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const endDate = searchParams.get('end') ? new Date(searchParams.get('end')!) : new Date()

    // Set end date to end of day
    endDate.setHours(23, 59, 59, 999)

    // Calculate previous period for growth comparison
    const periodDiff = endDate.getTime() - startDate.getTime()
    const prevStartDate = new Date(startDate.getTime() - periodDiff)
    const prevEndDate = new Date(startDate.getTime() - 1)

    // Fetch comprehensive analytics data
    const [
      // User metrics
      totalUsers,
      activeUsers,
      previousUsers,
      userGrowthData,

      // Store metrics
      totalStores,
      activeStores,
      previousStores,
      storeGrowthData,

      // Order and revenue metrics
      orderMetrics,
      previousOrderMetrics,
      revenueData,

      // Category breakdown
      categoryData,

      // Subscription metrics
      subscriptionData,
      trialData,

      // Regional data (simplified)
      storesByRegion
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),

      // Active users in period
      prisma.user.count({
        where: {
          isActive: true,
          lastLogin: {
            gte: startDate,
            lte: endDate
          }
        }
      }),

      // Previous period users for growth calculation
      prisma.user.count({
        where: {
          createdAt: {
            gte: prevStartDate,
            lte: prevEndDate
          }
        }
      }),

      // User growth data (daily registrations in current period)
      prisma.user.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          createdAt: true,
          lastLogin: true
        }
      }),

      // Total stores
      prisma.store.count(),

      // Active stores in period
      prisma.store.count({
        where: {
          isActive: true,
          orders: {
            some: {
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            }
          }
        }
      }),

      // Previous period stores
      prisma.store.count({
        where: {
          createdAt: {
            gte: prevStartDate,
            lte: prevEndDate
          }
        }
      }),

      // Store growth data
      prisma.store.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          createdAt: true,
          isActive: true
        }
      }),

      // Order metrics current period
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: true,
        _sum: {
          total: true,
          totalProfit: true
        },
        _avg: {
          total: true
        }
      }),

      // Order metrics previous period
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: prevStartDate,
            lte: prevEndDate
          }
        },
        _count: true,
        _sum: {
          total: true
        }
      }),

      // Revenue data with payment status breakdown
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          total: true,
          totalProfit: true,
          paymentStatus: true,
          createdAt: true,
          store: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),

      // Category breakdown
      prisma.store.groupBy({
        by: ['id'],
        where: {
          isActive: true,
          products: {
            some: {
              isActive: true
            }
          }
        },
        _count: {
          products: true
        }
      }),

      // Subscription data
      prisma.subscription.findMany({
        where: {
          OR: [
            { status: 'ACTIVE' },
            { status: 'TRIAL' }
          ]
        },
        select: {
          plan: true,
          status: true,
          price: true,
          createdAt: true,
          trialStartDate: true,
          trialEndDate: true,
          startDate: true
        }
      }),

      // Trial data
      prisma.user.findMany({
        where: {
          trialEndDate: {
            gte: new Date()
          }
        },
        select: {
          trialStartDate: true,
          trialEndDate: true,
          subscription: {
            select: {
              status: true,
              plan: true
            }
          }
        }
      }),

      // Stores by region (using city as region)
      prisma.store.groupBy({
        by: ['city'],
        where: {
          isActive: true,
          city: {
            not: null
          }
        },
        _count: true
      })
    ])

    // Calculate growth percentages
    const userGrowthRate = previousUsers > 0 ? ((totalUsers - previousUsers) / previousUsers) * 100 : 0
    const storeGrowthRate = previousStores > 0 ? ((totalStores - previousStores) / previousStores) * 100 : 0

    const currentRevenue = Number(orderMetrics._sum.total || 0)
    const previousRevenue = Number(previousOrderMetrics._sum.total || 0)
    const revenueGrowthRate = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0

    // Process user activity (mock data for demo)
    const userActivity = {
      daily: Array.from({ length: 30 }, (_, i) => {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        return {
          date: date.toISOString().split('T')[0],
          activeUsers: Math.floor(Math.random() * 100) + 50,
          newUsers: Math.floor(Math.random() * 20) + 5
        }
      }),
      topPages: [
        { page: '/dashboard', views: 15420, uniqueUsers: 3240 },
        { page: '/products', views: 12890, uniqueUsers: 2890 },
        { page: '/orders', views: 9870, uniqueUsers: 2340 },
        { page: '/analytics', views: 7650, uniqueUsers: 1890 },
        { page: '/settings', views: 5430, uniqueUsers: 1230 }
      ],
      sessionDuration: 12.5, // minutes
      bounceRate: 32.1 // percentage
    }

    // Calculate store metrics
    const averageOrderValue = Number(orderMetrics._avg.total || 0)
    const conversionRate = activeStores > 0 ? (orderMetrics._count / activeStores) * 100 : 0

    // Mock category data (would be calculated from actual product categories)
    const topCategories = [
      { category: 'ELECTRONICS', count: 45, revenue: 1250000000 },
      { category: 'FASHION', count: 38, revenue: 890000000 },
      { category: 'FOOD_BEVERAGES', count: 32, revenue: 670000000 },
      { category: 'HEALTH_BEAUTY', count: 28, revenue: 540000000 },
      { category: 'HOME_LIVING', count: 24, revenue: 450000000 }
    ]

    // Mock device breakdown
    const deviceBreakdown = [
      { device: 'Mobile', count: 65, percentage: 65 },
      { device: 'Desktop', count: 28, percentage: 28 },
      { device: 'Tablet', count: 7, percentage: 7 }
    ]

    // Calculate subscription metrics
    const activeSubscriptions = subscriptionData.filter(s => s.status === 'ACTIVE')
    const trialUsers = subscriptionData.filter(s => s.status === 'TRIAL')

    const planDistribution = subscriptionData.reduce((acc, sub) => {
      const plan = sub.plan
      if (!acc[plan]) {
        acc[plan] = { plan, count: 0, revenue: 0 }
      }
      acc[plan].count++
      acc[plan].revenue += Number(sub.price || 0)
      return acc
    }, {} as Record<string, { plan: string; count: number; revenue: number }>)

    // Calculate conversion and churn rates (simplified)
    const conversionRateSubscription = trialUsers.length > 0 ? (activeSubscriptions.length / (activeSubscriptions.length + trialUsers.length)) * 100 : 0
    const churnRate = 5.2 // Mock data - would be calculated from actual subscription cancellations
    const trialToPayment = 34.5 // Mock data

    // Process regional data
    const regionData = storesByRegion.slice(0, 10).map(region => ({
      region: region.city || 'Unknown',
      users: region._count,
      stores: region._count,
      revenue: Math.floor(Math.random() * 500000000) + 100000000 // Mock revenue data
    }))

    const response = {
      totalUsers,
      activeUsers,
      totalStores,
      activeStores,
      totalOrders: orderMetrics._count,
      totalRevenue: currentRevenue,

      userGrowth: {
        thisMonth: totalUsers,
        lastMonth: previousUsers,
        growth: userGrowthRate
      },
      storeGrowth: {
        thisMonth: totalStores,
        lastMonth: previousStores,
        growth: storeGrowthRate
      },
      revenueGrowth: {
        thisMonth: currentRevenue,
        lastMonth: previousRevenue,
        growth: revenueGrowthRate
      },

      userActivity,

      storeMetrics: {
        averageOrderValue,
        conversionRate,
        topCategories,
        performanceDistribution: [
          { range: 'High (>50 orders)', count: 12 },
          { range: 'Medium (10-50 orders)', count: 45 },
          { range: 'Low (<10 orders)', count: 78 }
        ]
      },

      deviceBreakdown,
      browserBreakdown: [
        { browser: 'Chrome', count: 78, percentage: 78 },
        { browser: 'Safari', count: 12, percentage: 12 },
        { browser: 'Firefox', count: 7, percentage: 7 },
        { browser: 'Edge', count: 3, percentage: 3 }
      ],

      regionData,

      subscriptionMetrics: {
        conversionRate: conversionRateSubscription,
        churnRate,
        planDistribution: Object.values(planDistribution),
        trialToPayment
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}