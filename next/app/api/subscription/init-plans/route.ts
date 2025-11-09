/**
 * API route to initialize subscription plans on-the-fly
 * Checks Stripe and creates plans if they don't exist
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db/prisma';

const PLANS = [
  {
    name: 'Free',
    emoji: '🌱',
    description: 'Perfect for getting started',
    price: 0,
    features: [
      '100 AI reasoning generations per month',
      '10 AI image generations per month',
      '5 AI video generations per month',
      '1,000 API calls per month',
      'Community support',
    ],
    isPopular: false,
    isInviteOnly: false,
    orderIndex: 1,
  },
  {
    name: 'Pro',
    emoji: '🚀',
    description: 'For professionals and growing teams',
    price: 3000,
    features: [
      '10,000 AI reasoning generations per month',
      '1,000 AI image generations per month',
      '100 AI video generations per month',
      '100,000 API calls per month',
      'Priority support',
      'Advanced analytics',
      'Extra $0.01 per additional 100 calls',
    ],
    isPopular: true,
    isInviteOnly: false,
    orderIndex: 2,
  },
  {
    name: 'Enterprise',
    emoji: '☁️',
    description: 'Private cloud with unlimited scaling',
    price: 20000,
    features: [
      'Unlimited AI reasoning generations',
      'Unlimited AI image generations',
      'Unlimited AI video generations',
      'Unlimited API calls',
      'Private cloud deployment',
      'Dedicated support team',
      'Custom integrations',
      'SLA guarantees',
      'Extra $0.005 per additional 1,000 calls',
    ],
    isPopular: false,
    isInviteOnly: false,
    orderIndex: 3,
  },
];

export async function POST(request: NextRequest) {
  try {
    const results = [];

    for (const plan of PLANS) {
      // Check if product exists in Stripe
      const products = await stripe.products.search({
        query: `name:'${plan.name}'`,
      });

      let product;
      if (products.data.length > 0) {
        product = products.data[0];
      } else {
        // Create product
        product = await stripe.products.create({
          name: plan.name,
          description: plan.description,
        });
      }

      // Get or create price
      let priceId = '';
      if (plan.price > 0) {
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
        });

        const existingPrice = prices.data.find(
          (p) => p.unit_amount === plan.price && p.recurring?.interval === 'month'
        );

        if (existingPrice) {
          priceId = existingPrice.id;
        } else {
          const newPrice = await stripe.prices.create({
            product: product.id,
            unit_amount: plan.price,
            currency: 'usd',
            recurring: {
              interval: 'month',
            },
            nickname: `${plan.name} Monthly`,
          });
          priceId = newPrice.id;
        }
      }

      // Sync to database
      const existing = await prisma.subscriptionPlan.findFirst({
        where: { name: plan.name }
      });

      if (existing) {
        await prisma.subscriptionPlan.update({
          where: { id: existing.id },
          data: {
            emoji: plan.emoji,
            description: plan.description,
            price: plan.price,
            features: plan.features,
            stripePriceId: priceId,
            isPopular: plan.isPopular,
            isInviteOnly: plan.isInviteOnly,
            orderIndex: plan.orderIndex,
            updatedAt: new Date(),
          }
        });

        results.push({ plan: plan.name, action: 'updated', priceId });
      } else {
        await prisma.subscriptionPlan.create({
          data: {
            name: plan.name,
            emoji: plan.emoji,
            description: plan.description,
            price: plan.price,
            currency: 'USD',
            features: plan.features,
            stripePriceId: priceId,
            active: true,
            isPopular: plan.isPopular,
            isInviteOnly: plan.isInviteOnly,
            orderIndex: plan.orderIndex,
          }
        });

        results.push({ plan: plan.name, action: 'created', priceId });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription plans initialized',
      results,
    });
  } catch (error) {
    console.error('Error initializing plans:', error);
    return NextResponse.json(
      { error: 'Failed to initialize plans' },
      { status: 500 }
    );
  }
}
