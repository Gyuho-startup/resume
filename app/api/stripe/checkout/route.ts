import { NextRequest, NextResponse } from 'next/server';
import { stripe, EXPORT_PASS_CONFIG } from '@/lib/stripe/config';
import { createRouteClient } from '@/lib/supabase/route-client';

// Create Stripe Checkout Session for Export Pass purchase

export async function POST(request: NextRequest) {
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
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
