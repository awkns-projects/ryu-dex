import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getActiveSubscriptionByEmail } from '@/lib/db/subscription-queries';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const email = session.user.email;

    // Get user info first
    const userInfo = await prisma.user.findUnique({
      where: { email }
    });

    // Get ALL subscriptions (no filters) to see everything
    const allSubscriptionsRaw = await prisma.subscription.findMany({
      include: {
        plan: true,
        user: true
      }
    });

    // Get subscriptions for this specific user
    const userSubscriptions = await prisma.subscription.findMany({
      where: {
        user: { email }
      },
      include: {
        plan: true,
        user: true
      }
    });

    // Get subscriptions by userId (in case email doesn't match)
    const subscriptionsByUserId = userInfo ? await prisma.subscription.findMany({
      where: { userId: userInfo.id },
      include: {
        plan: true
      }
    }) : [];

    // Get only active subscription using the existing function
    const activeSubscription = await getActiveSubscriptionByEmail(email);

    return NextResponse.json({
      sessionEmail: email,
      sessionUserId: session.user.id,
      userFromDb: userInfo ? {
        id: userInfo.id,
        email: userInfo.email,
        emailVerified: userInfo.emailVerified,
        createdAt: userInfo.createdAt,
      } : null,
      emailMatch: userInfo ? userInfo.email === email : false,

      totalSubscriptionsInDb: allSubscriptionsRaw.length,

      subscriptionsForThisEmail: {
        count: userSubscriptions.length,
        subscriptions: userSubscriptions.map(sub => ({
          id: sub.id,
          userId: sub.userId,
          planId: sub.planId,
          planName: sub.plan?.name || 'NO PLAN',
          status: sub.status,
          active: sub.active,
          startDate: sub.startDate,
          endDate: sub.endDate,
          stripeSubscriptionId: sub.stripeSubscriptionId,
          autoRenew: sub.autoRenew,
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
          userEmail: sub.user?.email || 'NO USER',
        })),
      },

      subscriptionsByUserId: {
        count: subscriptionsByUserId.length,
        subscriptions: subscriptionsByUserId.map(sub => ({
          id: sub.id,
          planName: sub.plan?.name || 'NO PLAN',
          status: sub.status,
          active: sub.active,
        })),
      },

      activeSubscriptionFromQuery: activeSubscription ? {
        planName: activeSubscription.plan.name,
        status: activeSubscription.status,
        active: activeSubscription.active,
        stripeSubscriptionId: activeSubscription.stripeSubscriptionId,
      } : null,

      diagnosis: {
        hasUserInDb: !!userInfo,
        hasAnySubscriptions: allSubscriptionsRaw.length > 0,
        hasSubscriptionsForEmail: userSubscriptions.length > 0,
        hasActiveSubscription: !!activeSubscription,
        possibleIssues: []
      }
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug info', details: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined },
      { status: 500 }
    );
  }
}
