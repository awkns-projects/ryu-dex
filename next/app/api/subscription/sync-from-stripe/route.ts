import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db/prisma';
import {
  createSubscription,
  getSubscriptionByStripeId,
  getSubscriptionPlanByStripePriceId
} from '@/lib/db/subscription-queries';

/**
 * Sync subscriptions from Stripe to database
 * This manually creates subscription records that webhooks failed to create
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔄 Starting subscription sync for:', session.user.email);

    // Get user from database
    const userData = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    const userId = userData.id;

    if (!userData.stripeCustomerId) {
      return NextResponse.json({
        error: 'No Stripe customer ID found',
        hint: 'User has not been linked to a Stripe customer yet'
      }, { status: 400 });
    }

    console.log('👤 Found user:', { userId, stripeCustomerId: userData.stripeCustomerId });

    // Get all active subscriptions from Stripe
    const stripeSubscriptions = await stripe.subscriptions.list({
      customer: userData.stripeCustomerId,
      status: 'active',
      expand: ['data.items.data.price'],
    });

    console.log('📦 Found', stripeSubscriptions.data.length, 'active subscriptions in Stripe');

    const syncResults = [];

    for (const stripeSub of stripeSubscriptions.data) {
      console.log('🔍 Processing subscription:', stripeSub.id);

      // Check if already exists in database
      const existing = await getSubscriptionByStripeId(stripeSub.id);

      if (existing) {
        console.log('⏭️  Subscription already exists in database:', stripeSub.id);
        syncResults.push({
          stripeId: stripeSub.id,
          action: 'skipped',
          reason: 'Already exists in database',
        });
        continue;
      }

      // Get plan from database
      const priceId = stripeSub.items.data[0].price.id;
      const plan = await getSubscriptionPlanByStripePriceId(priceId);

      if (!plan) {
        console.error('❌ Plan not found for price ID:', priceId);
        syncResults.push({
          stripeId: stripeSub.id,
          action: 'failed',
          reason: `Plan not found for price ID: ${priceId}`,
          hint: 'You may need to update the stripePriceId in your SubscriptionPlan table',
        });
        continue;
      }

      console.log('✅ Plan found:', { planId: plan.id, planName: plan.name });

      // Create subscription in database
      try {
        const created = await createSubscription({
          userId: userId,
          planId: plan.id,
          stripeSubscriptionId: stripeSub.id,
          stripeCustomerId: stripeSub.customer as string,
          status: stripeSub.status,
          startDate: new Date(stripeSub.current_period_start * 1000),
          endDate: stripeSub.current_period_end
            ? new Date(stripeSub.current_period_end * 1000)
            : undefined,
          active: true,
        });

        console.log('✅ Created subscription in database:', created.id);

        syncResults.push({
          stripeId: stripeSub.id,
          databaseId: created.id,
          action: 'created',
          planName: plan.name,
          status: stripeSub.status,
          active: true,
        });
      } catch (error) {
        console.error('❌ Failed to create subscription:', error);
        syncResults.push({
          stripeId: stripeSub.id,
          action: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${syncResults.length} subscriptions`,
      results: syncResults,
      summary: {
        total: syncResults.length,
        created: syncResults.filter(r => r.action === 'created').length,
        skipped: syncResults.filter(r => r.action === 'skipped').length,
        failed: syncResults.filter(r => r.action === 'failed').length,
      }
    });
  } catch (error) {
    console.error('❌ Sync error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync subscriptions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

