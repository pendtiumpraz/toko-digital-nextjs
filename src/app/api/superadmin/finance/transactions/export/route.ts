import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { TransactionType, TransactionCategory } from '@prisma/client'
import * as XLSX from 'xlsx'

/**
 * GET /api/superadmin/finance/transactions/export - Export financial transactions
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
    const search = searchParams.get('search')
    const type = searchParams.get('type') as TransactionType | null
    const category = searchParams.get('category') as TransactionCategory | null
    const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : null
    const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : null
    const storeId = searchParams.get('storeId')

    // Build where clause (same as the main transactions endpoint)
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

    // Fetch all matching transactions (no pagination for export)
    const transactions = await prisma.financialTransaction.findMany({
      where,
      include: {
        store: {
          select: {
            name: true,
            subdomain: true,
            owner: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        transactionDate: 'desc'
      }
    })

    // Prepare data for Excel export
    const excelData = transactions.map(transaction => ({
      'Transaction ID': transaction.id,
      'Store Name': transaction.store.name,
      'Store Subdomain': transaction.store.subdomain,
      'Store Owner': transaction.store.owner?.name || 'N/A',
      'Owner Email': transaction.store.owner?.email || 'N/A',
      'Type': transaction.type,
      'Category': transaction.category.replace(/_/g, ' '),
      'Amount (IDR)': Number(transaction.amount),
      'Description': transaction.description,
      'Reference': transaction.reference || '',
      'Tags': transaction.tags.join(', '),
      'Transaction Date': transaction.transactionDate.toLocaleDateString('id-ID'),
      'Created Date': transaction.createdAt.toLocaleDateString('id-ID'),
      'Recurring': transaction.isRecurring ? 'Yes' : 'No'
    }))

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Auto-size columns
    const colWidths = [
      { wch: 15 }, // Transaction ID
      { wch: 20 }, // Store Name
      { wch: 15 }, // Store Subdomain
      { wch: 20 }, // Store Owner
      { wch: 25 }, // Owner Email
      { wch: 10 }, // Type
      { wch: 20 }, // Category
      { wch: 15 }, // Amount
      { wch: 30 }, // Description
      { wch: 15 }, // Reference
      { wch: 20 }, // Tags
      { wch: 15 }, // Transaction Date
      { wch: 15 }, // Created Date
      { wch: 10 }  // Recurring
    ]
    worksheet['!cols'] = colWidths

    // Add summary sheet
    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const totalExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const summaryData = [
      ['Financial Transactions Summary', '', ''],
      ['Export Date', new Date().toLocaleDateString('id-ID'), ''],
      ['Date Range', dateFrom ? dateFrom.toLocaleDateString('id-ID') : 'All', dateTo ? dateTo.toLocaleDateString('id-ID') : 'All'],
      ['', '', ''],
      ['Total Transactions', transactions.length, ''],
      ['Total Income', totalIncome, 'IDR'],
      ['Total Expenses', totalExpenses, 'IDR'],
      ['Net Amount', totalIncome - totalExpenses, 'IDR'],
      ['', '', ''],
      ['Income Transactions', transactions.filter(t => t.type === 'INCOME').length, ''],
      ['Expense Transactions', transactions.filter(t => t.type === 'EXPENSE').length, ''],
    ]

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)

    // Add sheets to workbook
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions')

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Create filename with current date and filters
    let filename = `transactions-${new Date().toISOString().split('T')[0]}`
    if (type && type !== 'ALL') filename += `-${type.toLowerCase()}`
    if (category) filename += `-${category.toLowerCase()}`
    filename += '.xlsx'

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Error exporting transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}