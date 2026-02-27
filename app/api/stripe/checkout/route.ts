import { NextRequest, NextResponse } from 'next/server';
import { stripe, EXPORT_PASS_CONFIG } from '@/lib/stripe/config';
import { createRouteClient } from '@/lib/supabase/route-client';
import { captureStripeError } from '@/lib/sentry';
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

// Create Stripe Checkout Session for Export Pass purchase

export async function POST(request: NextRequest) {
  // Rate limit: 5 req/hour per IP to prevent checkout session spam.
  // Per-email limiting is applied after body parsing (see below).
  const ip = getClientIp(request);
  const ipRl = await rateLimit(`checkout:ip:${ip}`, 5, 60 * 60_000);
  if (!ipRl.allowed) return rateLimitResponse(ipRl.resetAt);

  try {
    const { email, userId } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Additional per-email rate limit: 3 checkout sessions per hour per email.
    const emailRl = await rateLimit(`checkout:email:${email.toLowerCase()}`, 3, 60 * 60_000);
    if (!emailRl.allowed) return rateLimitResponse(emailRl.resetAt);

    // Check if user already has active pass
    const supabase = createRouteClient();
    const now = new Date().toISOString();

    let query = supabase
      .from('purchases')
      .select('id')
      .eq('status', 'paid')
      .gte('pass_end_at', now)
      .lte('pass_start_at', now);

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('email', email);
    }

    const { data: existingPass } = await query.single();

    if (existingPass) {
      return NextResponse.json(
        { error: 'You already have an active Export Pass' },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: EXPORT_PASS_CONFIG.currency,
            product_data: {
              name: EXPORT_PASS_CONFIG.productName,
              description: EXPORT_PASS_CONFIG.description,
            },
            unit_amount: EXPORT_PASS_CONFIG.amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${request.nextUrl.origin}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/builder`,
      metadata: {
        email,
        userId: userId || '',
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    captureStripeError(error, { status: 'checkout_creation_failed' });
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
