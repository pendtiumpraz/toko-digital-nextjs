import { prisma } from './prisma'
import { TransactionType, TransactionCategory } from '@prisma/client'

interface TransactionWhere {
  storeId: string
  type?: TransactionType
  category?: TransactionCategory
  transactionDate?: {
    gte?: Date
    lte?: Date
  }
  OR?: Array<{
    description?: { contains: string; mode: 'insensitive' }
    reference?: { contains: string; mode: 'insensitive' }
  }>
  tags?: {
    hasSome: string[]
  }
}

interface CategoryBreakdownWhere {
  storeId: string
  transactionDate: {
    gte: Date
    lte: Date
  }
  type?: TransactionType
}

export interface FinancialTransaction {
  id: string
  type: TransactionType
  category: TransactionCategory
  amount: number
  description: string
  reference?: string
  tags: string[]
  transactionDate: Date
  createdAt: Date
}

export interface FinancialSummary {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  transactionCount: number
  period: {
    start: Date
    end: Date
  }
}

export interface CategoryBreakdown {
  category: TransactionCategory
  type: TransactionType
  total: number
  count: number
  percentage: number
}

export interface FinancialReport {
  summary: FinancialSummary
  categoryBreakdown: CategoryBreakdown[]
  monthlyTrends: Array<{
    month: string
    income: number
    expenses: number
    profit: number
  }>
  topExpenseCategories: CategoryBreakdown[]
  topIncomeCategories: CategoryBreakdown[]
}

/**
 * Create a new financial transaction
 */
export async function createTransaction(
  storeId: string,
  data: {
    type: TransactionType
    category: TransactionCategory
    amount: number
    description: string
    reference?: string
    tags?: string[]
    transactionDate?: Date
  }
): Promise<FinancialTransaction> {
  try {
    const transaction = await prisma.financialTransaction.create({
      data: {
        storeId,
        type: data.type,
        category: data.category,
        amount: data.amount,
        description: data.description,
        reference: data.reference,
        tags: data.tags || [],
        transactionDate: data.transactionDate || new Date()
      }
    })

    return {
      id: transaction.id,
      type: transaction.type,
      category: transaction.category,
      amount: Number(transaction.amount),
      description: transaction.description,
      reference: transaction.reference || undefined,
      tags: transaction.tags,
      transactionDate: transaction.transactionDate,
      createdAt: transaction.createdAt
    }
  } catch (error) {
    console.error('Error creating financial transaction:', error)
    throw error
  }
}

/**
 * Get financial transactions with pagination and filters
 */
export async function getTransactions(
  storeId: string,
  page: number = 1,
  limit: number = 20,
  filters?: {
    type?: TransactionType
    category?: TransactionCategory
    dateFrom?: Date
    dateTo?: Date
    search?: string
    tags?: string[]
  }
) {
  try {
    const skip = (page - 1) * limit

    const where: TransactionWhere = { storeId }

    if (filters?.type) where.type = filters.type
    if (filters?.category) where.category = filters.category
    if (filters?.dateFrom || filters?.dateTo) {
      where.transactionDate = {}
      if (filters.dateFrom) where.transactionDate.gte = filters.dateFrom
      if (filters.dateTo) where.transactionDate.lte = filters.dateTo
    }
    if (filters?.search) {
      where.OR = [
        { description: { contains: filters.search, mode: 'insensitive' } },
        { reference: { contains: filters.search, mode: 'insensitive' } }
      ]
    }
    if (filters?.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.financialTransaction.findMany({
        where,
        orderBy: { transactionDate: 'desc' },
        skip,
        take: limit
      }),
      prisma.financialTransaction.count({ where })
    ])

    return {
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        category: t.category,
        amount: Number(t.amount),
        description: t.description,
        reference: t.reference || undefined,
        tags: t.tags,
        transactionDate: t.transactionDate,
        createdAt: t.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Error getting transactions:', error)
    throw error
  }
}

/**
 * Update a financial transaction
 */
export async function updateTransaction(
  storeId: string,
  transactionId: string,
  data: {
    type?: TransactionType
    category?: TransactionCategory
    amount?: number
    description?: string
    reference?: string
    tags?: string[]
    transactionDate?: Date
  }
): Promise<FinancialTransaction> {
  try {
    const transaction = await prisma.financialTransaction.update({
      where: {
        id: transactionId,
        storeId // Ensure transaction belongs to the store
      },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.category && { category: data.category }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.description && { description: data.description }),
        ...(data.reference !== undefined && { reference: data.reference }),
        ...(data.tags && { tags: data.tags }),
        ...(data.transactionDate && { transactionDate: data.transactionDate })
      }
    })

    return {
      id: transaction.id,
      type: transaction.type,
      category: transaction.category,
      amount: Number(transaction.amount),
      description: transaction.description,
      reference: transaction.reference || undefined,
      tags: transaction.tags,
      transactionDate: transaction.transactionDate,
      createdAt: transaction.createdAt
    }
  } catch (error) {
    console.error('Error updating transaction:', error)
    throw error
  }
}

/**
 * Delete a financial transaction
 */
export async function deleteTransaction(
  storeId: string,
  transactionId: string
): Promise<void> {
  try {
    await prisma.financialTransaction.delete({
      where: {
        id: transactionId,
        storeId // Ensure transaction belongs to the store
      }
    })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    throw error
  }
}

/**
 * Get financial summary for a period
 */
export async function getFinancialSummary(
  storeId: string,
  startDate: Date,
  endDate: Date
): Promise<FinancialSummary> {
  try {
    const [incomeResult, expenseResult, transactionCount] = await Promise.all([
      prisma.financialTransaction.aggregate({
        where: {
          storeId,
          type: 'INCOME',
          transactionDate: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: { amount: true }
      }),
      prisma.financialTransaction.aggregate({
        where: {
          storeId,
          type: 'EXPENSE',
          transactionDate: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: { amount: true }
      }),
      prisma.financialTransaction.count({
        where: {
          storeId,
          transactionDate: {
            gte: startDate,
            lte: endDate
          }
        }
      })
    ])

    const totalIncome = Number(incomeResult._sum.amount || 0)
    const totalExpenses = Number(expenseResult._sum.amount || 0)

    return {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      transactionCount,
      period: {
        start: startDate,
        end: endDate
      }
    }
  } catch (error) {
    console.error('Error getting financial summary:', error)
    throw error
  }
}

/**
 * Get category breakdown
 */
export async function getCategoryBreakdown(
  storeId: string,
  startDate: Date,
  endDate: Date,
  type?: TransactionType
): Promise<CategoryBreakdown[]> {
  try {
    const where: CategoryBreakdownWhere = {
      storeId,
      transactionDate: {
        gte: startDate,
        lte: endDate
      }
    }

    if (type) where.type = type

    const results = await prisma.financialTransaction.groupBy({
      by: ['category', 'type'],
      where,
      _sum: { amount: true },
      _count: true
    })

    // Get total amount for percentage calculation
    const totalResult = await prisma.financialTransaction.aggregate({
      where,
      _sum: { amount: true }
    })

    const totalAmount = Number(totalResult._sum.amount || 0)

    return results.map(result => ({
      category: result.category,
      type: result.type,
      total: Number(result._sum.amount || 0),
      count: result._count,
      percentage: totalAmount > 0 ? (Number(result._sum.amount || 0) / totalAmount) * 100 : 0
    }))
  } catch (error) {
    console.error('Error getting category breakdown:', error)
    throw error
  }
}

/**
 * Get monthly trends
 */
export async function getMonthlyTrends(
  storeId: string,
  months: number = 12
): Promise<Array<{
  month: string
  income: number
  expenses: number
  profit: number
}>> {
  try {
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)
    startDate.setDate(1)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date()
    endDate.setDate(1)
    endDate.setMonth(endDate.getMonth() + 1)
    endDate.setDate(0) // Last day of current month
    endDate.setHours(23, 59, 59, 999)

    const transactions = await prisma.financialTransaction.findMany({
      where: {
        storeId,
        transactionDate: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        type: true,
        amount: true,
        transactionDate: true
      }
    })

    // Group by month
    const monthlyData: { [key: string]: { income: number; expenses: number } } = {}

    transactions.forEach(transaction => {
      const monthKey = transaction.transactionDate.toISOString().substr(0, 7) // YYYY-MM format

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 }
      }

      const amount = Number(transaction.amount)
      if (transaction.type === 'INCOME') {
        monthlyData[monthKey].income += amount
      } else {
        monthlyData[monthKey].expenses += amount
      }
    })

    // Generate all months in range
    const result = []
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toISOString().substr(0, 7)
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })

      const data = monthlyData[monthKey] || { income: 0, expenses: 0 }
      result.push({
        month: monthName,
        income: data.income,
        expenses: data.expenses,
        profit: data.income - data.expenses
      })
    }

    return result
  } catch (error) {
    console.error('Error getting monthly trends:', error)
    throw error
  }
}

/**
 * Generate comprehensive financial report
 */
export async function generateFinancialReport(
  storeId: string,
  startDate: Date,
  endDate: Date
): Promise<FinancialReport> {
  try {
    const [
      summary,
      categoryBreakdown,
      monthlyTrends,
      expenseBreakdown,
      incomeBreakdown
    ] = await Promise.all([
      getFinancialSummary(storeId, startDate, endDate),
      getCategoryBreakdown(storeId, startDate, endDate),
      getMonthlyTrends(storeId, 12),
      getCategoryBreakdown(storeId, startDate, endDate, 'EXPENSE'),
      getCategoryBreakdown(storeId, startDate, endDate, 'INCOME')
    ])

    // Sort by total amount descending
    const topExpenseCategories = expenseBreakdown
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    const topIncomeCategories = incomeBreakdown
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    return {
      summary,
      categoryBreakdown,
      monthlyTrends,
      topExpenseCategories,
      topIncomeCategories
    }
  } catch (error) {
    console.error('Error generating financial report:', error)
    throw error
  }
}

/**
 * Get dashboard financial statistics
 */
export async function getDashboardStats(storeId: string) {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    const [
      thisMonthSummary,
      lastMonthSummary,
      yearSummary,
      recentTransactions,
      topExpenseCategories,
      topIncomeCategories
    ] = await Promise.all([
      getFinancialSummary(storeId, startOfMonth, now),
      getFinancialSummary(storeId, startOfLastMonth, endOfLastMonth),
      getFinancialSummary(storeId, startOfYear, now),
      getTransactions(storeId, 1, 5),
      getCategoryBreakdown(storeId, startOfMonth, now, 'EXPENSE'),
      getCategoryBreakdown(storeId, startOfMonth, now, 'INCOME')
    ])

    // Calculate growth percentages
    const incomeGrowth = lastMonthSummary.totalIncome > 0
      ? ((thisMonthSummary.totalIncome - lastMonthSummary.totalIncome) / lastMonthSummary.totalIncome) * 100
      : 0

    const expenseGrowth = lastMonthSummary.totalExpenses > 0
      ? ((thisMonthSummary.totalExpenses - lastMonthSummary.totalExpenses) / lastMonthSummary.totalExpenses) * 100
      : 0

    const profitGrowth = lastMonthSummary.netProfit !== 0
      ? ((thisMonthSummary.netProfit - lastMonthSummary.netProfit) / Math.abs(lastMonthSummary.netProfit)) * 100
      : 0

    return {
      thisMonth: thisMonthSummary,
      lastMonth: lastMonthSummary,
      thisYear: yearSummary,
      growth: {
        income: incomeGrowth,
        expenses: expenseGrowth,
        profit: profitGrowth
      },
      recentTransactions: recentTransactions.transactions,
      topExpenseCategories: topExpenseCategories.slice(0, 5),
      topIncomeCategories: topIncomeCategories.slice(0, 5)
    }
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    throw error
  }
}

/**
 * Auto-create financial transaction from order
 */
export async function createTransactionFromOrder(orderId: string): Promise<FinancialTransaction | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                cost: true
              }
            }
          }
        }
      }
    })

    if (!order || order.paymentStatus !== 'PAID') {
      return null
    }

    // Check if transaction already exists
    const existingTransaction = await prisma.financialTransaction.findFirst({
      where: {
        storeId: order.storeId,
        reference: order.orderNumber
      }
    })

    if (existingTransaction) {
      return null // Transaction already exists
    }

    // Create income transaction
    const transaction = await createTransaction(order.storeId, {
      type: 'INCOME',
      category: 'PRODUCT_SALES',
      amount: Number(order.total),
      description: `Sale from order #${order.orderNumber}`,
      reference: order.orderNumber,
      tags: ['order', 'sale'],
      transactionDate: order.paidAt || order.createdAt
    })

    // Optionally create expense transactions for cost of goods sold
    const totalCost = order.items.reduce((sum, item) => {
      return sum + (Number(item.product.cost || 0) * item.quantity)
    }, 0)

    if (totalCost > 0) {
      await createTransaction(order.storeId, {
        type: 'EXPENSE',
        category: 'INVENTORY_PURCHASE',
        amount: totalCost,
        description: `Cost of goods sold for order #${order.orderNumber}`,
        reference: order.orderNumber,
        tags: ['order', 'cogs'],
        transactionDate: order.paidAt || order.createdAt
      })
    }

    return transaction
  } catch (error) {
    console.error('Error creating transaction from order:', error)
    return null
  }
}