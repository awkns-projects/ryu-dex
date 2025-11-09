import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { updateUserStripeCustomerId } from '@/lib/db/subscription-queries';

export async function POST(request: NextRequest) {
  try {
    const { email, name, metadata, userId } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });

    let customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email,
        name,
        metadata,
      });
    }

    // Update user with Stripe customer ID if userId provided
    if (userId) {
      await updateUserStripeCustomerId(userId, customer.id);
    }

    return NextResponse.json({
      customerId: customer.id,
      customer,
    });
  } catch (error) {
    console.error('Error creating/retrieving Stripe customer:', error);
    return NextResponse.json(
      { error: 'Failed to create/retrieve customer' },
      { status: 500 }
    );
  }
}

