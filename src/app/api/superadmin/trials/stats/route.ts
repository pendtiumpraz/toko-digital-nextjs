import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/superadmin/trials/stats - Get trial statistics
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

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const [
      totalTrials,
      activeTrials,
      expiredTrials,
      expiringSoon,
      totalConversions,
      totalExtensions,
      averageTrialDurationData
    ] = await Promise.all([
      // Total users who have/had trials
      prisma.user.count({
        where: {
          trialEndDate: { not: undefined }
        }
      }),

      // Active trials (not expired and no active subscription)
      prisma.user.count({
        where: {
          trialEndDate: { gt: now },
          OR: [
            { subscription: null },
            { subscription: { status: { not: 'ACTIVE' } } }
          ]
        }
      }),

      // Expired trials (no active subscription)
      prisma.user.count({
        where: {
          trialEndDate: { lt: now },
          OR: [
            { subscription: null },
            { subscription: { status: { not: 'ACTIVE' } } }
          ]
        }
      }),

      // Expiring soon (within 7 days)
      prisma.user.count({
        where: {
          trialEndDate: {
            gt: now,
            lt: sevenDaysFromNow
          },
          OR: [
            { subscription: null },
            { subscription: { status: { not: 'ACTIVE' } } }
          ]
        }
      }),

      // Total conversions (users with active subscriptions)
      prisma.user.count({
        where: {
          trialEndDate: { not: undefined },
          subscription: { status: 'ACTIVE' }
        }
      }),

      // Total trial extensions
      prisma.adminActivityLog.count({
        where: {
          action: 'TRIAL_EXTENDED'
        }
      }),

      // Get users for average trial duration calculation
      prisma.user.findMany({
        where: {
          trialEndDate: { not: undefined },
          createdAt: { not: undefined }
        },
        select: {
          createdAt: true,
          trialEndDate: true,
          subscription: {
            select: {
              status: true,
              startDate: true
            }
          }
        }
      })
    ]);

    // Calculate average trial duration
    let totalDuration = 0;
    let validUsers = 0;

    averageTrialDurationData.forEach(user => {
      // Skip users with null dates
      if (!user.createdAt || !user.trialEndDate) {
        return;
      }

      const trialStart = user.createdAt;
      let trialEnd: Date;

      if (user.subscription?.status === 'ACTIVE' && user.subscription?.startDate) {
        // User converted, use subscription start date as trial end
        trialEnd = user.subscription.startDate;
      } else {
        // User didn't convert, use trial end date
        trialEnd = user.trialEndDate;
      }

      const duration = Math.ceil((trialEnd.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));

      if (duration > 0 && duration <= 365) { // Sanity check
        totalDuration += duration;
        validUsers++;
      }
    });

    const averageTrialDuration = validUsers > 0 ? Math.round(totalDuration / validUsers) : 14; // Default to 14 days

    // Calculate conversion rate
    const conversionRate = totalTrials > 0 ? (totalConversions / totalTrials) * 100 : 0;

    const stats = {
      totalTrials,
      activeTrials,
      expiredTrials,
      expiringSoon,
      conversionRate,
      averageTrialDuration,
      totalExtensions,
      totalConversions
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting trial stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}