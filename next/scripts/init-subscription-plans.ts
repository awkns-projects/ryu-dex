/**
 * Initialize Subscription Plans in Stripe and Database
 * 
 * This script:
 * 1. Checks if products/prices exist in Stripe
 * 2. Creates them if they don't exist
 * 3. Syncs them to the database
 * 
 * Run with: npx tsx scripts/init-subscription-plans.ts
 */

import { stripe } from '../lib/stripe';
import { prisma } from '../lib/db/prisma';

interface PlanConfig {
  name: string;
  emoji: string;
  description: string;
  price: number; // in cents
  features: string[];
  isPopular: boolean;
  isInviteOnly: boolean;
  orderIndex: number;
}

const PLANS: PlanConfig[] = [
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
    price: 3000, // $30.00
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
    price: 20000, // $200.00
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

async function createOrGetStripeProduct(planName: string, description: string) {
  // Check if product exists
  const products = await stripe.products.search({
    query: `name:'${planName}'`,
  });

  if (products.data.length > 0) {
    console.log(`✅ Product exists: ${planName}`);
    return products.data[0];
  }

  // Create new product
  const product = await stripe.products.create({
    name: planName,
    description,
  });

  console.log(`✨ Created product: ${planName}`);
  return product;
}

async function createOrGetStripePrice(
  productId: string,
  planName: string,
  priceInCents: number
) {
  // For free plans, return empty price ID
  if (priceInCents === 0) {
    console.log(`⚠️  Free plan ${planName} - no Stripe price needed`);
    return null;
  }

  // Check if price exists for this product
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
  });

  const existingPrice = prices.data.find(
    (p) => p.unit_amount === priceInCents && p.recurring?.interval === 'month'
  );

  if (existingPrice) {
    console.log(`✅ Price exists for ${planName}: ${existingPrice.id}`);
    return existingPrice;
  }

  // Create new price
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: priceInCents,
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    nickname: `${planName} Monthly`,
  });

  console.log(`✨ Created price for ${planName}: ${price.id}`);
  return price;
}

async function syncPlanToDatabase(plan: PlanConfig, stripePriceId: string) {
  // Check if plan exists in database
  const existing = await prisma.subscriptionPlan.findFirst({
    where: { name: plan.name }
  });

  if (existing) {
    // Update existing plan
    await prisma.subscriptionPlan.update({
      where: { id: existing.id },
      data: {
        emoji: plan.emoji,
        description: plan.description,
        price: plan.price,
        features: plan.features,
        stripePriceId: stripePriceId || '',
        isPopular: plan.isPopular,
        isInviteOnly: plan.isInviteOnly,
        orderIndex: plan.orderIndex,
        updatedAt: new Date(),
      }
    });

    console.log(`✅ Updated database plan: ${plan.name}`);
    return existing;
  }

  // Create new plan in database
  const result = await prisma.subscriptionPlan.create({
    data: {
      name: plan.name,
      emoji: plan.emoji,
      description: plan.description,
      price: plan.price,
      currency: 'USD',
      features: plan.features,
      stripePriceId: stripePriceId || '',
      active: true,
      isPopular: plan.isPopular,
      isInviteOnly: plan.isInviteOnly,
      orderIndex: plan.orderIndex,
    }
  });

  console.log(`✨ Created database plan: ${plan.name}`);
  return result;
}

async function initializePlans() {
  console.log('🚀 Starting subscription plans initialization...\n');

  for (const plan of PLANS) {
    console.log(`\n📦 Processing plan: ${plan.emoji} ${plan.name}`);
    console.log(`   Price: $${(plan.price / 100).toFixed(2)}/month`);

    try {
      // Step 1: Create or get Stripe product
      const product = await createOrGetStripeProduct(plan.name, plan.description);

      // Step 2: Create or get Stripe price
      const price = await createOrGetStripePrice(
        product.id,
        plan.name,
        plan.price
      );

      // Step 3: Sync to database
      await syncPlanToDatabase(plan, price?.id || '');

      console.log(`✅ ${plan.name} plan ready!\n`);
    } catch (error) {
      console.error(`❌ Error processing ${plan.name}:`, error);
    }
  }

  console.log('\n🎉 Subscription plans initialization complete!');
  console.log('\n📋 Summary:');

  const dbPlans = await prisma.subscriptionPlan.findMany({
    orderBy: { orderIndex: 'asc' }
  });

  dbPlans.forEach((p) => {
    console.log(`   ${p.emoji} ${p.name} - $${(p.price / 100).toFixed(2)}/month`);
    console.log(`      Stripe Price ID: ${p.stripePriceId || 'N/A (Free)'}`);
  });

  await prisma.$disconnect();
  process.exit(0);
}

// Run the initialization
initializePlans().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
