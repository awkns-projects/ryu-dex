import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@/lib/auth';
import Stripe from 'stripe';
import { prisma } from '@/lib/db/prisma';
import { getActiveSubscriptionByUserId } from '@/lib/db/subscription-queries';

export async function POST(request: NextRequest) {
  try {
    const { plan, userId, currentSubscriptionId, isUpgrade } = await request.json();

    console.log('Creating checkout session:', { plan, userId, isUpgrade });

    if (!plan || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get user data
    const userData = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userRecord = userData;

    // Get user's active subscription
    const activeSubscription = await getActiveSubscriptionByUserId(userId);

    // Get locale from referrer URL or default to 'en'
    const referer = request.headers.get('referer') || '';
    const localeMatch = referer.match(/\/(en|zh-TW|zh)\//);
    const locale = localeMatch ? localeMatch[1] : 'en';

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    console.log('Locale detected:', locale);
    console.log('Success URL:', `${baseUrl}/${locale}/subscription/success`);

    let sessionConfig: Stripe.Checkout.SessionCreateParams;

    // Configure checkout session
    sessionConfig = {
      mode: 'subscription',
      payment_method_types: ['card'],
      ...(userRecord.stripeCustomerId
        ? { customer: userRecord.stripeCustomerId }
        : { customer_email: userRecord.email }),
      line_items: [
        {
          price: plan,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/${locale}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${locale}/subscription/canceled`,
      metadata: {
        userId,
        isUpgrade: isUpgrade ? 'true' : 'false',
        subscriptionId: activeSubscription?.id || '',
      },
      subscription_data: {
        metadata: {
          userId,
          isUpgrade: isUpgrade ? 'true' : 'false',
          subscriptionId: activeSubscription?.id || '',
        },
      },
    };

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
