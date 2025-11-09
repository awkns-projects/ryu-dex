import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

/**
 * Fix subscription active flag
 * This endpoint sets subscription.active = true for the current user
 */
export async function POST(request: NextRequest) {
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

    console.log('🔧 Attempting to fix subscription for:', email);

    // Get user info
    const userInfo = await prisma.user.findUnique({
      where: { email }
    });

    if (!userInfo) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    const userId = userInfo.id;

    // Get all subscriptions for this user (even inactive ones)
    const allSubscriptions = await prisma.subscription.findMany({
      where: { userId }
    });

    console.log('📊 Found subscriptions:', allSubscriptions.length);

    if (allSubscriptions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No subscriptions found for this user',
        hint: 'You may need to create a subscription through Stripe first',
      });
    }

    // Update all subscriptions to active = true
    const updateResult = await prisma.subscription.updateMany({
      where: { userId },
      data: { active: true }
    });

    // Get updated subscriptions
    const updatedSubscriptions = await prisma.subscription.findMany({
      where: { userId }
    });

    console.log('✅ Updated subscriptions:', updateResult.count);

    return NextResponse.json({
      success: true,
      message: `Updated ${updateResult.count} subscription(s) to active`,
      subscriptions: updatedSubscriptions.map(sub => ({
        id: sub.id,
        status: sub.status,
        active: sub.active,
        stripeSubscriptionId: sub.stripeSubscriptionId,
      })),
    });
  } catch (error) {
    console.error('❌ Error fixing subscription:', error);
    return NextResponse.json(
      {
        error: 'Failed to fix subscription',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
