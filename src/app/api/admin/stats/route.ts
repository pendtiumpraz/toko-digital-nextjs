import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/stats - Get overall admin dashboard statistics
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

    // Calculate date ranges
    const now = new Date()
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Get comprehensive statistics
    const [
      // User metrics
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      newUsersLastMonth,

      // Store metrics
      totalStores,
      activeStores,
      newStoresThisMonth,
      newStoresLastMonth,

      // Revenue metrics (from orders and subscriptions)
      totalOrderRevenue,
      thisMonthOrderRevenue,
      lastMonthOrderRevenue,

      totalSubscriptionRevenue,
      thisMonthSubscriptionRevenue,
      lastMonthSubscriptionRevenue,

      // Subscription metrics
      activeSubscriptions,
      trialSubscriptions,
      expiredSubscriptions
    ] = await Promise.all([
      // Users
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfThisMonth,
            lt: now
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      }),

      // Stores
      prisma.store.count(),
      prisma.store.count({ where: { isActive: true } }),
      prisma.store.count({
        where: {
          createdAt: {
            gte: startOfThisMonth,
            lt: now
          }
        }
      }),
      prisma.store.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      }),

      // Order revenue
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID'
        },
        _sum: { total: true }
      }),
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          paidAt: {
            gte: startOfThisMonth,
            lt: now
          }
        },
        _sum: { total: true }
      }),
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          paidAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        },
        _sum: { total: true }
      }),

      // Subscription revenue
      prisma.subscription.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { price: true }
      }),
      prisma.subscription.aggregate({
        where: {
          status: 'ACTIVE',
          startDate: {
            gte: startOfThisMonth,
            lt: now
          }
        },
        _sum: { price: true }
      }),
      prisma.subscription.aggregate({
        where: {
          status: 'ACTIVE',
          startDate: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        },
        _sum: { price: true }
      }),

      // Subscriptions
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.subscription.count({ where: { status: 'TRIAL' } }),
      prisma.subscription.count({ where: { status: 'EXPIRED' } })
    ])

    // Calculate totals
    const totalRevenue = Number(totalOrderRevenue._sum.total || 0) + Number(totalSubscriptionRevenue._sum.price || 0)
    const thisMonthRevenue = Number(thisMonthOrderRevenue._sum.total || 0) + Number(thisMonthSubscriptionRevenue._sum.price || 0)
    const lastMonthRevenue = Number(lastMonthOrderRevenue._sum.total || 0) + Number(lastMonthSubscriptionRevenue._sum.price || 0)

    // Calculate growth percentages
    const userGrowth = newUsersLastMonth > 0
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
      : newUsersThisMonth > 0 ? 100 : 0

    const storeGrowth = newStoresLastMonth > 0
      ? ((newStoresThisMonth - newStoresLastMonth) / newStoresLastMonth) * 100
      : newStoresThisMonth > 0 ? 100 : 0

    const revenueGrowth = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : thisMonthRevenue > 0 ? 100 : 0

    // Calculate overall monthly growth (average of user, store, and revenue growth)
    const monthlyGrowth = (userGrowth + storeGrowth + revenueGrowth) / 3

    const stats = {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      userGrowth,

      totalStores,
      activeStores,
      newStoresThisMonth,
      storeGrowth,

      totalRevenue,
      thisMonthRevenue,
      revenueGrowth,
      monthlyGrowth,

      activeSubscriptions,
      trialSubscriptions,
      expiredSubscriptions,

      // Additional metrics
      userRetentionRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
      storeActivationRate: totalStores > 0 ? (activeStores / totalStores) * 100 : 0,
      subscriptionConversionRate: (activeSubscriptions + trialSubscriptions) > 0
        ? (activeSubscriptions / (activeSubscriptions + trialSubscriptions)) * 100
        : 0
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error getting admin stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}