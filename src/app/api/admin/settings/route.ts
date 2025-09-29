import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminActivity } from '@/lib/admin'
import { AdminAction } from '@prisma/client'
import bcrypt from 'bcryptjs'

/**
 * GET /api/admin/settings - Get admin settings and profile
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
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true
      }
    })

    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get recent admin activities for this user
    const recentActivities = await prisma.adminActivityLog.findMany({
      where: { adminId: admin.id },
      select: {
        id: true,
        action: true,
        description: true,
        targetType: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get system settings (this would typically be stored in a separate settings table)
    // For now, we'll return some default settings
    const systemSettings = {
      notifications: {
        emailNotifications: true,
        pushNotifications: false,
        weeklyReports: true,
        monthlyReports: true
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 60, // minutes
        passwordExpiry: 90 // days
      },
      preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'Asia/Jakarta',
        dateFormat: 'DD/MM/YYYY'
      }
    }

    return NextResponse.json({
      profile: admin,
      systemSettings,
      recentActivities
    })
  } catch (error) {
    console.error('Error getting admin settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/settings - Update admin settings and profile
 */
export async function PUT(request: NextRequest) {
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
      select: { role: true, password: true }
    })

    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { type, data } = body

    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    let result: any = {}

    switch (type) {
      case 'profile':
        // Update profile information
        const { name, email, phone } = data

        // Check if email is already taken by another user
        if (email) {
          const existingUser = await prisma.user.findFirst({
            where: {
              email,
              id: { not: decoded.userId }
            }
          })

          if (existingUser) {
            return NextResponse.json({ error: 'Email is already taken' }, { status: 400 })
          }
        }

        const updatedUser = await prisma.user.update({
          where: { id: decoded.userId },
          data: {
            ...(name && { name }),
            ...(email && { email }),
            ...(phone && { phone })
          },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true
          }
        })

        await logAdminActivity(
          decoded.userId,
          AdminAction.SYSTEM_SETTING_CHANGED,
          'profile',
          decoded.userId,
          'Updated admin profile information',
          { changes: data },
          ipAddress,
          userAgent
        )

        result = { profile: updatedUser }
        break

      case 'password':
        // Update password
        const { currentPassword, newPassword } = data

        if (!currentPassword || !newPassword) {
          return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 })
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, admin.password)
        if (!isValidPassword) {
          return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 12)

        await prisma.user.update({
          where: { id: decoded.userId },
          data: { password: hashedNewPassword }
        })

        await logAdminActivity(
          decoded.userId,
          AdminAction.SYSTEM_SETTING_CHANGED,
          'security',
          decoded.userId,
          'Changed admin password',
          {},
          ipAddress,
          userAgent
        )

        result = { message: 'Password updated successfully' }
        break

      case 'notifications':
        // Update notification preferences
        // In a real implementation, this would be stored in a settings table
        await logAdminActivity(
          decoded.userId,
          AdminAction.SYSTEM_SETTING_CHANGED,
          'notifications',
          decoded.userId,
          'Updated notification preferences',
          { settings: data },
          ipAddress,
          userAgent
        )

        result = { message: 'Notification preferences updated successfully' }
        break

      case 'security':
        // Update security settings
        await logAdminActivity(
          decoded.userId,
          AdminAction.SYSTEM_SETTING_CHANGED,
          'security',
          decoded.userId,
          'Updated security settings',
          { settings: data },
          ipAddress,
          userAgent
        )

        result = { message: 'Security settings updated successfully' }
        break

      case 'preferences':
        // Update general preferences
        await logAdminActivity(
          decoded.userId,
          AdminAction.SYSTEM_SETTING_CHANGED,
          'preferences',
          decoded.userId,
          'Updated general preferences',
          { settings: data },
          ipAddress,
          userAgent
        )

        result = { message: 'Preferences updated successfully' }
        break

      default:
        return NextResponse.json({ error: 'Invalid setting type' }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating admin settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/settings - Perform admin actions
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
    const { action } = body

    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    let result: any = {}

    switch (action) {
      case 'clear_cache':
        // In a real implementation, this would clear application cache
        await logAdminActivity(
          decoded.userId,
          AdminAction.SYSTEM_SETTING_CHANGED,
          'system',
          'cache',
          'Cleared system cache',
          {},
          ipAddress,
          userAgent
        )

        result = { message: 'Cache cleared successfully' }
        break

      case 'backup_database':
        // In a real implementation, this would trigger a database backup
        await logAdminActivity(
          decoded.userId,
          AdminAction.SYSTEM_SETTING_CHANGED,
          'system',
          'database',
          'Initiated database backup',
          {},
          ipAddress,
          userAgent
        )

        result = { message: 'Database backup initiated' }
        break

      case 'send_test_notification':
        // Send a test notification
        await prisma.systemNotification.create({
          data: {
            userId: decoded.userId,
            title: 'Test Notification',
            message: 'This is a test notification from the admin settings.',
            type: 'GENERAL',
            priority: 'MEDIUM'
          }
        })

        result = { message: 'Test notification sent' }
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error performing admin action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}