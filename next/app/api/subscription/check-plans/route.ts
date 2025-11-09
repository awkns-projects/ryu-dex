import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { stripe } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get all plans from database
    const dbPlans = await prisma.subscriptionPlan.findMany();

    // Get all prices from Stripe
    const stripePrices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    });

    // Get your actual subscriptions from Stripe
    const customer = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    });

    let userSubscriptions = [];
    if (customer.data[0]) {
      const subs = await stripe.subscriptions.list({
        customer: customer.data[0].id,
      });
      userSubscriptions = subs.data;
    }

    return NextResponse.json({
      plansInDatabase: dbPlans.map(p => ({
        id: p.id,
        name: p.name,
        stripePriceId: p.stripePriceId,
        active: p.active,
      })),
      pricesInStripe: stripePrices.data.map(price => ({
        id: price.id,
        product: typeof price.product === 'string' ? price.product : price.product?.name,
        active: price.active,
        amount: price.unit_amount,
      })),
      yourSubscriptions: userSubscriptions.map(sub => ({
        id: sub.id,
        status: sub.status,
        priceId: sub.items.data[0].price.id,
        metadata: sub.metadata,
      })),
      diagnosis: {
        dbPlansCount: dbPlans.length,
        stripePricesCount: stripePrices.data.length,
        yourSubsCount: userSubscriptions.length,
        priceIdMatch: userSubscriptions.length > 0
          ? dbPlans.some(p => p.stripePriceId === userSubscriptions[0].items.data[0].price.id)
          : false,
      }
    });
  } catch (error) {
    console.error('Error checking plans:', error);
    return NextResponse.json(
      { error: 'Failed to check plans', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

