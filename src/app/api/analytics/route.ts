import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, createUnauthorizedResponse } from '@/lib/auth-middleware'
import { getAnalyticsSummary, getAnalyticsTrend, recordAnalyticsSnapshot } from '@/lib/analytics'
import { AnalyticsPeriod } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request)
    if (!user || !user.storeId) {
      return createUnauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'summary'
    const period = (searchParams.get('period') || 'DAILY') as AnalyticsPeriod
    const numberOfPeriods = parseInt(searchParams.get('periods') || '7')

    switch (action) {
      case 'summary':
        const summary = await getAnalyticsSummary(user.storeId, period)
        return NextResponse.json(summary)

      case 'trend':
        const trend = await getAnalyticsTrend(user.storeId, period, numberOfPeriods)
        return NextResponse.json({
          data: trend,
          period,
          numberOfPeriods
        })

      case 'record':
        await recordAnalyticsSnapshot(user.storeId, new Date(), period)
        return NextResponse.json({ success: true, message: 'Analytics recorded' })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: summary, trend, or record' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in analytics API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request)
    if (!user || !user.storeId) {
      return createUnauthorizedResponse()
    }

    const body = await request.json()
    const { period = 'DAILY', date } = body

    const recordDate = date ? new Date(date) : new Date()

    await recordAnalyticsSnapshot(user.storeId, recordDate, period as AnalyticsPeriod)

    return NextResponse.json({
      success: true,
      message: 'Analytics snapshot recorded successfully'
    })
  } catch (error) {
    console.error('Error recording analytics:', error)
    return NextResponse.json(
      { error: 'Failed to record analytics snapshot' },
      { status: 500 }
    )
  }
}