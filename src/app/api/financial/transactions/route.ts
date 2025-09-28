import { NextRequest, NextResponse } from 'next/server'
import { withTenantIsolation } from '@/lib/tenant'
import { createTransaction, getTransactions, updateTransaction, deleteTransaction } from '@/lib/financial'
import { TransactionType, TransactionCategory } from '@prisma/client'

/**
 * GET /api/financial/transactions - Get financial transactions
 */
export async function GET(request: NextRequest) {
  try {
    return await withTenantIsolation(request, async (context) => {
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '20')
      const type = searchParams.get('type') as TransactionType | undefined
      const category = searchParams.get('category') as TransactionCategory | undefined
      const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined
      const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined
      const search = searchParams.get('search') || undefined
      const tags = searchParams.get('tags')?.split(',').filter(Boolean) || undefined

      const result = await getTransactions(context.storeId, page, limit, {
        type,
        category,
        dateFrom,
        dateTo,
        search,
        tags
      })

      return NextResponse.json(result)
    })
  } catch (error) {
    console.error('Error getting transactions:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/financial/transactions - Create financial transaction
 */
export async function POST(request: NextRequest) {
  try {
    return await withTenantIsolation(request, async (context) => {
      const body = await request.json()
      const {
        type,
        category,
        amount,
        description,
        reference,
        tags,
        transactionDate
      } = body

      // Validation
      if (!type || !category || !amount || !description) {
        return NextResponse.json(
          { error: 'Missing required fields: type, category, amount, description' },
          { status: 400 }
        )
      }

      if (amount <= 0) {
        return NextResponse.json(
          { error: 'Amount must be greater than 0' },
          { status: 400 }
        )
      }

      const transaction = await createTransaction(context.storeId, {
        type,
        category,
        amount,
        description,
        reference,
        tags,
        transactionDate: transactionDate ? new Date(transactionDate) : undefined
      })

      return NextResponse.json(transaction, { status: 201 })
    })
  } catch (error) {
    console.error('Error creating transaction:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}