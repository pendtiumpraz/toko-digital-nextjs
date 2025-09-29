import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { TransactionType, TransactionCategory } from '@prisma/client'

/**
 * GET /api/superadmin/finance/transactions - Get paginated financial transactions
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const type = searchParams.get('type') as TransactionType | null
    const category = searchParams.get('category') as TransactionCategory | null
    const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : null
    const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : null
    const storeId = searchParams.get('storeId')

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (type && type !== 'ALL') {
      where.type = type
    }

    if (category) {
      where.category = category
    }

    if (dateFrom || dateTo) {
      where.transactionDate = {}
      if (dateFrom) where.transactionDate.gte = dateFrom
      if (dateTo) {
        const endDate = new Date(dateTo)
        endDate.setHours(23, 59, 59, 999)
        where.transactionDate.lte = endDate
      }
    }

    if (storeId) {
      where.storeId = storeId
    }

    // Calculate offset
    const skip = (page - 1) * limit

    // Fetch transactions and total count
    const [transactions, total] = await Promise.all([
      prisma.financialTransaction.findMany({
        where,
        include: {
          store: {
            select: {
              name: true,
              subdomain: true
            }
          }
        },
        orderBy: {
          transactionDate: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.financialTransaction.count({ where })
    ])

    // Format response
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      storeId: transaction.storeId,
      storeName: transaction.store.name,
      type: transaction.type,
      category: transaction.category,
      amount: Number(transaction.amount),
      description: transaction.description,
      reference: transaction.reference,
      tags: transaction.tags,
      transactionDate: transaction.transactionDate.toISOString(),
      createdAt: transaction.createdAt.toISOString()
    }))

    const response = {
      transactions: formattedTransactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}