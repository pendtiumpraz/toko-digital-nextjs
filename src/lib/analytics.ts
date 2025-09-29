import { prisma } from './prisma'
import { AnalyticsPeriod } from '@prisma/client'

export interface AnalyticsData {
  date: Date
  period: AnalyticsPeriod
  totalOrders: number
  totalRevenue: number
  totalProfit: number
  avgOrderValue: number
  totalProducts: number
  activeProducts: number
  outOfStock: number
  totalViews: number
  uniqueVisitors: number
  conversionRate: number
  totalIncome: number
  totalExpenses: number
  netProfit: number
}

export interface AnalyticsSummary {
  current: AnalyticsData
  previous?: AnalyticsData
  growth: {
    revenue: number
    orders: number
    visitors: number
    conversionRate: number
    profit: number
  }
}

/**
 * Record analytics snapshot for a store
 */
export async function recordAnalyticsSnapshot(
  storeId: string,
  date: Date = new Date(),
  period: AnalyticsPeriod = 'DAILY'
): Promise<void> {
  try {
    // Calculate date range based on period
    const { startDate, endDate } = getDateRangeForPeriod(date, period)

    // Fetch all required data
    const [
      ordersData,
      revenueData,
      productsData,
      trafficData,
      financialData
    ] = await Promise.all([
      // Orders metrics
      prisma.order.aggregate({
        where: {
          storeId,
          createdAt: { gte: startDate, lte: endDate }
        },
        _count: true,
        _sum: { total: true, totalProfit: true }
      }),

      // Revenue from paid orders
      prisma.order.aggregate({
        where: {
          storeId,
          paymentStatus: 'PAID',
          createdAt: { gte: startDate, lte: endDate }
        },
        _sum: { total: true, totalProfit: true }
      }),

      // Products metrics
      prisma.product.aggregate({
        where: { storeId },
        _count: true
      }),

      // Active and out of stock products
      Promise.all([
        prisma.product.count({
          where: { storeId, isActive: true }
        }),
        prisma.product.count({
          where: { storeId, stock: 0 }
        })
      ]),

      // Financial data from transactions
      Promise.all([
        prisma.financialTransaction.aggregate({
          where: {
            storeId,
            type: 'INCOME',
            transactionDate: { gte: startDate, lte: endDate }
          },
          _sum: { amount: true }
        }),
        prisma.financialTransaction.aggregate({
          where: {
            storeId,
            type: 'EXPENSE',
            transactionDate: { gte: startDate, lte: endDate }
          },
          _sum: { amount: true }
        })
      ])
    ])

    const [activeProducts, outOfStock] = trafficData
    const [incomeData, expenseData] = financialData

    const totalOrders = ordersData._count || 0
    const totalRevenue = Number(revenueData._sum.total || 0)
    const totalProfit = Number(revenueData._sum.totalProfit || 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const totalProducts = productsData._count || 0
    const totalIncome = Number(incomeData._sum.amount || 0)
    const totalExpenses = Number(expenseData._sum.amount || 0)
    const netProfit = totalIncome - totalExpenses

    // For now, use estimated traffic data (this would be replaced with real analytics)
    const totalViews = Math.max(totalOrders * 15, 50) // Estimate based on orders
    const uniqueVisitors = Math.max(totalOrders * 8, 25) // Estimate unique visitors
    const conversionRate = uniqueVisitors > 0 ? (totalOrders / uniqueVisitors) * 100 : 0

    // Create or update analytics record
    await prisma.storeAnalytics.upsert({
      where: {
        storeId_date_period: {
          storeId,
          date: startDate,
          period
        }
      },
      update: {
        totalOrders,
        totalRevenue,
        totalProfit,
        avgOrderValue,
        totalProducts,
        activeProducts,
        outOfStock,
        totalViews,
        uniqueVisitors,
        conversionRate,
        totalIncome,
        totalExpenses,
        netProfit
      },
      create: {
        storeId,
        date: startDate,
        period,
        totalOrders,
        totalRevenue,
        totalProfit,
        avgOrderValue,
        totalProducts,
        activeProducts,
        outOfStock,
        totalViews,
        uniqueVisitors,
        conversionRate,
        totalIncome,
        totalExpenses,
        netProfit
      }
    })
  } catch (error) {
    console.error('Error recording analytics snapshot:', error)
    throw error
  }
}

/**
 * Get analytics summary with comparison to previous period
 */
export async function getAnalyticsSummary(
  storeId: string,
  period: AnalyticsPeriod = 'DAILY',
  date: Date = new Date()
): Promise<AnalyticsSummary> {
  try {
    const { startDate } = getDateRangeForPeriod(date, period)
    const { startDate: previousStartDate } = getPreviousPeriod(startDate, period)

    const [current, previous] = await Promise.all([
      prisma.storeAnalytics.findUnique({
        where: {
          storeId_date_period: {
            storeId,
            date: startDate,
            period
          }
        }
      }),
      prisma.storeAnalytics.findUnique({
        where: {
          storeId_date_period: {
            storeId,
            date: previousStartDate,
            period
          }
        }
      })
    ])

    if (!current) {
      // If no current data, record a snapshot and return
      await recordAnalyticsSnapshot(storeId, date, period)
      return getAnalyticsSummary(storeId, period, date)
    }

    const currentData: AnalyticsData = {
      date: current.date,
      period: current.period,
      totalOrders: current.totalOrders,
      totalRevenue: Number(current.totalRevenue),
      totalProfit: Number(current.totalProfit),
      avgOrderValue: Number(current.avgOrderValue),
      totalProducts: current.totalProducts,
      activeProducts: current.activeProducts,
      outOfStock: current.outOfStock,
      totalViews: current.totalViews,
      uniqueVisitors: current.uniqueVisitors,
      conversionRate: current.conversionRate,
      totalIncome: Number(current.totalIncome),
      totalExpenses: Number(current.totalExpenses),
      netProfit: Number(current.netProfit)
    }

    const previousData: AnalyticsData | undefined = previous ? {
      date: previous.date,
      period: previous.period,
      totalOrders: previous.totalOrders,
      totalRevenue: Number(previous.totalRevenue),
      totalProfit: Number(previous.totalProfit),
      avgOrderValue: Number(previous.avgOrderValue),
      totalProducts: previous.totalProducts,
      activeProducts: previous.activeProducts,
      outOfStock: previous.outOfStock,
      totalViews: previous.totalViews,
      uniqueVisitors: previous.uniqueVisitors,
      conversionRate: previous.conversionRate,
      totalIncome: Number(previous.totalIncome),
      totalExpenses: Number(previous.totalExpenses),
      netProfit: Number(previous.netProfit)
    } : undefined

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    const growth = {
      revenue: previousData ? calculateGrowth(currentData.totalRevenue, previousData.totalRevenue) : 0,
      orders: previousData ? calculateGrowth(currentData.totalOrders, previousData.totalOrders) : 0,
      visitors: previousData ? calculateGrowth(currentData.uniqueVisitors, previousData.uniqueVisitors) : 0,
      conversionRate: previousData ? calculateGrowth(currentData.conversionRate, previousData.conversionRate) : 0,
      profit: previousData ? calculateGrowth(currentData.netProfit, previousData.netProfit) : 0
    }

    return {
      current: currentData,
      previous: previousData,
      growth
    }
  } catch (error) {
    console.error('Error getting analytics summary:', error)
    throw error
  }
}

/**
 * Get analytics trend data for charts
 */
export async function getAnalyticsTrend(
  storeId: string,
  period: AnalyticsPeriod,
  numberOfPeriods: number = 7
): Promise<AnalyticsData[]> {
  try {
    const endDate = new Date()
    const trends = []

    for (let i = numberOfPeriods - 1; i >= 0; i--) {
      const date = new Date(endDate)

      switch (period) {
        case 'DAILY':
          date.setDate(date.getDate() - i)
          break
        case 'WEEKLY':
          date.setDate(date.getDate() - (i * 7))
          break
        case 'MONTHLY':
          date.setMonth(date.getMonth() - i)
          break
        case 'QUARTERLY':
          date.setMonth(date.getMonth() - (i * 3))
          break
        case 'YEARLY':
          date.setFullYear(date.getFullYear() - i)
          break
      }

      const { startDate } = getDateRangeForPeriod(date, period)

      const analytics = await prisma.storeAnalytics.findUnique({
        where: {
          storeId_date_period: {
            storeId,
            date: startDate,
            period
          }
        }
      })

      if (analytics) {
        trends.push({
          date: analytics.date,
          period: analytics.period,
          totalOrders: analytics.totalOrders,
          totalRevenue: Number(analytics.totalRevenue),
          totalProfit: Number(analytics.totalProfit),
          avgOrderValue: Number(analytics.avgOrderValue),
          totalProducts: analytics.totalProducts,
          activeProducts: analytics.activeProducts,
          outOfStock: analytics.outOfStock,
          totalViews: analytics.totalViews,
          uniqueVisitors: analytics.uniqueVisitors,
          conversionRate: analytics.conversionRate,
          totalIncome: Number(analytics.totalIncome),
          totalExpenses: Number(analytics.totalExpenses),
          netProfit: Number(analytics.netProfit)
        })
      } else {
        // Create default/empty analytics for missing periods
        trends.push({
          date: startDate,
          period,
          totalOrders: 0,
          totalRevenue: 0,
          totalProfit: 0,
          avgOrderValue: 0,
          totalProducts: 0,
          activeProducts: 0,
          outOfStock: 0,
          totalViews: 0,
          uniqueVisitors: 0,
          conversionRate: 0,
          totalIncome: 0,
          totalExpenses: 0,
          netProfit: 0
        })
      }
    }

    return trends
  } catch (error) {
    console.error('Error getting analytics trend:', error)
    throw error
  }
}

/**
 * Record page view for analytics
 */
export async function recordPageView(
  storeId: string,
  visitorId?: string,
  page?: string
): Promise<void> {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Update daily analytics
    await prisma.storeAnalytics.upsert({
      where: {
        storeId_date_period: {
          storeId,
          date: today,
          period: 'DAILY'
        }
      },
      update: {
        totalViews: { increment: 1 },
        ...(visitorId && { uniqueVisitors: { increment: 1 } })
      },
      create: {
        storeId,
        date: today,
        period: 'DAILY',
        totalViews: 1,
        uniqueVisitors: visitorId ? 1 : 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalProfit: 0,
        avgOrderValue: 0,
        totalProducts: 0,
        activeProducts: 0,
        outOfStock: 0,
        conversionRate: 0,
        totalIncome: 0,
        totalExpenses: 0,
        netProfit: 0
      }
    })
  } catch (error) {
    console.error('Error recording page view:', error)
    // Don't throw here as this is not critical
  }
}

/**
 * Get date range for a given period
 */
function getDateRangeForPeriod(date: Date, period: AnalyticsPeriod): { startDate: Date; endDate: Date } {
  const startDate = new Date(date)
  const endDate = new Date(date)

  switch (period) {
    case 'DAILY':
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
      break
    case 'WEEKLY':
      const dayOfWeek = startDate.getDay()
      startDate.setDate(startDate.getDate() - dayOfWeek)
      startDate.setHours(0, 0, 0, 0)
      endDate.setDate(startDate.getDate() + 6)
      endDate.setHours(23, 59, 59, 999)
      break
    case 'MONTHLY':
      startDate.setDate(1)
      startDate.setHours(0, 0, 0, 0)
      endDate.setMonth(endDate.getMonth() + 1, 0)
      endDate.setHours(23, 59, 59, 999)
      break
    case 'QUARTERLY':
      const quarter = Math.floor(startDate.getMonth() / 3)
      startDate.setMonth(quarter * 3, 1)
      startDate.setHours(0, 0, 0, 0)
      endDate.setMonth(quarter * 3 + 3, 0)
      endDate.setHours(23, 59, 59, 999)
      break
    case 'YEARLY':
      startDate.setMonth(0, 1)
      startDate.setHours(0, 0, 0, 0)
      endDate.setMonth(11, 31)
      endDate.setHours(23, 59, 59, 999)
      break
  }

  return { startDate, endDate }
}

/**
 * Get previous period date
 */
function getPreviousPeriod(date: Date, period: AnalyticsPeriod): { startDate: Date; endDate: Date } {
  const previousDate = new Date(date)

  switch (period) {
    case 'DAILY':
      previousDate.setDate(previousDate.getDate() - 1)
      break
    case 'WEEKLY':
      previousDate.setDate(previousDate.getDate() - 7)
      break
    case 'MONTHLY':
      previousDate.setMonth(previousDate.getMonth() - 1)
      break
    case 'QUARTERLY':
      previousDate.setMonth(previousDate.getMonth() - 3)
      break
    case 'YEARLY':
      previousDate.setFullYear(previousDate.getFullYear() - 1)
      break
  }

  return getDateRangeForPeriod(previousDate, period)
}