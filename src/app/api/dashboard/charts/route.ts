import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser, createUnauthorizedResponse } from '@/lib/auth-middleware';
import { PaymentStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);
    if (!user || !user.storeId) {
      return createUnauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week'; // week, month, quarter, year
    const type = searchParams.get('type') || 'all'; // revenue, orders, products, customers

    // Calculate date range and interval
    const now = new Date();
    let startDate: Date;
    let interval: 'day' | 'week' | 'month';
    let dateFormat: string;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        interval = 'day';
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        interval = 'day';
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        interval = 'week';
        dateFormat = 'YYYY-"W"WW';
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        interval = 'month';
        dateFormat = 'YYYY-MM';
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        interval = 'day';
        dateFormat = 'YYYY-MM-DD';
    }

    const charts: any = {};

    // Revenue over time chart
    if (type === 'all' || type === 'revenue') {
      const revenueData = await prisma.$queryRaw`
        SELECT
          DATE_TRUNC(${interval}, "createdAt") as date,
          SUM("total")::FLOAT as revenue,
          COUNT(*) as orders
        FROM "Order"
        WHERE "storeId" = ${user.storeId}
          AND "paymentStatus" = ${PaymentStatus.PAID}
          AND "createdAt" >= ${startDate}
        GROUP BY DATE_TRUNC(${interval}, "createdAt")
        ORDER BY date ASC
      `;

      charts.revenue = {
        labels: (revenueData as any[]).map(item => {
          const date = new Date(item.date);
          if (interval === 'day') {
            return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
          } else if (interval === 'week') {
            return `Week ${Math.ceil(date.getDate() / 7)}`;
          } else {
            return date.toLocaleDateString('id-ID', { month: 'short' });
          }
        }),
        datasets: [
          {
            label: 'Revenue',
            data: (revenueData as any[]).map(item => item.revenue || 0),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4
          }
        ]
      };
    }

    // Orders over time chart
    if (type === 'all' || type === 'orders') {
      const ordersData = await prisma.$queryRaw`
        SELECT
          DATE_TRUNC(${interval}, "createdAt") as date,
          COUNT(*) as orders,
          SUM(CASE WHEN "paymentStatus" = ${PaymentStatus.PAID} THEN 1 ELSE 0 END) as paid_orders,
          SUM(CASE WHEN "paymentStatus" = 'PENDING' THEN 1 ELSE 0 END) as pending_orders
        FROM "Order"
        WHERE "storeId" = ${user.storeId}
          AND "createdAt" >= ${startDate}
        GROUP BY DATE_TRUNC(${interval}, "createdAt")
        ORDER BY date ASC
      `;

      charts.orders = {
        labels: (ordersData as any[]).map(item => {
          const date = new Date(item.date);
          if (interval === 'day') {
            return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
          } else if (interval === 'week') {
            return `Week ${Math.ceil(date.getDate() / 7)}`;
          } else {
            return date.toLocaleDateString('id-ID', { month: 'short' });
          }
        }),
        datasets: [
          {
            label: 'Total Orders',
            data: (ordersData as any[]).map(item => Number(item.orders) || 0),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          },
          {
            label: 'Paid Orders',
            data: (ordersData as any[]).map(item => Number(item.paid_orders) || 0),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4
          }
        ]
      };
    }

    // Top products chart
    if (type === 'all' || type === 'products') {
      const topProductsData = await prisma.orderItem.groupBy({
        by: ['productId', 'name'],
        where: {
          order: {
            storeId: user.storeId,
            paymentStatus: PaymentStatus.PAID,
            createdAt: { gte: startDate }
          }
        },
        _sum: {
          quantity: true,
          subtotal: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 10
      });

      charts.topProducts = {
        labels: topProductsData.map(item => item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name),
        datasets: [
          {
            label: 'Quantity Sold',
            data: topProductsData.map(item => item._sum.quantity || 0),
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(34, 197, 94, 0.8)',
              'rgba(251, 191, 36, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(168, 85, 247, 0.8)',
              'rgba(236, 72, 153, 0.8)',
              'rgba(20, 184, 166, 0.8)',
              'rgba(245, 101, 101, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)'
            ],
            borderWidth: 1
          }
        ]
      };
    }

    // Customer segments chart
    if (type === 'all' || type === 'customers') {
      const customerSegments = await prisma.$queryRaw`
        SELECT
          CASE
            WHEN "totalSpent" = 0 THEN 'New Customers'
            WHEN "totalSpent" < 100000 THEN 'Low Value'
            WHEN "totalSpent" < 500000 THEN 'Medium Value'
            WHEN "totalSpent" < 1000000 THEN 'High Value'
            ELSE 'Premium'
          END as segment,
          COUNT(*) as count
        FROM "Customer"
        WHERE "storeId" = ${user.storeId}
        GROUP BY segment
        ORDER BY count DESC
      `;

      charts.customerSegments = {
        labels: (customerSegments as any[]).map(item => item.segment),
        datasets: [
          {
            data: (customerSegments as any[]).map(item => Number(item.count)),
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(34, 197, 94, 0.8)',
              'rgba(251, 191, 36, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(168, 85, 247, 0.8)'
            ],
            borderWidth: 1
          }
        ]
      };
    }

    // Order status distribution
    if (type === 'all' || type === 'orderStatus') {
      const orderStatusData = await prisma.order.groupBy({
        by: ['status'],
        where: {
          storeId: user.storeId,
          createdAt: { gte: startDate }
        },
        _count: true,
        orderBy: {
          _count: {
            status: 'desc'
          }
        }
      });

      charts.orderStatus = {
        labels: orderStatusData.map(item => {
          const statusMap: { [key: string]: string } = {
            'PENDING': 'Pending',
            'CONFIRMED': 'Confirmed',
            'PROCESSING': 'Processing',
            'SHIPPED': 'Shipped',
            'DELIVERED': 'Delivered',
            'COMPLETED': 'Completed',
            'CANCELLED': 'Cancelled',
            'REFUNDED': 'Refunded'
          };
          return statusMap[item.status] || item.status;
        }),
        datasets: [
          {
            data: orderStatusData.map(item => item._count),
            backgroundColor: [
              'rgba(251, 191, 36, 0.8)', // Pending - Yellow
              'rgba(59, 130, 246, 0.8)', // Confirmed - Blue
              'rgba(168, 85, 247, 0.8)', // Processing - Purple
              'rgba(20, 184, 166, 0.8)', // Shipped - Teal
              'rgba(34, 197, 94, 0.8)', // Delivered - Green
              'rgba(16, 185, 129, 0.8)', // Completed - Emerald
              'rgba(239, 68, 68, 0.8)', // Cancelled - Red
              'rgba(245, 101, 101, 0.8)' // Refunded - Light Red
            ],
            borderWidth: 1
          }
        ]
      };
    }

    return NextResponse.json({
      charts,
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      }
    });
  } catch (error: unknown) {
    console.error('Error fetching dashboard charts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard charts' },
      { status: 500 }
    );
  }
}