import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import * as XLSX from 'xlsx'

/**
 * GET /api/superadmin/finance/export - Export financial data as Excel or PDF
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
    const format = searchParams.get('format') || 'excel'
    const startDate = searchParams.get('start') ? new Date(searchParams.get('start')!) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const endDate = searchParams.get('end') ? new Date(searchParams.get('end')!) : new Date()

    // Set end date to end of day
    endDate.setHours(23, 59, 59, 999)

    // Fetch comprehensive financial data
    const [
      orderRevenue,
      subscriptionRevenue,
      financialTransactions,
      storePerformance,
      paymentMethods
    ] = await Promise.all([
      // Order revenue data
      prisma.order.findMany({
        where: {
          paymentStatus: 'PAID',
          paidAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          store: {
            select: {
              name: true,
              subdomain: true
            }
          }
        },
        orderBy: {
          paidAt: 'desc'
        }
      }),

      // Subscription revenue
      prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          lastPaymentDate: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          store: {
            select: {
              name: true,
              subdomain: true
            }
          }
        }
      }),

      // All financial transactions
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
              name: true,
              subdomain: true
            }
          }
        },
        orderBy: {
          transactionDate: 'desc'
        }
      }),

      // Store performance summary
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
              totalProfit: true,
              paidAt: true
            }
          },
          subscription: {
            select: {
              plan: true,
              price: true
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
      })
    ])

    if (format === 'excel') {
      // Create Excel workbook
      const workbook = XLSX.utils.book_new()

      // Summary sheet
      const summaryData = []
      const totalOrderRevenue = orderRevenue.reduce((sum, order) => sum + Number(order.total), 0)
      const totalSubscriptionRevenue = subscriptionRevenue.reduce((sum, sub) => sum + Number(sub.price), 0)
      const totalRevenue = totalOrderRevenue + totalSubscriptionRevenue
      const totalProfit = orderRevenue.reduce((sum, order) => sum + Number(order.totalProfit || 0), 0)

      summaryData.push(['Financial Summary', '', ''])
      summaryData.push(['Period', `${startDate.toLocaleDateString('id-ID')} - ${endDate.toLocaleDateString('id-ID')}`, ''])
      summaryData.push(['', '', ''])
      summaryData.push(['Total Revenue', totalRevenue, 'IDR'])
      summaryData.push(['Order Revenue', totalOrderRevenue, 'IDR'])
      summaryData.push(['Subscription Revenue', totalSubscriptionRevenue, 'IDR'])
      summaryData.push(['Total Profit', totalProfit, 'IDR'])
      summaryData.push(['Total Orders', orderRevenue.length, 'orders'])
      summaryData.push(['Active Stores', storePerformance.length, 'stores'])

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

      // Order revenue sheet
      const orderData = orderRevenue.map(order => ({
        'Order ID': order.orderNumber,
        'Store Name': order.store.name,
        'Store Subdomain': order.store.subdomain,
        'Customer Name': order.customerName,
        'Total Amount': Number(order.total),
        'Profit': Number(order.totalProfit || 0),
        'Payment Method': order.paymentMethod,
        'Payment Status': order.paymentStatus,
        'Order Date': order.createdAt.toLocaleDateString('id-ID'),
        'Paid Date': order.paidAt ? order.paidAt.toLocaleDateString('id-ID') : 'Not Paid'
      }))

      if (orderData.length > 0) {
        const orderSheet = XLSX.utils.json_to_sheet(orderData)
        XLSX.utils.book_append_sheet(workbook, orderSheet, 'Order Revenue')
      }

      // Subscription revenue sheet
      const subscriptionData = subscriptionRevenue.map(sub => ({
        'User Name': sub.user.name,
        'User Email': sub.user.email,
        'Store Name': sub.store?.name || 'No Store',
        'Plan': sub.plan,
        'Price': Number(sub.price),
        'Billing Cycle': sub.billingCycle,
        'Status': sub.status,
        'Start Date': sub.startDate ? sub.startDate.toLocaleDateString('id-ID') : 'Not Started',
        'Last Payment': sub.lastPaymentDate ? sub.lastPaymentDate.toLocaleDateString('id-ID') : 'No Payment'
      }))

      if (subscriptionData.length > 0) {
        const subscriptionSheet = XLSX.utils.json_to_sheet(subscriptionData)
        XLSX.utils.book_append_sheet(workbook, subscriptionSheet, 'Subscriptions')
      }

      // Financial transactions sheet
      const transactionData = financialTransactions.map(transaction => ({
        'Transaction ID': transaction.id,
        'Store Name': transaction.store.name,
        'Type': transaction.type,
        'Category': transaction.category.replace(/_/g, ' '),
        'Amount': Number(transaction.amount),
        'Description': transaction.description,
        'Reference': transaction.reference || '',
        'Date': transaction.transactionDate.toLocaleDateString('id-ID'),
        'Tags': transaction.tags.join(', ')
      }))

      if (transactionData.length > 0) {
        const transactionSheet = XLSX.utils.json_to_sheet(transactionData)
        XLSX.utils.book_append_sheet(workbook, transactionSheet, 'Transactions')
      }

      // Store performance sheet
      const storeData = storePerformance.map(store => {
        const storeRevenue = store.orders.reduce((sum, order) => sum + Number(order.total), 0)
        const storeProfit = store.orders.reduce((sum, order) => sum + Number(order.totalProfit || 0), 0)

        return {
          'Store Name': store.name,
          'Subdomain': store.subdomain,
          'Revenue': storeRevenue,
          'Profit': storeProfit,
          'Orders Count': store.orders.length,
          'Subscription Plan': store.subscription?.plan || 'FREE',
          'Subscription Price': store.subscription ? Number(store.subscription.price) : 0,
          'Average Order Value': store.orders.length > 0 ? storeRevenue / store.orders.length : 0,
          'Profit Margin': storeRevenue > 0 ? ((storeProfit / storeRevenue) * 100).toFixed(2) + '%' : '0%'
        }
      })

      if (storeData.length > 0) {
        const storeSheet = XLSX.utils.json_to_sheet(storeData)
        XLSX.utils.book_append_sheet(workbook, storeSheet, 'Store Performance')
      }

      // Payment methods sheet
      const paymentData = paymentMethods.map(method => ({
        'Payment Method': method.paymentMethod.replace(/_/g, ' '),
        'Total Amount': Number(method._sum.total || 0),
        'Transaction Count': method._count,
        'Average Amount': method._count > 0 ? Number(method._sum.total || 0) / method._count : 0
      }))

      if (paymentData.length > 0) {
        const paymentSheet = XLSX.utils.json_to_sheet(paymentData)
        XLSX.utils.book_append_sheet(workbook, paymentSheet, 'Payment Methods')
      }

      // Generate Excel buffer
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="financial-report-${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}.xlsx"`
        }
      })
    }

    // For now, return error for PDF as it requires additional setup
    if (format === 'pdf') {
      return NextResponse.json(
        { error: 'PDF export not yet implemented' },
        { status: 501 }
      )
    }

    return NextResponse.json(
      { error: 'Invalid format. Supported formats: excel, pdf' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error exporting financial data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}