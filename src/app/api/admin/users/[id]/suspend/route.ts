import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth, getRequestMetadata, deactivateUser } from '@/lib/admin'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * POST /api/admin/users/[id]/suspend - Suspend a user
 */
export async function POST(
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

    const { user: admin } = authResult
    const { id: userId } = params

    // Get request metadata for logging
    const { ipAddress, userAgent } = getRequestMetadata(request)

    // Parse request body for optional reason
    const body = await request.json().catch(() => ({}))
    const { reason } = body

    // Validate user ID
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Use existing deactivateUser function to suspend the user
    const result = await deactivateUser(
      admin.id,
      userId,
      reason || 'User suspended by admin',
      ipAddress,
      userAgent
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      })
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error suspending user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}