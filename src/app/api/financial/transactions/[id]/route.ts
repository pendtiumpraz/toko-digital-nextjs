import { NextRequest, NextResponse } from 'next/server'
import { withTenantIsolation } from '@/lib/tenant'
import { updateTransaction, deleteTransaction } from '@/lib/financial'

/**
 * PUT /api/financial/transactions/[id] - Update financial transaction
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      if (amount !== undefined && amount <= 0) {
        return NextResponse.json(
          { error: 'Amount must be greater than 0' },
          { status: 400 }
        )
      }

      const transaction = await updateTransaction(context.storeId, params.id, {
        type,
        category,
        amount,
        description,
        reference,
        tags,
        transactionDate: transactionDate ? new Date(transactionDate) : undefined
      })

      return NextResponse.json(transaction)
    })
  } catch (error) {
    console.error('Error updating transaction:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/financial/transactions/[id] - Delete financial transaction
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    return await withTenantIsolation(request, async (context) => {
      await deleteTransaction(context.storeId, params.id)
      return NextResponse.json({ message: 'Transaction deleted successfully' })
    })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}