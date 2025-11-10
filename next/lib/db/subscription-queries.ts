import { prisma } from './prisma';

export async function getActiveSubscriptionByUserId(userId: string) {
  return await prisma.subscription.findFirst({
    where: {
      userId,
      active: true
    },
    include: {
      plan: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getActiveSubscriptionByEmail(email: string) {
  console.log('🔍 getActiveSubscriptionByEmail called with:', email);

  // First, check if user exists
  const user = await prisma.user.findUnique({
    where: { email }
  });

  console.log('👤 User check:', user ? `Found user: ${user.id}` : 'User not found');

  if (!user) {
    console.log('❌ User with email', email, 'does not exist in database');
    return null;
  }

  // Check all subscriptions for this user (without active filter)
  const allUserSubs = await prisma.subscription.findMany({
    where: { userId: user.id }
  });

  console.log('📋 Total subscriptions for user:', allUserSubs.length);
  if (allUserSubs.length > 0) {
    console.log('📊 Subscription details:', allUserSubs.map(s => ({
      id: s.id,
      status: s.status,
      active: s.active,
      planId: s.planId,
    })));
  }

  // Now get the active subscription with plan details
  const result = await prisma.subscription.findFirst({
    where: {
      user: {
        email
      },
      active: true
    },
    include: {
      plan: true,
      user: true
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log('📊 Query result:', result ? 'Found subscription' : 'No subscription found');

  if (result) {
    console.log('✅ Subscription details:', {
      planName: result.plan.name,
      status: result.status,
      active: result.active,
      userId: result.userId,
    });
  } else {
    console.log('⚠️ No active subscription found. Requirements: user.email =', email, 'AND subscription.active = true');
  }

  return result;
}

export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  return await prisma.subscription.findUnique({
    where: { stripeSubscriptionId },
    include: {
      plan: true,
      user: true
    }
  });
}

export async function getAllSubscriptionsByUserId(userId: string) {
  return await prisma.subscription.findMany({
    where: { userId },
    include: {
      plan: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getSubscriptionWithPayments(subscriptionId: string) {
  return await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      plan: true,
      payments: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });
}

export async function getAllActiveSubscriptionPlans() {
  return await prisma.subscriptionPlan.findMany({
    where: { active: true },
    orderBy: { orderIndex: 'asc' }
  });
}

export async function getSubscriptionPlanById(planId: string) {
  return await prisma.subscriptionPlan.findUnique({
    where: { id: planId }
  });
}

export async function getSubscriptionPlanByStripePriceId(stripePriceId: string) {
  return await prisma.subscriptionPlan.findUnique({
    where: { stripePriceId }
  });
}

export async function createSubscription(data: {
  userId: string;
  planId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: string;
  startDate: Date;
  endDate?: Date;
  active?: boolean;
}) {
  return await prisma.subscription.create({
    data: {
      ...data,
      status: data.status as any, // Stripe status strings
      active: data.active ?? true,
    }
  });
}

export async function updateSubscription(
  subscriptionId: string,
  data: Partial<{
    status: string;
    endDate: Date;
    cancelDate: Date;
    stoppedDate: Date;
    active: boolean;
    cancelAtPeriodEnd: boolean;
    upgradeInitiated: boolean;
    planId: string;
  }>
) {
  const updateData: any = { ...data, updatedAt: new Date() };
  if (data.status) updateData.status = data.status as any;

  return await prisma.subscription.update({
    where: { id: subscriptionId },
    data: updateData
  });
}

export async function updateSubscriptionByStripeId(
  stripeSubscriptionId: string,
  data: Partial<{
    status: string;
    endDate: Date;
    cancelDate: Date;
    stoppedDate: Date;
    active: boolean;
    cancelAtPeriodEnd: boolean;
    upgradeInitiated: boolean;
    planId: string;
  }>
) {
  const updateData: any = { ...data, updatedAt: new Date() };
  if (data.status) updateData.status = data.status as any;

  return await prisma.subscription.update({
    where: { stripeSubscriptionId },
    data: updateData
  });
}

export async function createPayment(data: {
  subscriptionId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  invoiceId?: string;
  invoiceUrl?: string;
  stripePaymentIntentId?: string;
}) {
  return await prisma.payment.create({
    data: {
      ...data,
      status: data.status as any, // Stripe payment status strings
    }
  });
}

export async function updatePayment(
  paymentId: string,
  data: Partial<{
    status: string;
    invoiceUrl: string;
    stripePaymentIntentId: string;
  }>
) {
  const updateData: any = { ...data, updatedAt: new Date() };
  if (data.status) updateData.status = data.status as any;

  return await prisma.payment.update({
    where: { id: paymentId },
    data: updateData
  });
}

export async function getPaymentByInvoiceId(invoiceId: string) {
  return await prisma.payment.findFirst({
    where: { invoiceId }
  });
}

export async function getUnusedInviteCodeByUserId(userId: string, planId: string) {
  return await prisma.inviteCode.findFirst({
    where: {
      userId,
      planId,
      isUsed: false
    }
  });
}

export async function markInviteCodeAsUsed(codeId: string, userId: string) {
  return await prisma.inviteCode.update({
    where: { id: codeId },
    data: {
      isUsed: true,
      usedAt: new Date(),
      userId,
      updatedAt: new Date(),
    }
  });
}

export async function verifyInviteCode(code: string, planId: string) {
  return await prisma.inviteCode.findFirst({
    where: {
      code,
      planId,
      isUsed: false
    }
  });
}

export async function updateUserStripeCustomerId(userId: string, stripeCustomerId: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId }
  });
}
