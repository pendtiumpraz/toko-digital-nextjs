import { NextRequest, NextResponse } from 'next/server'
import { withTenantIsolation } from '@/lib/tenant'
import { generateFinancialReport, getFinancialSummary, getCategoryBreakdown, getMonthlyTrends } from '@/lib/financial'
import { TransactionType } from '@prisma/client'

/**
 * GET /api/financial/reports - Generate financial reports
 */
export async function GET(request: NextRequest) {
  try {
    return await withTenantIsolation(request, async (context) => {
      const { searchParams } = new URL(request.url)
      const reportType = searchParams.get('type') || 'comprehensive'
      const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined
      const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined
      const period = searchParams.get('period') || 'month' // month, quarter, year, custom

      // Default date ranges based on period
      let defaultStartDate: Date
      let defaultEndDate: Date = new Date()

      switch (period) {
        case 'month':
          defaultStartDate = new Date()
          defaultStartDate.setMonth(defaultStartDate.getMonth() - 1)
          break
        case 'quarter':
          defaultStartDate = new Date()
          defaultStartDate.setMonth(defaultStartDate.getMonth() - 3)
          break
        case 'year':
          defaultStartDate = new Date()
          defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 1)
          break
        case 'custom':
          if (!startDate || !endDate) {
            return NextResponse.json(
              { error: 'Start date and end date are required for custom period' },
              { status: 400 }
            )
          }
          defaultStartDate = startDate
          defaultEndDate = endDate
          break
        default:
          defaultStartDate = new Date()
          defaultStartDate.setMonth(defaultStartDate.getMonth() - 1)
      }

      const reportStartDate = startDate || defaultStartDate
      const reportEndDate = endDate || defaultEndDate

      let result

      switch (reportType) {
        case 'comprehensive':
          result = await generateFinancialReport(context.storeId, reportStartDate, reportEndDate)
          break

        case 'summary':
          result = await getFinancialSummary(context.storeId, reportStartDate, reportEndDate)
          break

        case 'category_breakdown':
          const type = searchParams.get('transactionType') as TransactionType | undefined
          result = await getCategoryBreakdown(context.storeId, reportStartDate, reportEndDate, type)
          break

        case 'monthly_trends':
          const months = parseInt(searchParams.get('months') || '12')
          result = await getMonthlyTrends(context.storeId, months)
          break

        default:
          return NextResponse.json(
            { error: 'Invalid report type. Available types: comprehensive, summary, category_breakdown, monthly_trends' },
            { status: 400 }
          )
      }

      return NextResponse.json({
        reportType,
        period: {
          start: reportStartDate,
          end: reportEndDate,
          type: period
        },
        data: result
      })
    })
  } catch (error) {
    console.error('Error generating financial report:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}