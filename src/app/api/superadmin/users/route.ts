import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getUsers, activateUser, deactivateUser, extendTrialPeriod } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/superadmin/users - Get all users with filters
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

    // Verify super admin role
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!admin || admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const role = searchParams.get('role') || undefined
    const isActive = searchParams.get('active') === 'true' ? true :
                    searchParams.get('active') === 'false' ? false : undefined
    const search = searchParams.get('search') || undefined
    const hasStore = searchParams.get('hasStore') === 'true' ? true :
                    searchParams.get('hasStore') === 'false' ? false : undefined
    const trialStatus = searchParams.get('trialStatus') as 'active' | 'expired' | 'ending_soon' | undefined
    const subscriptionStatus = searchParams.get('subscriptionStatus') || undefined

    const result = await getUsers(page, limit, {
      role,
      isActive,
      search,
      hasStore,
      trialStatus,
      subscriptionStatus
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error getting users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/superadmin/users - Admin actions on users
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

    // Verify super admin role
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!admin || admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { action, userId, additionalDays, reason } = body

    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    let result

    switch (action) {
      case 'activate':
        result = await activateUser(decoded.userId, userId, ipAddress, userAgent)
        break

      case 'deactivate':
        result = await deactivateUser(decoded.userId, userId, reason, ipAddress, userAgent)
        break

      case 'extend_trial':
        if (!additionalDays || additionalDays <= 0) {
          return NextResponse.json(
            { error: 'Additional days must be provided and greater than 0' },
            { status: 400 }
          )
        }
        result = await extendTrialPeriod(decoded.userId, userId, additionalDays, reason, ipAddress, userAgent)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    if (result.success) {
      return NextResponse.json({ message: result.message })
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error performing user action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}