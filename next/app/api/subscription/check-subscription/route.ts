import { NextRequest, NextResponse } from 'next/server';
import { getActiveSubscriptionByEmail } from '@/lib/db/subscription-queries';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    console.log('🔍 check-subscription API called with email:', email);

    if (!email) {
      console.log('❌ No email provided');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('📞 Calling getActiveSubscriptionByEmail...');
    const subscriptionData = await getActiveSubscriptionByEmail(email);

    console.log('📦 Subscription data result:', subscriptionData ? 'Found' : 'Not found');

    if (subscriptionData) {
      console.log('✅ Active subscription found:', {
        planName: subscriptionData.plan.name,
        status: subscriptionData.status,
        active: subscriptionData.active,
      });

      return NextResponse.json({
        hasSubscription: true,
        subscription: {
          planName: subscriptionData.plan.name,
          amount: subscriptionData.plan.price,
          status: subscriptionData.status,
          stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
          stripeCustomerId: subscriptionData.stripeCustomerId,
        },
      });
    }

    console.log('⚠️ No active subscription found for email:', email);
    return NextResponse.json({
      hasSubscription: false,
      debug: {
        email,
        queryExecuted: true,
        resultFound: false,
        hint: 'Check that subscription.active = true AND user.email matches exactly',
      }
    });
  } catch (error) {
    console.error('❌ Error checking subscription:', error);
    return NextResponse.json(
      {
        error: 'Failed to check subscription',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
      },
      { status: 500 }
    );
  }
}
