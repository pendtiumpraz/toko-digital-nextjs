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
    const period = searchParams.get('period') || 'week'; // today, week, month, year

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        previousStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
        previousEndDate = startDate;
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        startDate = weekStart;
        previousStartDate = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousEndDate = weekStart;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEndDate = startDate;
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
        previousEndDate = startDate;
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousEndDate = startDate;
    }

    // Fetch current period stats
    const [
      currentRevenue,
      currentOrders,
      currentCustomers,
      previousRevenue,
      previousOrders,
      previousCustomers,
      recentOrders,
      topProducts,
      totalCustomers
    ] = await Promise.all([
      // Current period revenue
      prisma.order.aggregate({
        where: {
          storeId: user.storeId,
          paymentStatus: PaymentStatus.PAID,
          createdAt: { gte: startDate }
        },
        _sum: { total: true },
        _count: true
      }),

      // Current period orders count
      prisma.order.count({
        where: {
          storeId: user.storeId,
          createdAt: { gte: startDate }
        }
      }),

      // Current period new customers
      prisma.customer.count({
        where: {
          storeId: user.storeId,
          createdAt: { gte: startDate }
        }
      }),

      // Previous period revenue
      prisma.order.aggregate({
        where: {
          storeId: user.storeId,
          paymentStatus: PaymentStatus.PAID,
          createdAt: {
            gte: previousStartDate,
            lt: previousEndDate
          }
        },
        _sum: { total: true }
      }),

      // Previous period orders count
      prisma.order.count({
        where: {
          storeId: user.storeId,
          createdAt: {
            gte: previousStartDate,
            lt: previousEndDate
          }
        }
      }),

      // Previous period new customers
      prisma.customer.count({
        where: {
          storeId: user.storeId,
          createdAt: {
            gte: previousStartDate,
            lt: previousEndDate
          }
        }
      }),

      // Recent orders (last 5)
      prisma.order.findMany({
        where: {
          storeId: user.storeId
        },
        include: {
          customer: {
            select: {
              name: true,
              phone: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),

      // Top products by quantity sold
      prisma.orderItem.groupBy({
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
        take: 5
      }),

      // Total customers count
      prisma.customer.count({
        where: {
          storeId: user.storeId
        }
      })
    ]);

    // Get product stock info for top products
    const topProductsWithStock = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { stock: true }
        });
        return {
          name: item.name,
          sold: item._sum.quantity || 0,
          revenue: item._sum.subtotal?.toNumber() || 0,
          stock: product?.stock || 0
        };
      })
    );

    // Calculate conversion rate (orders vs total visitors)
    // For now, we'll use a simple calculation: orders / (orders * 10) to simulate traffic
    const totalVisits = Math.max(currentOrders * 10, 100); // Simulate traffic data
    const conversionRate = currentOrders > 0 ? (currentOrders / totalVisits) * 100 : 0;
    const previousConversionRate = previousOrders > 0 ? (previousOrders / Math.max(previousOrders * 10, 100)) * 100 : 0;

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const currentRevenueAmount = currentRevenue._sum.total?.toNumber() || 0;
    const previousRevenueAmount = previousRevenue._sum.total?.toNumber() || 0;

    const revenueChange = calculateChange(currentRevenueAmount, previousRevenueAmount);
    const ordersChange = calculateChange(currentOrders, previousOrders);
    const customersChange = calculateChange(currentCustomers, previousCustomers);
    const conversionChange = calculateChange(conversionRate, previousConversionRate);

    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    // Format percentage
    const formatPercentage = (value: number) => {
      const sign = value > 0 ? '+' : '';
      return `${sign}${value.toFixed(1)}%`;
    };

    // Serialize recent orders
    const serializedRecentOrders = recentOrders.map(order => ({
      id: order.orderNumber,
      customer: order.customer?.name || order.customerName,
      total: formatCurrency(order.total.toNumber()),
      status: order.status.toLowerCase(),
      date: order.createdAt.toISOString().split('T')[0]
    }));

    const stats = {
      totalRevenue: {
        value: formatCurrency(currentRevenueAmount),
        change: formatPercentage(revenueChange),
        trend: revenueChange >= 0 ? 'up' : 'down',
        rawValue: currentRevenueAmount
      },
      totalOrders: {
        value: currentOrders.toString(),
        change: formatPercentage(ordersChange),
        trend: ordersChange >= 0 ? 'up' : 'down',
        rawValue: currentOrders
      },
      totalCustomers: {
        value: totalCustomers.toString(),
        change: formatPercentage(customersChange),
        trend: customersChange >= 0 ? 'up' : 'down',
        rawValue: totalCustomers
      },
      conversionRate: {
        value: `${conversionRate.toFixed(1)}%`,
        change: formatPercentage(conversionChange),
        trend: conversionChange >= 0 ? 'up' : 'down',
        rawValue: conversionRate
      },
      recentOrders: serializedRecentOrders,
      topProducts: topProductsWithStock,
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      }
    };

    return NextResponse.json(stats);
  } catch (error: unknown) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}