import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { logAdminActivity, extendTrialPeriod } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * GET /api/superadmin/trials - Get all trial accounts with filters and pagination
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
    const daysRemaining = searchParams.get('daysRemaining') || undefined;
    const hasStore = searchParams.get('hasStore') || undefined;
    const extensions = searchParams.get('extensions') || undefined;
    const usage = searchParams.get('usage') || undefined;

    const skip = (page - 1) * limit;
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    // Build where clause
    const where: Prisma.UserWhereInput = {
      // Only users who have trial periods (not converted to paid)
      OR: [
        { subscription: null },
        { subscription: { status: { not: 'ACTIVE' } } }
      ]
    };

    if (search) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }
      ];
    }

    if (status) {
      switch (status) {
        case 'active':
          where.AND = [
            ...(where.AND || []),
            { trialEndDate: { gt: now } }
          ];
          break;
        case 'expired':
          where.AND = [
            ...(where.AND || []),
            { trialEndDate: { lt: now } }
          ];
          break;
        case 'expiring_soon':
          where.AND = [
            ...(where.AND || []),
            {
              trialEndDate: {
                gt: now,
                lt: sevenDaysFromNow
              }
            }
          ];
          break;
        case 'converted':
          where.subscription = { status: 'ACTIVE' };
          delete where.OR; // Remove the trial filter
          break;
      }
    }

    if (daysRemaining) {
      const ranges = daysRemaining.split('-');
      if (ranges.length === 2) {
        const min = parseInt(ranges[0]);
        const max = ranges[1] === '+' ? Infinity : parseInt(ranges[1]);

        const minDate = new Date();
        minDate.setDate(now.getDate() + min);

        if (max === Infinity) {
          where.AND = [
            ...(where.AND || []),
            { trialEndDate: { gte: minDate } }
          ];
        } else {
          const maxDate = new Date();
          maxDate.setDate(now.getDate() + max);
          where.AND = [
            ...(where.AND || []),
            {
              trialEndDate: {
                gte: minDate,
                lte: maxDate
              }
            }
          ];
        }
      }
    }

    if (hasStore) {
      if (hasStore === 'true') {
        where.store = { isNot: null };
      } else {
        where.store = null;
      }
    }

    // Fetch users with trial information
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
              isVerified: true,
              storageUsed: true,
              _count: {
                select: {
                  orders: true,
                  products: true,
                  customers: true
                }
              }
            }
          },
          subscription: {
            select: {
              id: true,
              plan: true,
              status: true,
              startDate: true,
              endDate: true
            }
          }
        },
        orderBy: { trialEndDate: 'asc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    // Calculate additional data for each user
    const usersWithTrialData = await Promise.all(
      users.map(async (user) => {
        const trialEnd = new Date(user.trialEndDate);
        const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isExpired = daysRemaining <= 0;
        const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 7;

        // Get trial extensions count
        const trialExtensions = await prisma.adminActivityLog.count({
          where: {
            targetType: 'user',
            targetId: user.id,
            action: 'TRIAL_EXTENDED'
          }
        });

        // Get store revenue if exists
        let storeRevenue = 0;
        if (user.store) {
          const revenue = await prisma.order.aggregate({
            where: {
              storeId: user.store.id,
              status: 'COMPLETED'
            },
            _sum: { total: true }
          });
          storeRevenue = Number(revenue._sum.total || 0);
        }

        // Calculate usage metrics
        const usage = user.store ? {
          storageUsed: user.store.storageUsed || 0,
          productsCreated: user.store._count.products,
          ordersProcessed: user.store._count.orders,
          customersAcquired: user.store._count.customers
        } : {
          storageUsed: 0,
          productsCreated: 0,
          ordersProcessed: 0,
          customersAcquired: 0
        };

        return {
          ...user,
          daysRemaining,
          isExpired,
          isExpiringSoon,
          trialExtensions,
          trialStartDate: user.createdAt, // Assuming trial starts when user is created
          store: user.store ? {
            ...user.store,
            totalOrders: user.store._count.orders,
            totalRevenue: storeRevenue
          } : null,
          usage
        };
      })
    );

    return NextResponse.json({
      trials: usersWithTrialData,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting trials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/superadmin/trials - Admin actions on trial accounts
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
    const { action, userId, additionalDays, reason, plan } = body;

    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    let result: { success: boolean; message: string };

    switch (action) {
      case 'extend_trial':
        if (!additionalDays || additionalDays <= 0) {
          return NextResponse.json(
            { error: 'Additional days must be provided and greater than 0' },
            { status: 400 }
          );
        }
        result = await extendTrialPeriod(decoded.userId, userId, additionalDays, reason, ipAddress, userAgent);
        break;

      case 'convert_to_paid':
        result = await convertToPaid(decoded.userId, userId, plan, ipAddress, userAgent);
        break;

      case 'send_reminder':
        result = await sendTrialReminder(decoded.userId, userId, ipAddress, userAgent);
        break;

      case 'end_trial':
        result = await endTrial(decoded.userId, userId, reason, ipAddress, userAgent);
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
    console.error('Error performing trial action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Convert trial user to paid subscription
 */
async function convertToPaid(
  adminId: string,
  userId: string,
  plan: string,
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
        store: {
          select: { id: true }
        },
        subscription: {
          select: { id: true, status: true }
        }
      }
    });

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (user.subscription?.status === 'ACTIVE') {
      return { success: false, message: 'User already has active subscription' };
    }

    // Plan pricing (this would normally come from a plans table)
    const planPricing = {
      STARTER: 50000,
      PROFESSIONAL: 100000,
      ENTERPRISE: 200000
    };

    const price = planPricing[plan as keyof typeof planPricing];
    if (!price) {
      return { success: false, message: 'Invalid plan selected' };
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    // Create or update subscription
    if (user.subscription) {
      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          plan: plan as 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE',
          status: 'ACTIVE',
          price,
          startDate,
          endDate
        }
      });
    } else {
      if (!user.store) {
        return { success: false, message: 'User does not have a store' };
      }

      await prisma.subscription.create({
        data: {
          userId,
          storeId: user.store.id,
          plan: plan as 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE',
          status: 'ACTIVE',
          price,
          trialEndDate: user.trialEndDate,
          startDate,
          endDate
        }
      });
    }

    await logAdminActivity(
      adminId,
      'TRIAL_CONVERTED',
      'user',
      userId,
      `Converted trial user ${user.name} (${user.email}) to ${plan} plan`,
      {
        userId,
        userName: user.name,
        userEmail: user.email,
        plan,
        price,
        startDate,
        endDate
      },
      ipAddress,
      userAgent
    );

    return { success: true, message: `User converted to ${plan} plan successfully` };
  } catch (error) {
    console.error('Error converting to paid:', error);
    return { success: false, message: 'Failed to convert to paid plan' };
  }
}

/**
 * Send trial reminder to user
 */
async function sendTrialReminder(
  adminId: string,
  userId: string,
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
        trialEndDate: true
      }
    });

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Create notification record
    await prisma.systemNotification.create({
      data: {
        userId: userId,
        title: 'Trial Reminder',
        message: `Your trial period will end on ${user.trialEndDate.toLocaleDateString()}. Upgrade now to continue using our services.`,
        type: 'TRIAL_EXPIRING',
        priority: 'HIGH',
        actionUrl: '/billing',
        actionLabel: 'Upgrade Now'
      }
    });

    // Here you would typically send an email as well
    // await sendEmail(user.email, 'Trial Reminder', emailTemplate);

    await logAdminActivity(
      adminId,
      'TRIAL_REMINDER_SENT',
      'user',
      userId,
      `Sent trial reminder to ${user.name} (${user.email})`,
      {
        userId,
        userName: user.name,
        userEmail: user.email,
        trialEndDate: user.trialEndDate
      },
      ipAddress,
      userAgent
    );

    return { success: true, message: 'Trial reminder sent successfully' };
  } catch (error) {
    console.error('Error sending trial reminder:', error);
    return { success: false, message: 'Failed to send trial reminder' };
  }
}

/**
 * End trial early
 */
async function endTrial(
  adminId: string,
  userId: string,
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
          select: { status: true }
        }
      }
    });

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (user.subscription?.status === 'ACTIVE') {
      return { success: false, message: 'User has active subscription, cannot end trial' };
    }

    const now = new Date();
    if (user.trialEndDate < now) {
      return { success: false, message: 'Trial has already ended' };
    }

    // Set trial end date to now
    await prisma.user.update({
      where: { id: userId },
      data: { trialEndDate: now }
    });

    await logAdminActivity(
      adminId,
      'TRIAL_ENDED',
      'user',
      userId,
      `Ended trial early for ${user.name} (${user.email})${reason ? `. Reason: ${reason}` : ''}`,
      {
        userId,
        userName: user.name,
        userEmail: user.email,
        originalTrialEndDate: user.trialEndDate,
        newTrialEndDate: now,
        reason
      },
      ipAddress,
      userAgent
    );

    return { success: true, message: 'Trial ended successfully' };
  } catch (error) {
    console.error('Error ending trial:', error);
    return { success: false, message: 'Failed to end trial' };
  }
}