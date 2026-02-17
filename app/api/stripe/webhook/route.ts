import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe/config';
import { createPurchaseRecord } from '@/lib/stripe/pass-utils';
import Stripe from 'stripe';
import { captureStripeError, trackCheckoutResult } from '@/lib/sentry';

// Stripe Webhook Handler
// Handles checkout.session.completed event to create purchase records

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Extract metadata
        const email = session.customer_email || session.metadata?.email;
        const userId = session.metadata?.userId;

        if (!email) {
          console.error('No email found in checkout session:', session.id);
          return NextResponse.json(
            { error: 'Email not found' },
            { status: 400 }
          );
        }

        // Get payment intent
        const paymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id;

        if (!paymentIntentId) {
          console.error('No payment intent found:', session.id);
          return NextResponse.json(
            { error: 'Payment intent not found' },
            { status: 400 }
          );
        }

        // Create purchase record
        const purchase = await createPurchaseRecord({
          email,
          userId: userId || undefined,
          sessionId: session.id,
          paymentIntentId,
        });

        if (!purchase) {
          console.error('Failed to create purchase record:', session.id);
          return NextResponse.json(
            { error: 'Failed to create purchase' },
            { status: 500 }
          );
        }

        console.log('Purchase created successfully:', {
          purchaseId: purchase.id,
          // Do not log email (PII)
          hasUserId: !!userId,
          sessionId: session.id.substring(0, 20) + '...',
        });
        trackCheckoutResult(true);

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error('Payment failed:', paymentIntent.id);
        // Optionally: Update purchase record to 'failed' status
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    captureStripeError(error, { status: 'webhook_processing_failed' });
    trackCheckoutResult(false);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
