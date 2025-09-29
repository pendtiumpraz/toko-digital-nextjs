import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth, getRequestMetadata, activateUser } from '@/lib/admin'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * POST /api/admin/users/[id]/activate - Activate a user
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

    // Validate user ID
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Use existing activateUser function to activate the user
    const result = await activateUser(
      admin.id,
      userId,
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
    console.error('Error activating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}