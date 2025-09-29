import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminActivity } from '@/lib/admin'
import { AdminAction } from '@prisma/client'

/**
 * GET /api/admin/users - Get all users for admin management
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
    const role = searchParams.get('role') || undefined

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    // Exclude super admin users for regular admins
    if (admin.role === 'ADMIN') {
      where.role = { not: 'SUPER_ADMIN' }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status === 'active') {
      where.isActive = true
    } else if (status === 'inactive') {
      where.isActive = false
    }

    if (role && role !== 'all') {
      where.role = role.toUpperCase()
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          store: {
            select: {
              id: true,
              name: true,
              subdomain: true,
              isActive: true,
              totalOrders: true,
              totalRevenue: true
            }
          },
          subscription: {
            select: {
              plan: true,
              status: true,
              trialEndDate: true,
              endDate: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error getting users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/users - Admin actions on users
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
    const { action, userId, reason } = body

    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, isActive: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent regular admins from modifying super admins
    if (admin.role === 'ADMIN' && targetUser.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Cannot modify super admin user' }, { status: 403 })
    }

    let result
    let actionType: AdminAction

    switch (action) {
      case 'suspend':
        if (!targetUser.isActive) {
          return NextResponse.json({ error: 'User is already suspended' }, { status: 400 })
        }

        await prisma.user.update({
          where: { id: userId },
          data: { isActive: false }
        })

        actionType = AdminAction.USER_DEACTIVATED
        result = { success: true, message: 'User suspended successfully' }
        break

      case 'activate':
        if (targetUser.isActive) {
          return NextResponse.json({ error: 'User is already active' }, { status: 400 })
        }

        await prisma.user.update({
          where: { id: userId },
          data: { isActive: true }
        })

        actionType = AdminAction.USER_ACTIVATED
        result = { success: true, message: 'User activated successfully' }
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Log admin activity
    await logAdminActivity(
      decoded.userId,
      actionType,
      'user',
      userId,
      `${action} user: ${targetUser.name} (${targetUser.email})${reason ? `. Reason: ${reason}` : ''}`,
      { userId, userName: targetUser.name, userEmail: targetUser.email, reason },
      ipAddress,
      userAgent
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error performing user action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}