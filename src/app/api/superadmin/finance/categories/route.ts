import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { TransactionCategory } from '@prisma/client'

/**
 * GET /api/superadmin/finance/categories - Get all transaction categories
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

    // Return all transaction categories from the enum
    const categories = Object.values(TransactionCategory)

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}