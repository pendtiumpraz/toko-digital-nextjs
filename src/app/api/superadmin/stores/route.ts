import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { logAdminActivity } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/superadmin/stores - Get all stores with filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify super admin role
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!admin || admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const verified = searchParams.get('verified') || undefined;
    const subscriptionStatus = searchParams.get('subscriptionStatus') || undefined;
    const storageUsage = searchParams.get('storageUsage') || undefined;
    const owner = searchParams.get('owner') || undefined;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subdomain: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } },
        { owner: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }}
      ];
    }

    if (status) {
      where.isActive = status === 'active';
    }

    if (verified) {
      where.isVerified = verified === 'true';
    }

    if (owner) {
      where.owner = {
        OR: [
          { name: { contains: owner, mode: 'insensitive' } },
          { email: { contains: owner, mode: 'insensitive' } }
        ]
      };
    }

    if (subscriptionStatus) {
      where.owner = {
        ...where.owner,
        subscription: {
          status: subscriptionStatus
        }
      };
    }

    if (storageUsage) {
      switch (storageUsage) {
        case 'high':
          where.storageUsed = { gte: { storageLimit: true } }; // This would need proper calculation
          break;
        case 'medium':
          // Implementation for medium usage filter
          break;
        case 'low':
          // Implementation for low usage filter
          break;
      }
    }

    // Fetch stores with related data
    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              isActive: true,
              subscription: {
                select: {
                  id: true,
                  plan: true,
                  status: true,
                  startDate: true,
                  endDate: true,
                  trialEndDate: true
                }
              }
            }
          },
          _count: {
            select: {
              products: true,
              orders: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.store.count({ where })
    ]);

    // Calculate analytics for each store
    const storesWithAnalytics = await Promise.all(
      stores.map(async (store) => {
        // Get store analytics
        const [totalRevenue, totalOrders, monthlyVisitors] = await Promise.all([
          prisma.order.aggregate({
            where: {
              storeId: store.id,
              status: 'COMPLETED'
            },
            _sum: { total: true }
          }),
          prisma.order.count({
            where: {
              storeId: store.id,
              status: 'COMPLETED'
            }
          }),
          // Mock monthly visitors - would be from analytics service
          Promise.resolve(Math.floor(Math.random() * 10000))
        ]);

        return {
          ...store,
          analytics: {
            totalOrders: totalOrders,
            totalRevenue: Number(totalRevenue._sum.total || 0),
            totalProducts: store._count.products,
            monthlyVisitors: monthlyVisitors,
            conversionRate: monthlyVisitors > 0 ? (totalOrders / monthlyVisitors * 100) : 0
          }
        };
      })
    );

    return NextResponse.json({
      stores: storesWithAnalytics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting stores:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/superadmin/stores - Admin actions on stores
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify super admin role
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!admin || admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, storeId, reason, settings } = body;

    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    let result: { success: boolean; message: string };

    switch (action) {
      case 'activate':
        result = await activateStore(decoded.userId, storeId, ipAddress, userAgent);
        break;

      case 'deactivate':
        result = await deactivateStore(decoded.userId, storeId, reason, ipAddress, userAgent);
        break;

      case 'verify':
        result = await verifyStore(decoded.userId, storeId, ipAddress, userAgent);
        break;

      case 'unverify':
        result = await unverifyStore(decoded.userId, storeId, reason, ipAddress, userAgent);
        break;

      case 'update_settings':
        result = await updateStoreSettings(decoded.userId, storeId, settings, ipAddress, userAgent);
        break;

      case 'reset_storage':
        result = await resetStoreStorage(decoded.userId, storeId, ipAddress, userAgent);
        break;

      case 'suspend':
        result = await suspendStore(decoded.userId, storeId, reason, ipAddress, userAgent);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({ message: result.message });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error performing store action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Activate store
 */
async function activateStore(
  adminId: string,
  storeId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!store) {
      return { success: false, message: 'Store not found' };
    }

    if (store.isActive) {
      return { success: false, message: 'Store is already active' };
    }

    await prisma.store.update({
      where: { id: storeId },
      data: { isActive: true, updatedAt: new Date() }
    });

    await logAdminActivity(
      adminId,
      'STORE_ACTIVATED' as any,
      'store',
      storeId,
      `Activated store: ${store.name} (Owner: ${store.owner.name})`,
      {
        storeId,
        storeName: store.name,
        ownerId: store.owner.id,
        ownerName: store.owner.name,
        ownerEmail: store.owner.email
      },
      ipAddress,
      userAgent
    );

    return { success: true, message: 'Store activated successfully' };
  } catch (error) {
    console.error('Error activating store:', error);
    return { success: false, message: 'Failed to activate store' };
  }
}

/**
 * Deactivate store
 */
async function deactivateStore(
  adminId: string,
  storeId: string,
  reason?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!store) {
      return { success: false, message: 'Store not found' };
    }

    if (!store.isActive) {
      return { success: false, message: 'Store is already inactive' };
    }

    await prisma.store.update({
      where: { id: storeId },
      data: { isActive: false, updatedAt: new Date() }
    });

    await logAdminActivity(
      adminId,
      'STORE_DEACTIVATED' as any,
      'store',
      storeId,
      `Deactivated store: ${store.name} (Owner: ${store.owner.name})${reason ? `. Reason: ${reason}` : ''}`,
      {
        storeId,
        storeName: store.name,
        ownerId: store.owner.id,
        ownerName: store.owner.name,
        ownerEmail: store.owner.email,
        reason
      },
      ipAddress,
      userAgent
    );

    return { success: true, message: 'Store deactivated successfully' };
  } catch (error) {
    console.error('Error deactivating store:', error);
    return { success: false, message: 'Failed to deactivate store' };
  }
}

/**
 * Verify store
 */
async function verifyStore(
  adminId: string,
  storeId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!store) {
      return { success: false, message: 'Store not found' };
    }

    if (store.isVerified) {
      return { success: false, message: 'Store is already verified' };
    }

    await prisma.store.update({
      where: { id: storeId },
      data: { isVerified: true, updatedAt: new Date() }
    });

    await logAdminActivity(
      adminId,
      'STORE_VERIFIED' as any,
      'store',
      storeId,
      `Verified store: ${store.name} (Owner: ${store.owner.name})`,
      {
        storeId,
        storeName: store.name,
        ownerId: store.owner.id,
        ownerName: store.owner.name,
        ownerEmail: store.owner.email
      },
      ipAddress,
      userAgent
    );

    return { success: true, message: 'Store verified successfully' };
  } catch (error) {
    console.error('Error verifying store:', error);
    return { success: false, message: 'Failed to verify store' };
  }
}

/**
 * Unverify store
 */
async function unverifyStore(
  adminId: string,
  storeId: string,
  reason?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!store) {
      return { success: false, message: 'Store not found' };
    }

    if (!store.isVerified) {
      return { success: false, message: 'Store is already unverified' };
    }

    await prisma.store.update({
      where: { id: storeId },
      data: { isVerified: false, updatedAt: new Date() }
    });

    await logAdminActivity(
      adminId,
      'STORE_UNVERIFIED' as any,
      'store',
      storeId,
      `Unverified store: ${store.name} (Owner: ${store.owner.name})${reason ? `. Reason: ${reason}` : ''}`,
      {
        storeId,
        storeName: store.name,
        ownerId: store.owner.id,
        ownerName: store.owner.name,
        ownerEmail: store.owner.email,
        reason
      },
      ipAddress,
      userAgent
    );

    return { success: true, message: 'Store unverified successfully' };
  } catch (error) {
    console.error('Error unverifying store:', error);
    return { success: false, message: 'Failed to unverify store' };
  }
}

/**
 * Update store settings
 */
async function updateStoreSettings(
  adminId: string,
  storeId: string,
  settings: any,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!store) {
      return { success: false, message: 'Store not found' };
    }

    // Update store settings
    const updateData: any = { updatedAt: new Date() };

    if (settings.name) updateData.name = settings.name;
    if (settings.description) updateData.description = settings.description;
    if (settings.domain) updateData.domain = settings.domain;
    if (settings.storageLimit) updateData.storageLimit = settings.storageLimit;

    await prisma.store.update({
      where: { id: storeId },
      data: updateData
    });

    await logAdminActivity(
      adminId,
      'STORE_UPDATED' as any,
      'store',
      storeId,
      `Updated settings for store: ${store.name} (Owner: ${store.owner.name})`,
      {
        storeId,
        storeName: store.name,
        ownerId: store.owner.id,
        ownerName: store.owner.name,
        ownerEmail: store.owner.email,
        updatedSettings: settings
      },
      ipAddress,
      userAgent
    );

    return { success: true, message: 'Store settings updated successfully' };
  } catch (error) {
    console.error('Error updating store settings:', error);
    return { success: false, message: 'Failed to update store settings' };
  }
}

/**
 * Reset store storage
 */
async function resetStoreStorage(
  adminId: string,
  storeId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!store) {
      return { success: false, message: 'Store not found' };
    }

    await prisma.store.update({
      where: { id: storeId },
      data: { storageUsed: 0, updatedAt: new Date() }
    });

    await logAdminActivity(
      adminId,
      'STORE_STORAGE_RESET' as any,
      'store',
      storeId,
      `Reset storage for store: ${store.name} (Owner: ${store.owner.name})`,
      {
        storeId,
        storeName: store.name,
        ownerId: store.owner.id,
        ownerName: store.owner.name,
        ownerEmail: store.owner.email,
        previousStorageUsed: store.storageUsed
      },
      ipAddress,
      userAgent
    );

    return { success: true, message: 'Store storage reset successfully' };
  } catch (error) {
    console.error('Error resetting store storage:', error);
    return { success: false, message: 'Failed to reset store storage' };
  }
}

/**
 * Suspend store
 */
async function suspendStore(
  adminId: string,
  storeId: string,
  reason?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!store) {
      return { success: false, message: 'Store not found' };
    }

    // Deactivate store (suspending it)
    await prisma.store.update({
      where: { id: storeId },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    await logAdminActivity(
      adminId,
      'STORE_SUSPENDED' as any,
      'store',
      storeId,
      `Suspended store: ${store.name} (Owner: ${store.owner.name})${reason ? `. Reason: ${reason}` : ''}`,
      {
        storeId,
        storeName: store.name,
        ownerId: store.owner.id,
        ownerName: store.owner.name,
        ownerEmail: store.owner.email,
        reason
      },
      ipAddress,
      userAgent
    );

    return { success: true, message: 'Store suspended successfully' };
  } catch (error) {
    console.error('Error suspending store:', error);
    return { success: false, message: 'Failed to suspend store' };
  }
}