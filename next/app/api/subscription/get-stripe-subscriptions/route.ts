import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db/prisma';
import { format } from 'date-fns';
import Stripe from 'stripe';
import {
  getSubscriptionByStripeId,
  createSubscription,
  getSubscriptionPlanByStripePriceId
} from '@/lib/db/subscription-queries';

const formatTimestamp = (timestamp: number) => {
  return format(new Date(timestamp * 1000), 'yyyy/MM/dd HH:mm');
};

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    const userData = await prisma.user.findUnique({
      where: { email }
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const customerId = userData.stripeCustomerId;
    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Get all subscriptions (sorted by creation time descending)
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      expand: ['data.plan.product', 'data.latest_invoice'],
      limit: 100,
      status: 'all', // Include canceled subscriptions
    });

    // Filter active subscriptions
    const activeSubscriptions = subscriptions.data.filter((sub) =>
      ['active', 'trialing'].includes(sub.status)
    );

    // Sort by creation time (newest first)
    const sortedSubscriptions = activeSubscriptions.sort(
      (a, b) => b.created - a.created
    );

    // Latest active subscription
    const latestSubscription =
      sortedSubscriptions.length > 0 ? sortedSubscriptions[0] : null;

    // AUTO-SYNC: Check if latest subscription exists in database, if not create it
    let currentPlan = 'Free';
    if (latestSubscription) {
      console.log('🔍 Checking if subscription exists in DB:', latestSubscription.id);

      const existsInDb = await getSubscriptionByStripeId(latestSubscription.id);

      if (!existsInDb) {
        console.log('💾 Subscription not in DB, creating it now...');

        // Get plan from database using Stripe price ID
        const priceId = latestSubscription.items.data[0].price.id;
        const plan = await getSubscriptionPlanByStripePriceId(priceId);

        if (plan) {
          try {
            await createSubscription({
              userId: userData.id,
              planId: plan.id,
              stripeSubscriptionId: latestSubscription.id,
              stripeCustomerId: latestSubscription.customer as string,
              status: latestSubscription.status,
              startDate: new Date(latestSubscription.current_period_start * 1000),
              endDate: new Date(latestSubscription.current_period_end * 1000),
              active: true,
            });
            console.log('✅ Subscription synced to database');
            currentPlan = plan.name;
          } catch (error) {
            console.error('❌ Failed to sync subscription to DB:', error);
            // Still return the plan from Stripe even if DB sync fails
            currentPlan = (latestSubscription.items.data[0].price.product as any)?.name || 'Pro';
          }
        } else {
          console.error('❌ Plan not found for price ID:', priceId);
          // Return plan name from Stripe product
          currentPlan = (latestSubscription.items.data[0].price.product as any)?.name || 'Pro';
        }
      } else {
        console.log('✅ Subscription already in DB');
        // Get plan name from the existing DB record
        const plan = await getSubscriptionPlanByStripePriceId(latestSubscription.items.data[0].price.id);
        currentPlan = plan?.name || 'Pro';
      }
    }

    // Other active subscriptions to cancel
    const subscriptionsToCancel = latestSubscription
      ? sortedSubscriptions.filter((sub) => sub.id !== latestSubscription.id)
      : [];

    // Cancel duplicate subscriptions
    if (subscriptionsToCancel.length > 0) {
      for (const sub of subscriptionsToCancel) {
        await stripe.subscriptions.update(sub.id, {
          cancel_at_period_end: true,
          metadata: {
            cancelReason: 'duplicate_subscription',
          },
        });
      }
    }

    // Format all subscription data
    const formattedSubscriptions = subscriptions.data.map((sub: any) => ({
      active: sub.status === 'active',
      id: sub.id,
      isLatest: latestSubscription ? sub.id === latestSubscription.id : false,
      startDate: formatTimestamp(sub.current_period_start),
      endDate: formatTimestamp(sub.current_period_end),
      status: sub.status,
      plan: {
        id: sub.plan.id,
        name: (sub.plan.product as Stripe.Product).name,
        price: sub.plan.amount ? sub.plan.amount / 100 : 0,
        currency: sub.plan.currency.toUpperCase(),
        description: sub.plan.product.description,
      },
      stripeCustomerId: sub.customer,
      stripeSubscriptionId: sub.id,
      planId: sub.plan.id,
      paymentMethod: sub.default_payment_method,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      collectionMethod: sub.collection_method,
      payments: sub.latest_invoice
        ? [
          {
            id: sub.latest_invoice.id,
            amount: sub.latest_invoice.total / 100,
            currency: sub.latest_invoice.currency.toUpperCase(),
            paymentStatus: sub.latest_invoice.status,
            paymentMethod: sub.latest_invoice.payment_method,
            invoiceId: sub.latest_invoice.id,
            createdAt: sub.latest_invoice.created,
            invoiceUrl: sub.latest_invoice.hosted_invoice_url,
            transactionId: sub.latest_invoice.payment_intent,
          },
        ]
        : [],
      userId: sub.metadata.userId,
    }));

    return NextResponse.json({
      subscriptions: formattedSubscriptions,
      latestSubscription: latestSubscription
        ? {
          id: latestSubscription.id,
          status: latestSubscription.status,
        }
        : null,
      cancelledCount: subscriptionsToCancel.length,
      currentPlan, // Add current plan for subscription badge and usage banner
      hasActiveSubscription: !!latestSubscription,
    });
  } catch (error) {
    console.error('Error fetching Stripe subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

