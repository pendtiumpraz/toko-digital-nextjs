import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

/**
 * GET /api/superadmin/finance - Get comprehensive financial overview for super admin
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

    // Get financial data from multiple sources
    const [
      // Current period aggregations
      totalRevenue,
      totalExpenses,
      totalTransactions,

      // Previous period for growth comparison
      prevRevenue,
      prevExpenses,
      prevTransactions,

      // Active stores count
      activeStores,

      // Payment method breakdown
      orderStats,

      // Top performing stores
      storePerformance,

      // Recent transactions
      recentTransactions,

      // Category breakdown
      categoryBreakdown,

      // Subscription revenue
      subscriptionRevenue
    ] = await Promise.all([
      // Current period - total revenue from orders
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          paidAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          total: true,
          totalProfit: true
        },
        _count: true
      }),

      // Current period - expenses from financial transactions
      prisma.financialTransaction.aggregate({
        where: {
          type: 'EXPENSE',
          transactionDate: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: { amount: true }
      }),

      // Current period - all financial transactions count
      prisma.financialTransaction.count({
        where: {
          transactionDate: {
            gte: startDate,
            lte: endDate
          }
        }
      }),

      // Previous period - revenue
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          paidAt: {
            gte: prevStartDate,
            lte: prevEndDate
          }
        },
        _sum: {
          total: true,
          totalProfit: true
        }
      }),

      // Previous period - expenses
      prisma.financialTransaction.aggregate({
        where: {
          type: 'EXPENSE',
          transactionDate: {
            gte: prevStartDate,
            lte: prevEndDate
          }
        },
        _sum: { amount: true }
      }),

      // Previous period - transactions count
      prisma.financialTransaction.count({
        where: {
          transactionDate: {
            gte: prevStartDate,
            lte: prevEndDate
          }
        }
      }),

      // Active stores with orders in the period
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

      // Payment method breakdown
      prisma.order.groupBy({
        by: ['paymentMethod'],
        where: {
          paymentStatus: 'PAID',
          paidAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: { total: true },
        _count: true
      }),

      // Top performing stores
      prisma.store.findMany({
        where: {
          isActive: true,
          orders: {
            some: {
              paymentStatus: 'PAID',
              paidAt: {
                gte: startDate,
                lte: endDate
              }
            }
          }
        },
        include: {
          orders: {
            where: {
              paymentStatus: 'PAID',
              paidAt: {
                gte: startDate,
                lte: endDate
              }
            },
            select: {
              total: true,
              totalProfit: true
            }
          },
          _count: {
            select: {
              orders: {
                where: {
                  paymentStatus: 'PAID',
                  paidAt: {
                    gte: startDate,
                    lte: endDate
                  }
                }
              }
            }
          }
        },
        orderBy: {
          totalRevenue: 'desc'
        },
        take: 10
      }),

      // Recent transactions
      prisma.financialTransaction.findMany({
        where: {
          transactionDate: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          store: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          transactionDate: 'desc'
        },
        take: 20
      }),

      // Category breakdown
      prisma.financialTransaction.groupBy({
        by: ['category', 'type'],
        where: {
          transactionDate: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: { amount: true },
        _count: true
      }),

      // Subscription revenue
      prisma.subscription.aggregate({
        where: {
          status: 'ACTIVE',
          lastPaymentDate: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: { price: true }
      })
    ])

    // Calculate totals
    const currentRevenue = Number(totalRevenue._sum.total || 0) + Number(subscriptionRevenue._sum.price || 0)
    const currentProfit = Number(totalRevenue._sum.totalProfit || 0)
    const currentExpenses = Number(totalExpenses._sum.amount || 0)
    const netProfit = currentProfit - currentExpenses

    const previousRevenue = Number(prevRevenue._sum.total || 0)
    const previousProfit = Number(prevRevenue._sum.totalProfit || 0)
    const previousExpenses = Number(prevExpenses._sum.amount || 0)

    // Calculate growth percentages
    const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0
    const profitGrowth = previousProfit > 0 ? ((netProfit - (previousProfit - previousExpenses)) / (previousProfit - previousExpenses)) * 100 : 0
    const transactionGrowth = prevTransactions > 0 ? ((totalTransactions - prevTransactions) / prevTransactions) * 100 : 0

    // Calculate payment method breakdown
    const totalPayments = orderStats.reduce((sum, method) => sum + Number(method._sum.total || 0), 0)
    const paymentMethodBreakdown = orderStats.map(method => ({
      method: method.paymentMethod.replace(/_/g, ' '),
      amount: Number(method._sum.total || 0),
      count: method._count,
      percentage: totalPayments > 0 ? (Number(method._sum.total || 0) / totalPayments) * 100 : 0
    }))

    // Calculate top performing stores with growth
    const topPerformingStores = await Promise.all(
      storePerformance.slice(0, 10).map(async (store) => {
        const storeRevenue = store.orders.reduce((sum, order) => sum + Number(order.total), 0)
        const storeProfit = store.orders.reduce((sum, order) => sum + Number(order.totalProfit), 0)

        // Get previous period data for growth calculation
        const prevStoreOrders = await prisma.order.aggregate({
          where: {
            storeId: store.id,
            paymentStatus: 'PAID',
            paidAt: {
              gte: prevStartDate,
              lte: prevEndDate
            }
          },
          _sum: { total: true }
        })

        const prevStoreRevenue = Number(prevStoreOrders._sum.total || 0)
        const growth = prevStoreRevenue > 0 ? ((storeRevenue - prevStoreRevenue) / prevStoreRevenue) * 100 : 0

        return {
          storeId: store.id,
          storeName: store.name,
          revenue: storeRevenue,
          profit: storeProfit,
          orders: store._count.orders,
          growth
        }
      })
    )

    // Sort by revenue and take top 10
    topPerformingStores.sort((a, b) => b.revenue - a.revenue)

    // Calculate category breakdown with percentages
    const totalCategoryAmount = categoryBreakdown.reduce((sum, cat) => sum + Number(cat._sum.amount || 0), 0)
    const categoryBreakdownWithPercentage = categoryBreakdown.map(category => ({
      category: category.category,
      type: category.type,
      amount: Number(category._sum.amount || 0),
      count: category._count,
      percentage: totalCategoryAmount > 0 ? (Number(category._sum.amount || 0) / totalCategoryAmount) * 100 : 0
    })).sort((a, b) => b.amount - a.amount)

    // Format recent transactions
    const formattedRecentTransactions = recentTransactions.map(transaction => ({
      id: transaction.id,
      storeId: transaction.storeId,
      storeName: transaction.store.name,
      type: transaction.type,
      category: transaction.category,
      amount: Number(transaction.amount),
      description: transaction.description,
      date: transaction.transactionDate.toISOString()
    }))

    const response = {
      totalRevenue: currentRevenue,
      totalProfit: netProfit,
      totalTransactions,
      activeStores,
      monthlyRevenue: currentRevenue,
      monthlyProfit: netProfit,
      monthlyGrowth: {
        revenue: revenueGrowth,
        profit: profitGrowth,
        transactions: transactionGrowth
      },
      yearlyRevenue: currentRevenue, // For simplicity, using current period
      yearlyProfit: netProfit,
      paymentMethodBreakdown,
      topPerformingStores: topPerformingStores.slice(0, 10),
      recentTransactions: formattedRecentTransactions,
      categoryBreakdown: categoryBreakdownWithPercentage
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching superadmin financial data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}