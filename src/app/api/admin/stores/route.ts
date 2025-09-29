import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminActivity } from '@/lib/admin'
import { AdminAction } from '@prisma/client'

/**
 * GET /api/admin/stores - Get all stores for admin management
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Verify admin role
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || undefined
    const status = searchParams.get('status') || undefined // 'active', 'inactive'
    const verified = searchParams.get('verified') || undefined // 'true', 'false'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subdomain: { contains: search, mode: 'insensitive' } },
        { owner: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }}
      ]
    }

    if (status === 'active') {
      where.isActive = true
    } else if (status === 'inactive') {
      where.isActive = false
    }

    if (verified === 'true') {
      where.isVerified = true
    } else if (verified === 'false') {
      where.isVerified = false
    }

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true
            }
          },
          subscription: {
            select: {
              plan: true,
              status: true,
              trialEndDate: true,
              endDate: true
            }
          },
          _count: {
            select: {
              products: true,
              orders: true,
              customers: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.store.count({ where })
    ])

    // Add computed analytics to each store
    const storesWithAnalytics = stores.map(store => ({
      ...store,
      analytics: {
        totalProducts: store._count.products,
        totalOrders: store._count.orders,
        totalCustomers: store._count.customers,
        totalRevenue: Number(store.totalRevenue)
      }
    }))

    return NextResponse.json({
      stores: storesWithAnalytics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error getting stores:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/stores - Admin actions on stores
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Verify admin role
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { action, storeId, reason } = body

    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Get target store
    const targetStore = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!targetStore) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    let result
    let actionType: AdminAction

    switch (action) {
      case 'suspend':
        if (!targetStore.isActive) {
          return NextResponse.json({ error: 'Store is already suspended' }, { status: 400 })
        }

        await prisma.store.update({
          where: { id: storeId },
          data: { isActive: false }
        })

        actionType = AdminAction.STORE_SUSPENDED
        result = { success: true, message: 'Store suspended successfully' }
        break

      case 'activate':
        if (targetStore.isActive) {
          return NextResponse.json({ error: 'Store is already active' }, { status: 400 })
        }

        await prisma.store.update({
          where: { id: storeId },
          data: { isActive: true }
        })

        actionType = AdminAction.STORE_VERIFIED
        result = { success: true, message: 'Store activated successfully' }
        break

      case 'verify':
        if (targetStore.isVerified) {
          return NextResponse.json({ error: 'Store is already verified' }, { status: 400 })
        }

        await prisma.store.update({
          where: { id: storeId },
          data: { isVerified: true }
        })

        actionType = AdminAction.STORE_VERIFIED
        result = { success: true, message: 'Store verified successfully' }
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Log admin activity
    await logAdminActivity(
      decoded.userId,
      actionType,
      'store',
      storeId,
      `${action} store: ${targetStore.name} (${targetStore.subdomain}) owned by ${targetStore.owner.name}${reason ? `. Reason: ${reason}` : ''}`,
      {
        storeId,
        storeName: targetStore.name,
        storeSubdomain: targetStore.subdomain,
        ownerId: targetStore.owner.id,
        ownerName: targetStore.owner.name,
        ownerEmail: targetStore.owner.email,
        reason
      },
      ipAddress,
      userAgent
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error performing store action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}