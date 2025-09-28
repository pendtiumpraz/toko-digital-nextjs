import { NextRequest, NextResponse } from 'next/server'
import { withTenantIsolation } from '@/lib/tenant'
import { getDashboardStats } from '@/lib/financial'

/**
 * GET /api/financial/dashboard - Get financial dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    return await withTenantIsolation(request, async (context) => {
      const stats = await getDashboardStats(context.storeId)
      return NextResponse.json(stats)
    })
  } catch (error) {
    console.error('Error getting financial dashboard stats:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}