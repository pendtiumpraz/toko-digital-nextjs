import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth, getRequestMetadata } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

interface StoreDetails {
  id: string
  name: string
  subdomain: string
  description?: string
  logo?: string
  banner?: string
  whatsappNumber: string
  email?: string
  isActive: boolean
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
  owner: {
    id: string
    name: string
    email: string
    phone: string
    isActive: boolean
    createdAt: Date
    lastLogin?: Date
    subscription?: {
      id: string
      plan: string
      status: string
      startDate?: Date
      endDate?: Date
      trialEndDate: Date
      price: number
      billingCycle: string
    }
  }
  analytics: {
    totalOrders: number
    completedOrders: number
    pendingOrders: number
    totalRevenue: number
    monthlyRevenue: number
    weeklyOrders: number
    averageOrderValue: number
    totalProducts: number
    activeProducts: number
    totalCustomers: number
    conversionRate: number
    topProducts: Array<{
      id: string
      name: string
      price: number
      soldQuantity: number
      revenue: number
      image?: string
    }>
  }
  recentOrders: Array<{
    id: string
    orderNumber: string
    customerName: string
    total: number
    status: string
    createdAt: Date
  }>
  recentProducts: Array<{
    id: string
    name: string
    price: number
    stock: number
    isActive: boolean
    createdAt: Date
  }>
  settings: {
    currency: string
    primaryColor: string
    secondaryColor: string
    fontFamily: string
    layout: string
  }
}

/**
 * GET /api/admin/stores/[id] - Get detailed store information with analytics
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.error === 'Forbidden' ? 403 : 401 }
      )
    }

    const { id: storeId } = params

    // Validate store ID
    if (!storeId) {
      return NextResponse.json(
        { error: 'Store ID is required' },
        { status: 400 }
      )
    }

    // Fetch detailed store information
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
            createdAt: true,
            lastLogin: true,
            subscription: {
              select: {
                id: true,
                plan: true,
                status: true,
                startDate: true,
                endDate: true,
                trialEndDate: true,
                price: true,
                billingCycle: true
              }
            }
          }
        },
        _count: {
          select: {
            products: true,
            orders: true,
            customers: true
          }
        }
      }
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    // Calculate date ranges
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Get analytics data
    const [
      totalRevenue,
      completedOrders,
      pendingOrders,
      monthlyRevenue,
      weeklyOrders,
      averageOrderValue,
      activeProductsCount,
      recentOrders,
      recentProducts,
      topProductsData
    ] = await Promise.all([
      // Total revenue
      prisma.order.aggregate({
        where: {
          storeId,
          status: { in: ['COMPLETED', 'DELIVERED'] }
        },
        _sum: { total: true }
      }),

      // Completed orders count
      prisma.order.count({
        where: {
          storeId,
          status: { in: ['COMPLETED', 'DELIVERED'] }
        }
      }),

      // Pending orders count
      prisma.order.count({
        where: {
          storeId,
          status: { in: ['PENDING', 'PROCESSING', 'CONFIRMED', 'SHIPPED'] }
        }
      }),

      // Monthly revenue (last 30 days)
      prisma.order.aggregate({
        where: {
          storeId,
          status: { in: ['COMPLETED', 'DELIVERED'] },
          createdAt: { gte: thirtyDaysAgo }
        },
        _sum: { total: true }
      }),

      // Weekly orders (last 7 days)
      prisma.order.count({
        where: {
          storeId,
          createdAt: { gte: sevenDaysAgo }
        }
      }),

      // Average order value
      prisma.order.aggregate({
        where: {
          storeId,
          status: { in: ['COMPLETED', 'DELIVERED'] }
        },
        _avg: { total: true }
      }),

      // Active products count
      prisma.product.count({
        where: {
          storeId,
          isActive: true
        }
      }),

      // Recent orders
      prisma.order.findMany({
        where: { storeId },
        include: {
          customer: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      // Recent products
      prisma.product.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          isActive: true,
          createdAt: true
        }
      }),

      // Top selling products
      prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            storeId,
            status: { in: ['COMPLETED', 'DELIVERED'] }
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
      })
    ])

    // Get product details for top products
    const topProducts = await Promise.all(
      topProductsData.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            price: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true }
            }
          }
        })

        return {
          id: product?.id || '',
          name: product?.name || 'Unknown Product',
          price: Number(product?.price || 0),
          soldQuantity: item._sum.quantity || 0,
          revenue: Number(item._sum.subtotal || 0),
          image: product?.images[0]?.url
        }
      })
    )

    // Calculate conversion rate (estimated)
    const monthlyVisitors = store.monthlyVisits || Math.max(weeklyOrders * 20, 100)
    const conversionRate = monthlyVisitors > 0 ? (weeklyOrders / monthlyVisitors) * 100 : 0

    // Format response data
    const storeDetails: StoreDetails = {
      id: store.id,
      name: store.name,
      subdomain: store.subdomain,
      description: store.description || undefined,
      logo: store.logo || undefined,
      banner: store.banner || undefined,
      whatsappNumber: store.whatsappNumber,
      email: store.email || undefined,
      isActive: store.isActive,
      isVerified: store.isVerified,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
      owner: {
        ...store.owner,
        subscription: store.owner.subscription ? {
          ...store.owner.subscription,
          price: Number(store.owner.subscription.price)
        } : undefined
      },
      analytics: {
        totalOrders: store._count.orders,
        completedOrders,
        pendingOrders,
        totalRevenue: Number(totalRevenue._sum.total || 0),
        monthlyRevenue: Number(monthlyRevenue._sum.total || 0),
        weeklyOrders,
        averageOrderValue: Number(averageOrderValue._avg.total || 0),
        totalProducts: store._count.products,
        activeProducts: activeProductsCount,
        totalCustomers: store._count.customers,
        conversionRate: Math.round(conversionRate * 100) / 100,
        topProducts
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customer?.name || order.customerName,
        total: Number(order.total),
        status: order.status,
        createdAt: order.createdAt
      })),
      recentProducts: recentProducts.map(product => ({
        ...product,
        price: Number(product.price)
      })),
      settings: {
        currency: store.currency,
        primaryColor: store.primaryColor,
        secondaryColor: store.secondaryColor,
        fontFamily: store.fontFamily,
        layout: store.layout
      }
    }

    return NextResponse.json({
      success: true,
      data: storeDetails
    })

  } catch (error) {
    console.error('Error getting store details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}