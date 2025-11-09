import { NextResponse } from 'next/server';
import { getAllActiveSubscriptionPlans } from '@/lib/db/subscription-queries';

export async function GET() {
  try {
    const plans = await getAllActiveSubscriptionPlans();

    // Format the plans for frontend consumption
    const formattedPlans = plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      emoji: plan.emoji || '🌟',
      price:
        plan.price === 0 && plan.isInviteOnly === true
          ? 'Invite only'
          : plan.price === 0
            ? 'Free'
            : `$${(plan.price / 100).toFixed(2)}/month`,
      description: plan.description || '',
      features: plan.features ? (plan.features as string[]) : [],
      color: 'from-gray-400 to-gray-500',
      stripePriceId: plan.stripePriceId ?? '',
      isPopular: plan.isPopular,
      isInviteOnly: plan.isInviteOnly,
      index: plan.orderIndex,
      amount: plan.price,
      currency: plan.currency,
    }));

    return NextResponse.json(formattedPlans);
  } catch (error) {
    console.error('Failed to fetch subscription plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}

