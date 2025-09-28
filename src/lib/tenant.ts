import { NextRequest } from 'next/server'
import { prisma } from './prisma'
import { verifyToken } from './auth'

export interface TenantContext {
  storeId: string
  userId: string
  userRole: string
  store?: {
    id: string
    name: string
    subdomain: string
    ownerId: string
    isActive: boolean
  }
}

/**
 * Extract tenant information from request
 * Supports both subdomain-based and token-based tenant identification
 */
export async function getTenantContext(request: NextRequest): Promise<TenantContext | null> {
  try {
    // Method 1: Get from subdomain
    const host = request.headers.get('host')
    if (host) {
      const subdomain = extractSubdomain(host)
      if (subdomain && subdomain !== 'www' && subdomain !== 'admin') {
        const store = await prisma.store.findUnique({
          where: { subdomain },
          select: {
            id: true,
            name: true,
            subdomain: true,
            ownerId: true,
            isActive: true
          }
        })

        if (store && store.isActive) {
          return {
            storeId: store.id,
            userId: store.ownerId,
            userRole: 'STORE_OWNER',
            store
          }
        }
      }
    }

    // Method 2: Get from Authorization token
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const decoded = verifyToken(token)

      if (decoded) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          include: {
            store: {
              select: {
                id: true,
                name: true,
                subdomain: true,
                ownerId: true,
                isActive: true
              }
            }
          }
        })

        if (user?.store && user.store.isActive) {
          return {
            storeId: user.store.id,
            userId: user.id,
            userRole: user.role,
            store: user.store
          }
        }
      }
    }

    return null
  } catch (error) {
    console.error('Error getting tenant context:', error)
    return null
  }
}

/**
 * Extract subdomain from host header
 */
function extractSubdomain(host: string): string | null {
  // Remove port if present
  const hostname = host.split(':')[0]

  // Split by dots
  const parts = hostname.split('.')

  // If we have at least 3 parts (subdomain.domain.tld), return the first part
  if (parts.length >= 3) {
    return parts[0]
  }

  // For localhost development, check if it's a subdomain pattern
  if (hostname.includes('localhost') && parts.length >= 2) {
    const subdomain = parts[0]
    // Skip common non-tenant subdomains
    if (!['www', 'api', 'admin', 'app'].includes(subdomain)) {
      return subdomain
    }
  }

  return null
}

/**
 * Validate user access to a store
 */
export async function validateStoreAccess(
  userId: string,
  storeId: string,
  requiredRole?: string[]
): Promise<boolean> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        OR: [
          { store: { id: storeId } }, // Store owner
          { role: 'SUPER_ADMIN' }, // Super admin can access any store
          { role: 'ADMIN' } // Admin can access any store
        ]
      },
      select: {
        id: true,
        role: true,
        store: {
          select: {
            id: true,
            isActive: true
          }
        }
      }
    })

    if (!user) return false

    // Check if store is active (unless user is super admin)
    if (user.role !== 'SUPER_ADMIN' && user.store && !user.store.isActive) {
      return false
    }

    // Check role requirements
    if (requiredRole && requiredRole.length > 0) {
      return requiredRole.includes(user.role)
    }

    return true
  } catch (error) {
    console.error('Error validating store access:', error)
    return false
  }
}

/**
 * Get store-scoped Prisma queries
 */
export function createTenantQueries(storeId: string) {
  return {
    // Products scoped to store
    products: {
      findMany: (args: any = {}) => ({
        ...args,
        where: {
          storeId,
          ...args.where
        }
      }),
      findUnique: (args: any) => ({
        ...args,
        where: {
          ...args.where,
          storeId
        }
      }),
      create: (args: any) => ({
        ...args,
        data: {
          storeId,
          ...args.data
        }
      }),
      update: (args: any) => ({
        ...args,
        where: {
          ...args.where,
          storeId
        }
      }),
      delete: (args: any) => ({
        ...args,
        where: {
          ...args.where,
          storeId
        }
      })
    },

    // Orders scoped to store
    orders: {
      findMany: (args: any = {}) => ({
        ...args,
        where: {
          storeId,
          ...args.where
        }
      }),
      findUnique: (args: any) => ({
        ...args,
        where: {
          ...args.where,
          storeId
        }
      }),
      create: (args: any) => ({
        ...args,
        data: {
          storeId,
          ...args.data
        }
      }),
      update: (args: any) => ({
        ...args,
        where: {
          ...args.where,
          storeId
        }
      })
    },

    // Financial transactions scoped to store
    financialTransactions: {
      findMany: (args: any = {}) => ({
        ...args,
        where: {
          storeId,
          ...args.where
        }
      }),
      create: (args: any) => ({
        ...args,
        data: {
          storeId,
          ...args.data
        }
      }),
      update: (args: any) => ({
        ...args,
        where: {
          ...args.where,
          storeId
        }
      }),
      delete: (args: any) => ({
        ...args,
        where: {
          ...args.where,
          storeId
        }
      })
    },

    // Analytics scoped to store
    analytics: {
      findMany: (args: any = {}) => ({
        ...args,
        where: {
          storeId,
          ...args.where
        }
      }),
      create: (args: any) => ({
        ...args,
        data: {
          storeId,
          ...args.data
        }
      })
    }
  }
}

/**
 * Middleware helper to enforce tenant isolation
 */
export async function withTenantIsolation<T>(
  request: NextRequest,
  handler: (context: TenantContext) => Promise<T>
): Promise<T> {
  const context = await getTenantContext(request)

  if (!context) {
    throw new Error('Unauthorized: Invalid tenant context')
  }

  return handler(context)
}

/**
 * Check if user is in trial period
 */
export async function isTrialExpired(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        trialEndDate: true,
        subscription: {
          select: {
            status: true
          }
        }
      }
    })

    if (!user) return true

    // If user has active subscription, trial status doesn't matter
    if (user.subscription?.status === 'ACTIVE') {
      return false
    }

    // Check if trial has expired
    return new Date() > user.trialEndDate
  } catch (error) {
    console.error('Error checking trial status:', error)
    return true
  }
}

/**
 * Enforce subscription limits
 */
export async function checkSubscriptionLimits(
  storeId: string,
  resource: 'products' | 'storage'
): Promise<{ allowed: boolean; limit: number; current: number }> {
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        subscription: true,
        _count: {
          select: {
            products: { where: { isActive: true } }
          }
        }
      }
    })

    if (!store || !store.subscription) {
      return { allowed: false, limit: 0, current: 0 }
    }

    switch (resource) {
      case 'products':
        const productCount = store._count.products
        const productLimit = store.subscription.productLimit
        return {
          allowed: productCount < productLimit,
          limit: productLimit,
          current: productCount
        }

      case 'storage':
        const storageUsed = Number(store.storageUsed)
        const storageLimit = Number(store.subscription.storageLimit)
        return {
          allowed: storageUsed < storageLimit,
          limit: storageLimit,
          current: storageUsed
        }

      default:
        return { allowed: false, limit: 0, current: 0 }
    }
  } catch (error) {
    console.error('Error checking subscription limits:', error)
    return { allowed: false, limit: 0, current: 0 }
  }
}