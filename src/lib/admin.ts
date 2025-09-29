import { prisma } from './prisma'
import { AdminAction, Role } from '@prisma/client'

interface AdminActivityLogWhere {
  adminId?: string
  action?: AdminAction
  targetType?: string
  createdAt?: {
    gte?: Date
    lte?: Date
  }
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: string
}

/**
 * Log admin activity
 */
export async function logAdminActivity(
  adminId: string,
  action: AdminAction,
  targetType: string,
  targetId: string,
  description: string,
  metadata?: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await prisma.adminActivityLog.create({
      data: {
        adminId,
        action,
        targetType,
        targetId,
        description,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
        ipAddress,
        userAgent
      }
    })
  } catch (error) {
    console.error('Error logging admin activity:', error)
  }
}

/**
 * Get admin activity logs with pagination
 */
export async function getAdminActivityLogs(
  page: number = 1,
  limit: number = 50,
  filters?: {
    adminId?: string
    action?: AdminAction
    targetType?: string
    dateFrom?: Date
    dateTo?: Date
  }
) {
  const skip = (page - 1) * limit

  const where: AdminActivityLogWhere = {}
  if (filters?.adminId) where.adminId = filters.adminId
  if (filters?.action) where.action = filters.action
  if (filters?.targetType) where.targetType = filters.targetType
  if (filters?.dateFrom || filters?.dateTo) {
    where.createdAt = {}
    if (filters.dateFrom) where.createdAt.gte = filters.dateFrom
    if (filters.dateTo) where.createdAt.lte = filters.dateTo
  }

  const [logs, total] = await Promise.all([
    prisma.adminActivityLog.findMany({
      where,
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.adminActivityLog.count({ where })
  ])

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }
}

/**
 * Activate user account
 */
export async function activateUser(
  adminId: string,
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, isActive: true }
    })

    if (!user) {
      return { success: false, message: 'User not found' }
    }

    if (user.isActive) {
      return { success: false, message: 'User is already active' }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: true }
    })

    await logAdminActivity(
      adminId,
      AdminAction.USER_ACTIVATED,
      'user',
      userId,
      `Activated user: ${user.name} (${user.email})`,
      { userId, userName: user.name, userEmail: user.email },
      ipAddress,
      userAgent
    )

    return { success: true, message: 'User activated successfully' }
  } catch (error) {
    console.error('Error activating user:', error)
    return { success: false, message: 'Failed to activate user' }
  }
}

/**
 * Deactivate user account
 */
export async function deactivateUser(
  adminId: string,
  userId: string,
  reason?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, isActive: true, role: true }
    })

    if (!user) {
      return { success: false, message: 'User not found' }
    }

    if (user.role === 'SUPER_ADMIN') {
      return { success: false, message: 'Cannot deactivate super admin' }
    }

    if (!user.isActive) {
      return { success: false, message: 'User is already inactive' }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    })

    await logAdminActivity(
      adminId,
      AdminAction.USER_DEACTIVATED,
      'user',
      userId,
      `Deactivated user: ${user.name} (${user.email})${reason ? `. Reason: ${reason}` : ''}`,
      { userId, userName: user.name, userEmail: user.email, reason },
      ipAddress,
      userAgent
    )

    return { success: true, message: 'User deactivated successfully' }
  } catch (error) {
    console.error('Error deactivating user:', error)
    return { success: false, message: 'Failed to deactivate user' }
  }
}

/**
 * Extend user trial period
 */
export async function extendTrialPeriod(
  adminId: string,
  userId: string,
  additionalDays: number,
  reason?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        trialEndDate: true,
        subscription: {
          select: {
            status: true
          }
        }
      }
    })

    if (!user) {
      return { success: false, message: 'User not found' }
    }

    if (user.subscription?.status === 'ACTIVE') {
      return { success: false, message: 'User has active subscription, trial extension not applicable' }
    }

    const currentTrialEnd = user.trialEndDate
    const newTrialEnd = new Date(currentTrialEnd)
    newTrialEnd.setDate(newTrialEnd.getDate() + additionalDays)

    await prisma.user.update({
      where: { id: userId },
      data: { trialEndDate: newTrialEnd }
    })

    await logAdminActivity(
      adminId,
      AdminAction.TRIAL_EXTENDED,
      'user',
      userId,
      `Extended trial for ${user.name} (${user.email}) by ${additionalDays} days${reason ? `. Reason: ${reason}` : ''}`,
      {
        userId,
        userName: user.name,
        userEmail: user.email,
        additionalDays,
        previousTrialEnd: currentTrialEnd,
        newTrialEnd,
        reason
      },
      ipAddress,
      userAgent
    )

    return { success: true, message: `Trial extended by ${additionalDays} days` }
  } catch (error) {
    console.error('Error extending trial:', error)
    return { success: false, message: 'Failed to extend trial period' }
  }
}

/**
 * Get users with pagination and filters
 */
export async function getUsers(
  page: number = 1,
  limit: number = 20,
  filters?: {
    role?: string
    isActive?: boolean
    trialStatus?: 'active' | 'expired' | 'ending_soon'
    search?: string
    hasStore?: boolean
    subscriptionStatus?: string
  }
) {
  const skip = (page - 1) * limit

  // Use any for Prisma where clause to avoid complex type issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}

  if (filters?.role) where.role = filters.role as Role
  if (filters?.isActive !== undefined) where.isActive = filters.isActive
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } }
    ]
  }
  if (filters?.hasStore !== undefined) {
    if (filters.hasStore) {
      where.store = { isNot: null }
    } else {
      where.store = null
    }
  }
  if (filters?.subscriptionStatus) {
    where.subscription = {
      status: filters.subscriptionStatus
    }
  }

  // Handle trial status filter
  if (filters?.trialStatus) {
    const now = new Date()
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(now.getDate() + 7)

    switch (filters.trialStatus) {
      case 'active':
        where.trialEndDate = { gt: now }
        where.subscription = { status: { not: 'ACTIVE' } }
        break
      case 'expired':
        where.trialEndDate = { lt: now }
        where.subscription = { status: { not: 'ACTIVE' } }
        break
      case 'ending_soon':
        where.trialEndDate = {
          gt: now,
          lt: sevenDaysFromNow
        }
        where.subscription = { status: { not: 'ACTIVE' } }
        break
    }
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
            isVerified: true
          }
        },
        subscription: {
          select: {
            id: true,
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

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }
}

/**
 * Get dashboard statistics for super admin
 */
export async function getSuperAdminStats() {
  try {
    const now = new Date()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(now.getDate() - 7)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(now.getDate() - 30)

    const [
      totalUsers,
      activeUsers,
      totalStores,
      activeStores,
      trialUsers,
      trialExpiringSoon,
      trialExpired,
      subscriptionsActive,
      subscriptionsExpired,
      newUsersThisWeek,
      newUsersThisMonth,
      totalRevenue,
      revenueThisMonth
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Active users
      prisma.user.count({ where: { isActive: true } }),

      // Total stores
      prisma.store.count(),

      // Active stores
      prisma.store.count({ where: { isActive: true } }),

      // Users in trial
      prisma.user.count({
        where: {
          trialEndDate: { gt: now },
          subscription: { status: { not: 'ACTIVE' } }
        }
      }),

      // Trial expiring in 7 days
      prisma.user.count({
        where: {
          trialEndDate: {
            gt: now,
            lt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          },
          subscription: { status: { not: 'ACTIVE' } }
        }
      }),

      // Trial expired
      prisma.user.count({
        where: {
          trialEndDate: { lt: now },
          subscription: { status: { not: 'ACTIVE' } }
        }
      }),

      // Active subscriptions
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),

      // Expired subscriptions
      prisma.subscription.count({
        where: {
          status: 'EXPIRED',
          endDate: { lt: now }
        }
      }),

      // New users this week
      prisma.user.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      }),

      // New users this month
      prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),

      // Total revenue (sum of all payments)
      prisma.subscription.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { price: true }
      }),

      // Revenue this month
      prisma.subscription.aggregate({
        where: {
          status: 'ACTIVE',
          startDate: { gte: thirtyDaysAgo }
        },
        _sum: { price: true }
      })
    ])

    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(now.getDate() + 7)

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth
      },
      stores: {
        total: totalStores,
        active: activeStores,
        inactive: totalStores - activeStores
      },
      trials: {
        active: trialUsers,
        expiringSoon: trialExpiringSoon,
        expired: trialExpired
      },
      subscriptions: {
        active: subscriptionsActive,
        expired: subscriptionsExpired
      },
      revenue: {
        total: Number(totalRevenue._sum.price || 0),
        thisMonth: Number(revenueThisMonth._sum.price || 0)
      }
    }
  } catch (error) {
    console.error('Error getting super admin stats:', error)
    throw error
  }
}

/**
 * Get system health metrics
 */
export async function getSystemHealth() {
  try {
    const [
      avgResponseTime,
      errorRate,
      storageUsage,
      activeConnections,
      databaseHealth
    ] = await Promise.all([
      // Calculate average response time from recent admin activities
      getAverageResponseTime(),

      // Calculate error rate based on recent system logs
      getSystemErrorRate(),

      // Storage usage
      prisma.store.aggregate({
        _sum: { storageUsed: true }
      }),

      // Active connections estimate based on recent user activity
      getActiveConnectionsEstimate(),

      // Database health check
      checkDatabaseHealth()
    ])

    // Determine overall system status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'

    if (avgResponseTime > 1000 || errorRate > 5 || !databaseHealth) {
      status = 'critical'
    } else if (avgResponseTime > 500 || errorRate > 2) {
      status = 'warning'
    }

    return {
      avgResponseTime,
      errorRate,
      storageUsage: Number(storageUsage._sum.storageUsed || 0),
      activeConnections,
      status
    }
  } catch (error) {
    console.error('Error getting system health:', error)
    return {
      avgResponseTime: 0,
      errorRate: 0,
      storageUsage: 0,
      activeConnections: 0,
      status: 'critical' as const
    }
  }
}

/**
 * Get average response time estimate based on database query performance
 */
async function getAverageResponseTime(): Promise<number> {
  try {
    const start = Date.now()

    // Simple database query to estimate response time
    await prisma.user.count()

    const responseTime = Date.now() - start

    // Return response time in milliseconds
    return Math.max(responseTime, 50) // Minimum 50ms
  } catch (error) {
    console.error('Error measuring response time:', error)
    return 1000 // Default to high response time on error
  }
}

/**
 * Get system error rate estimate
 */
async function getSystemErrorRate(): Promise<number> {
  try {
    const oneHourAgo = new Date()
    oneHourAgo.setHours(oneHourAgo.getHours() - 1)

    // Count admin activities that might indicate errors or issues
    const [totalActivities, potentialErrors] = await Promise.all([
      prisma.adminActivityLog.count({
        where: {
          createdAt: { gte: oneHourAgo }
        }
      }),
      prisma.adminActivityLog.count({
        where: {
          createdAt: { gte: oneHourAgo },
          action: {
            in: ['USER_DEACTIVATED', 'STORE_SUSPENDED']
          }
        }
      })
    ])

    if (totalActivities === 0) return 0

    return (potentialErrors / totalActivities) * 100
  } catch (error) {
    console.error('Error calculating error rate:', error)
    return 5 // Default to 5% error rate on error
  }
}

/**
 * Get active connections estimate based on recent user activity
 */
async function getActiveConnectionsEstimate(): Promise<number> {
  try {
    const fifteenMinutesAgo = new Date()
    fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15)

    // Count users who logged in recently
    const recentlyActiveUsers = await prisma.user.count({
      where: {
        lastLogin: { gte: fifteenMinutesAgo },
        isActive: true
      }
    })

    // Estimate connections as recent users + some buffer for anonymous visitors
    return Math.max(recentlyActiveUsers * 2, 10)
  } catch (error) {
    console.error('Error estimating active connections:', error)
    return 25 // Default estimate
  }
}

/**
 * Check database health
 */
async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Simple connectivity test
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

/**
 * Send system notification
 */
export async function sendSystemNotification(
  adminId: string,
  notification: {
    title: string
    message: string
    type: string
    priority?: string
    targetUserId?: string
    targetStoreId?: string
    actionUrl?: string
    actionLabel?: string
    scheduledFor?: Date
    expiresAt?: Date
  },
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; message: string }> {
  try {
    await prisma.systemNotification.create({
      data: {
        title: notification.title,
        message: notification.message,
        type: notification.type as never,
        priority: (notification.priority as never) || 'MEDIUM',
        userId: notification.targetUserId,
        storeId: notification.targetStoreId,
        actionUrl: notification.actionUrl,
        actionLabel: notification.actionLabel,
        scheduledFor: notification.scheduledFor,
        expiresAt: notification.expiresAt
      }
    })

    await logAdminActivity(
      adminId,
      AdminAction.SYSTEM_SETTING_CHANGED,
      'notification',
      'system',
      `Sent system notification: ${notification.title}`,
      notification,
      ipAddress,
      userAgent
    )

    return { success: true, message: 'Notification sent successfully' }
  } catch (error) {
    console.error('Error sending system notification:', error)
    return { success: false, message: 'Failed to send notification' }
  }
}