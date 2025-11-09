import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { updateSubscriptionByStripeId } from '@/lib/db/subscription-queries';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriptionId, immediateCancel = true } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    let response;
    if (immediateCancel) {
      // Cancel immediately - triggers `customer.subscription.deleted`
      response = await stripe.subscriptions.cancel(subscriptionId);

      // Update the subscription in our database
      await updateSubscriptionByStripeId(subscriptionId, {
        status: 'canceled',
        active: false,
        cancelDate: new Date(),
        stoppedDate: new Date(),
        cancelAtPeriodEnd: false,
      });
    } else {
      // Mark for cancellation at period end - triggers `customer.subscription.updated`
      response = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      // Update the subscription in our database
      await updateSubscriptionByStripeId(subscriptionId, {
        cancelAtPeriodEnd: true,
      });
    }

    return NextResponse.json({
      success: true,
      subscription: response,
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

