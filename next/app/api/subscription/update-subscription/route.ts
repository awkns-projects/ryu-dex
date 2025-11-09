import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
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

    const { customerId, subscriptionId, newPriceId } = await request.json();

    if (!customerId || !subscriptionId || !newPriceId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 1. Get all customer subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
    });

    console.log('### all subscriptions', subscriptions);

    // 2. Cancel all active subscriptions except the one being updated
    const cancelPromises = subscriptions.data
      .filter((sub) => sub.id !== subscriptionId && sub.status === 'active')
      .map((sub) =>
        stripe.subscriptions.update(sub.id, {
          cancel_at_period_end: true,
          metadata: {
            cancelReason: 'upgrade_to_new_plan',
          },
        })
      );

    // Wait for all cancellation operations
    await Promise.all(cancelPromises);

    // 3. Update target subscription
    const currentSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    const currentItem = currentSubscription.items.data[0];

    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{ id: currentItem.id, price: newPriceId }],
      proration_behavior: 'create_prorations',
      metadata: {
        isUpgrade: 'true',
        previousPlanId: currentItem.price.id,
        upgradeDate: new Date().toISOString(),
      },
      // Ensure it's not marked for cancellation
      cancel_at_period_end: false,
    });

    return NextResponse.json({
      updatedSubscription,
      cancelledSubscriptions: subscriptions.data
        .filter((sub) => sub.id !== subscriptionId)
        .map((sub) => sub.id),
    });
  } catch (error: any) {
    console.error('Update Subscription Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

