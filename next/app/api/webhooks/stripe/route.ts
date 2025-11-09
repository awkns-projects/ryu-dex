import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db/prisma';
import {
  createSubscription,
  updateSubscriptionByStripeId,
  getSubscriptionByStripeId,
  createPayment,
  updatePayment,
  getPaymentByInvoiceId,
  getSubscriptionPlanByStripePriceId,
  getUnusedInviteCodeByUserId,
  markInviteCodeAsUsed,
  updateUserStripeCustomerId,
} from '@/lib/db/subscription-queries';
import {
  sendSubscriptionSuccessEmail,
  sendSubscriptionCancelledEmail,
  sendPaymentFailedEmail,
} from '@/lib/subscription-emails';

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'payment_intent.payment_failed',
]);

// Map Stripe status to our subscription status
function mapStripeStatusToSubscriptionStatus(stripeStatus: string) {
  const statusMap: Record<string, string> = {
    active: 'active',
    canceled: 'canceled',
    incomplete: 'unpaid',
    incomplete_expired: 'expired',
    past_due: 'past_due',
    trialing: 'trialing',
    unpaid: 'unpaid',
  };
  return statusMap[stripeStatus] || 'unpaid';
}

// Convert Stripe price (cents) to decimal
function convertStripePriceToDecimal(amount: number): number {
  return Math.round(amount);
}

// Handle new subscription creation
async function handleNewSubscription(invoice: Stripe.Invoice, userId: string) {
  console.log('🆕 handleNewSubscription called:', { invoiceId: invoice.id, userId });

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  console.log('📦 Stripe subscription retrieved:', {
    id: subscription.id,
    status: subscription.status,
    priceId: subscription.items.data[0].price.id
  });

  // Get subscription plan
  const plan = await getSubscriptionPlanByStripePriceId(subscription.items.data[0].price.id);

  if (!plan) {
    console.error('❌ Subscription plan not found for price:', subscription.items.data[0].price.id);
    console.error('❌ This is why subscription was not created in database!');
    return;
  }

  console.log('✅ Plan found:', { planId: plan.id, planName: plan.name });

  // Check if subscription plan is invite-only and use invite code
  if (plan.isInviteOnly) {
    console.log('🎫 Plan is invite-only, checking for invite code...');
    const inviteCode = await getUnusedInviteCodeByUserId(userId, plan.id);
    if (inviteCode) {
      await markInviteCodeAsUsed(inviteCode.id, userId);
      console.log('✅ Invite code marked as used');
    } else {
      console.log('⚠️ No unused invite code found for user');
    }
  }

  // Create subscription in database
  console.log('💾 Creating subscription in database with active: true');
  try {
    const createdSubscription = await createSubscription({
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      status: mapStripeStatusToSubscriptionStatus(subscription.status),
      startDate: new Date(subscription.current_period_start * 1000),
      endDate: new Date(subscription.current_period_end * 1000),
      active: true,
      planId: plan.id,
      userId: userId,
    });

    console.log('✅ Subscription created in database:', {
      id: createdSubscription.id,
      active: createdSubscription.active
    });

    // Update user with Stripe customer ID
    await updateUserStripeCustomerId(userId, subscription.customer as string);
    console.log('✅ User updated with Stripe customer ID');

    return createdSubscription;
  } catch (error) {
    console.error('❌ Failed to create subscription in database:', error);
    throw error;
  }
}

// Handle subscription update
async function handleSubscriptionUpdate(invoiceSubscriptionId: string, userId: string) {
  const subscription = await stripe.subscriptions.retrieve(invoiceSubscriptionId);

  const plan = await getSubscriptionPlanByStripePriceId(subscription.items.data[0].price.id);

  if (!plan) {
    console.error('Subscription plan not found for price:', subscription.items.data[0].price.id);
    return;
  }

  // Check if subscription plan is invite-only
  if (plan.isInviteOnly) {
    const inviteCode = await getUnusedInviteCodeByUserId(userId, plan.id);
    if (inviteCode) {
      await markInviteCodeAsUsed(inviteCode.id, userId);
    }
  }

  // Update subscription
  const updatedSubscription = await updateSubscriptionByStripeId(subscription.id, {
    status: mapStripeStatusToSubscriptionStatus(subscription.status),
    endDate: new Date(subscription.current_period_end * 1000),
    planId: plan.id,
  });

  return updatedSubscription;
}

// Handle subscription deletion/cancellation
async function handleSubscriptionDeletion(subscriptionId: string) {
  try {
    const subscriptionStripe = await stripe.subscriptions.retrieve(subscriptionId);
    const { userId } = subscriptionStripe.metadata;

    if (!userId) {
      console.error('No user ID found in subscription metadata');
      return;
    }

    // Update subscription in database
    await updateSubscriptionByStripeId(subscriptionId, {
      active: false,
      status: 'canceled',
      cancelDate: new Date(),
      stoppedDate: new Date(),
      cancelAtPeriodEnd: false,
    });

    // Send cancellation email
    try {
      const userData = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (userData) {
        const plan = await getSubscriptionPlanByStripePriceId(
          subscriptionStripe.items.data[0].price.id
        );

        if (plan) {
          await sendSubscriptionCancelledEmail({
            to: userData.email,
            name: userData.name || undefined,
            planName: plan.name,
            endDate: subscriptionStripe.current_period_end
              ? new Date(subscriptionStripe.current_period_end * 1000).toLocaleDateString()
              : undefined,
            locale: 'en',
          });
        }
      }
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
    }

    return true;
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
    return false;
  }
}

// Handle payment failure
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) {
      console.error('No subscription ID found in invoice:', invoice.id);
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const { userId } = subscription.metadata;

    if (!userId) {
      console.error('No user ID found in subscription metadata:', subscriptionId);
      return;
    }

    // Update subscription status
    await updateSubscriptionByStripeId(subscriptionId, {
      status: 'past_due',
    });

    // Check for existing payment record
    const existingPayment = await getPaymentByInvoiceId(invoice.id);

    if (existingPayment) {
      // Update existing payment record
      await updatePayment(existingPayment.id, {
        status: 'failed',
        paymentStatus: 'failed',
      });
    } else {
      // Create new payment record for failed payment
      const subscriptionData = await getSubscriptionByStripeId(subscriptionId);
      if (subscriptionData) {
        await createPayment({
          subscriptionId: subscriptionData.id,
          amount: convertStripePriceToDecimal(invoice.amount_due),
          currency: invoice.currency.toUpperCase(),
          status: 'failed',
          paymentStatus: 'failed',
          paymentMethod: 'stripe',
          invoiceId: invoice.id,
          invoiceUrl: invoice.hosted_invoice_url || undefined,
        });
      }
    }

    // Send payment failed email
    try {
      const userData = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (userData) {
        const plan = await getSubscriptionPlanByStripePriceId(
          subscription.items.data[0].price.id
        );

        if (plan) {
          await sendPaymentFailedEmail({
            to: userData.email,
            name: userData.name || undefined,
            planName: plan.name,
            amount: invoice.amount_due,
            locale: 'en',
          });
        }
      }
    } catch (emailError) {
      console.error('Failed to send payment failed email:', emailError);
    }

    return true;
  } catch (error) {
    console.error('Error handling payment failure:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const sigHeader = headers().get('stripe-signature') || '';
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        payload,
        sigHeader,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (relevantEvents.has(event.type)) {
      try {
        switch (event.type) {
          case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            console.log('Checkout session completed:', session.id);
            break;
          }

          case 'customer.subscription.created': {
            const subscription = event.data.object as Stripe.Subscription;
            console.log('Subscription created:', subscription.id);
            break;
          }

          case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription;
            const { userId } = subscription.metadata;

            console.log('Subscription updated:', subscription.id);

            // Check if subscription is marked for cancellation at period end
            if (subscription.cancel_at_period_end) {
              await updateSubscriptionByStripeId(subscription.id, {
                cancelAtPeriodEnd: true,
              });
            }
            break;
          }

          case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            console.log('Subscription deleted:', subscription.id);
            await handleSubscriptionDeletion(subscription.id);
            break;
          }

          case 'invoice.paid': {
            const invoice = event.data.object as Stripe.Invoice;
            console.log('Invoice paid:', invoice.id);

            // Try to find existing subscription
            let subscription = null;
            let retryCount = 0;
            const maxRetries = 3;

            while (!subscription && retryCount < maxRetries) {
              subscription = await getSubscriptionByStripeId(invoice.subscription as string);

              if (!subscription) {
                console.log(`Retry ${retryCount + 1}: Waiting for subscription record...`);
                await new Promise((resolve) => setTimeout(resolve, 1000));
                retryCount++;
              }
            }

            if (!subscription) {
              // Get subscription info from Stripe to create it
              const stripeSubscription = await stripe.subscriptions.retrieve(
                invoice.subscription as string
              );

              const userId = stripeSubscription.metadata.userId;
              if (userId) {
                await handleNewSubscription(invoice, userId);
              }
            }
            break;
          }

          case 'invoice.payment_succeeded': {
            const invoice = event.data.object as Stripe.Invoice;
            console.log('Invoice payment succeeded:', invoice.id);

            const subscriptionStripe = await stripe.subscriptions.retrieve(
              invoice.subscription as string
            );
            const { userId, isUpgrade } = subscriptionStripe.metadata;

            if (!userId) {
              console.error('Missing userId in metadata:', subscriptionStripe.id);
              break;
            }

            const isUpgradeBoolean = isUpgrade === 'true';

            let subscription = null;

            // Set default payment method if available
            if (invoice.payment_intent && subscriptionStripe.default_payment_method) {
              try {
                await stripe.customers.update(subscriptionStripe.customer as string, {
                  invoice_settings: {
                    default_payment_method: subscriptionStripe.default_payment_method as string,
                  },
                });
                console.log('Default payment method set successfully');
              } catch (error) {
                console.error('Failed to set default payment method:', error);
              }
            }

            if (isUpgradeBoolean) {
              console.log('Processing upgrade subscription');
              subscription = await handleSubscriptionUpdate(
                invoice.subscription as string,
                userId
              );
            } else {
              console.log('Processing new subscription');
              subscription = await handleNewSubscription(invoice, userId);
            }

            // Send success email
            if (subscription) {
              try {
                const userData = await prisma.user.findUnique({
                  where: { id: userId }
                });

                if (userData) {
                  const plan = await getSubscriptionPlanByStripePriceId(
                    subscriptionStripe.items.data[0].price.id
                  );

                  if (plan) {
                    await sendSubscriptionSuccessEmail({
                      to: userData.email,
                      name: userData.name || undefined,
                      planName: plan.name,
                      locale: 'en',
                    });
                  }
                }
              } catch (emailError) {
                console.error('Failed to send success email:', emailError);
              }
            }

            // Handle payment record
            const existingPayment = await getPaymentByInvoiceId(invoice.id);

            if (existingPayment) {
              await updatePayment(existingPayment.id, {
                invoiceUrl: invoice.hosted_invoice_url || undefined,
                stripePaymentIntentId: invoice.payment_intent as string,
              });
            } else if (subscription) {
              await createPayment({
                subscriptionId: subscription.id,
                amount: convertStripePriceToDecimal(invoice.amount_paid),
                currency: invoice.currency.toUpperCase(),
                status: 'completed',
                paymentStatus: 'completed',
                paymentMethod: 'stripe',
                invoiceId: invoice.id,
                invoiceUrl: invoice.hosted_invoice_url || undefined,
                stripePaymentIntentId: (invoice.payment_intent as string) || undefined,
              });
            }
            break;
          }

          case 'invoice.payment_failed': {
            const invoice = event.data.object as Stripe.Invoice;
            console.log('Invoice payment failed:', invoice.id);
            await handlePaymentFailed(invoice);
            break;
          }

          case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            console.log('Payment intent failed:', paymentIntent.id);

            if (paymentIntent.invoice) {
              const invoice = await stripe.invoices.retrieve(paymentIntent.invoice as string);
              await handlePaymentFailed(invoice);
            }
            break;
          }

          default:
            console.log(`Unhandled event type: ${event.type}`);
            return NextResponse.json({ received: true });
        }

        return NextResponse.json({ received: true });
      } catch (error: any) {
        console.error(`Error processing webhook event: ${error.message}`);
        return NextResponse.json(
          { error: 'Webhook handler failed' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Webhook error: ${error.message}`);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

