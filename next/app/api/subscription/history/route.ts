import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get user to find their Stripe customer ID
    const userData = await prisma.user.findUnique({
      where: { email },
      select: { stripeCustomerId: true }
    });

    if (!userData || !userData.stripeCustomerId) {
      return NextResponse.json({ subscriptions: [] });
    }

    // Get subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: userData.stripeCustomerId,
      limit: 100,
    });

    // Format subscriptions with payment details
    const formattedSubscriptions = await Promise.all(
      subscriptions.data.map(async (sub) => {
        // Get the price details
        const price = sub.items.data[0]?.price;

        // Get invoices for this subscription
        const invoices = await stripe.invoices.list({
          subscription: sub.id,
          limit: 100,
        });

        const payments = invoices.data
          .filter((inv) => inv.status === 'paid')
          .map((inv) => ({
            id: inv.id,
            amount: inv.amount_paid / 100,
            currency: inv.currency.toUpperCase(),
            paymentStatus: 'completed',
            paymentMethod: 'stripe',
            invoiceId: inv.id,
            createdAt: new Date(inv.created * 1000),
            invoiceUrl: inv.hosted_invoice_url,
          }));

        return {
          id: sub.id,
          startDate: new Date(sub.current_period_start * 1000),
          endDate: sub.current_period_end
            ? new Date(sub.current_period_end * 1000)
            : null,
          status: sub.status,
          collectionMethod: sub.collection_method || 'charge_automatically',
          plan: {
            name: price?.nickname || 'Unknown Plan',
            price: price?.unit_amount ? price.unit_amount / 100 : 0,
            currency: price?.currency?.toUpperCase() || 'USD',
            description: price?.product
              ? typeof price.product === 'string'
                ? price.product
                : (price.product as any).description || ''
              : '',
          },
          payments,
        };
      })
    );

    return NextResponse.json({ subscriptions: formattedSubscriptions });
  } catch (error) {
    console.error('Error fetching subscription history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription history' },
      { status: 500 }
    );
  }
}
