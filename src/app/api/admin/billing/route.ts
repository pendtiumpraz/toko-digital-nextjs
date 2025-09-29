import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

interface BillingMetrics {
  revenue: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
  subscriptions: {
    total: number
    active: number
    trial: number
    expired: number
    cancelled: number
    conversionRate: number
  }
  plans: Array<{
    plan: string
    count: number
    revenue: number
    percentage: number
  }>
  recentPayments: Array<{
    id: string
    userEmail: string
    userName: string
    plan: string
    amount: number
    status: string
    date: Date
    billingCycle: string
  }>
  monthlyRevenue: Array<{
    month: string
    revenue: number
    subscriptions: number
  }>
}

/**
 * GET /api/admin/billing - Get comprehensive billing dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.error === 'Forbidden' ? 403 : 401 }
      )
    }

    const now = new Date()
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1)

    // Get comprehensive billing data
    const [
      totalRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      totalSubscriptions,
      activeSubscriptions,
      trialSubscriptions,
      expiredSubscriptions,
      cancelledSubscriptions,
      totalTrialUsers,
      planBreakdown,
      recentPayments,
      monthlyRevenueData
    ] = await Promise.all([
      // Total revenue from all active subscriptions
      prisma.subscription.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { price: true }
      }),

      // This month's revenue (new subscriptions)
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

      // Last month's revenue (new subscriptions)
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

      // Total subscriptions
      prisma.subscription.count(),

      // Active subscriptions
      prisma.subscription.count({
        where: { status: 'ACTIVE' }
      }),

      // Trial subscriptions
      prisma.subscription.count({
        where: { status: 'TRIAL' }
      }),

      // Expired subscriptions
      prisma.subscription.count({
        where: { status: 'EXPIRED' }
      }),

      // Cancelled subscriptions
      prisma.subscription.count({
        where: { status: 'CANCELLED' }
      }),

      // Total users in trial
      prisma.user.count({
        where: {
          trialEndDate: { gt: now },
          subscription: {
            OR: [
              { status: 'TRIAL' },
              { status: { isSet: false } }
            ]
          }
        }
      }),

      // Plan breakdown
      prisma.subscription.groupBy({
        by: ['plan'],
        where: { status: 'ACTIVE' },
        _count: true,
        _sum: { price: true }
      }),

      // Recent payments (active subscriptions as proxy for payments)
      prisma.subscription.findMany({
        where: { status: 'ACTIVE' },
        include: {
          user: {
            select: {
              email: true,
              name: true
            }
          }
        },
        orderBy: { startDate: 'desc' },
        take: 10
      }),

      // Monthly revenue trend
      prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          startDate: {
            gte: twelveMonthsAgo
          }
        },
        select: {
          startDate: true,
          price: true
        }
      })
    ])

    // Calculate conversion rate (active subscriptions / total trial users)
    const conversionRate = totalTrialUsers > 0
      ? (activeSubscriptions / (totalTrialUsers + activeSubscriptions)) * 100
      : 0

    // Calculate revenue growth
    const thisMonthAmount = Number(thisMonthRevenue._sum.price || 0)
    const lastMonthAmount = Number(lastMonthRevenue._sum.price || 0)
    const revenueGrowth = lastMonthAmount > 0
      ? ((thisMonthAmount - lastMonthAmount) / lastMonthAmount) * 100
      : 0

    // Process plan breakdown
    const totalPlanRevenue = planBreakdown.reduce(
      (sum, plan) => sum + Number(plan._sum.price || 0),
      0
    )

    const plans = planBreakdown.map(plan => ({
      plan: plan.plan,
      count: plan._count,
      revenue: Number(plan._sum.price || 0),
      percentage: totalPlanRevenue > 0
        ? (Number(plan._sum.price || 0) / totalPlanRevenue) * 100
        : 0
    }))

    // Process recent payments
    const payments = recentPayments.map(sub => ({
      id: sub.id,
      userEmail: sub.user.email,
      userName: sub.user.name,
      plan: sub.plan,
      amount: Number(sub.price),
      status: sub.status,
      date: sub.startDate || sub.createdAt,
      billingCycle: sub.billingCycle
    }))

    // Process monthly revenue
    const monthlyRevenueMap = new Map<string, { revenue: number; count: number }>()
    monthlyRevenueData.forEach(sub => {
      if (sub.startDate) {
        const monthKey = sub.startDate.toISOString().slice(0, 7) // YYYY-MM
        const existing = monthlyRevenueMap.get(monthKey) || { revenue: 0, count: 0 }
        existing.revenue += Number(sub.price)
        existing.count += 1
        monthlyRevenueMap.set(monthKey, existing)
      }
    })

    // Generate last 12 months of revenue data
    const monthlyRevenue = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toISOString().slice(0, 7)
      const monthName = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
      })

      const data = monthlyRevenueMap.get(monthKey) || { revenue: 0, count: 0 }
      monthlyRevenue.push({
        month: monthName,
        revenue: data.revenue,
        subscriptions: data.count
      })
    }

    const billingMetrics: BillingMetrics = {
      revenue: {
        total: Number(totalRevenue._sum.price || 0),
        thisMonth: thisMonthAmount,
        lastMonth: lastMonthAmount,
        growth: revenueGrowth
      },
      subscriptions: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        trial: trialSubscriptions,
        expired: expiredSubscriptions,
        cancelled: cancelledSubscriptions,
        conversionRate
      },
      plans,
      recentPayments: payments,
      monthlyRevenue
    }

    return NextResponse.json({
      success: true,
      data: billingMetrics
    })

  } catch (error) {
    console.error('Error getting billing data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}