import { NextRequest, NextResponse } from 'next/server';
import { hasActivePass, getActivePass } from '@/lib/stripe/pass-utils';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// Check if user has an active Export Pass
// Works for both guest (email) and logged-in users (userId)

export async function POST(request: NextRequest) {
  // Rate limit: 10 req/min per IP to prevent email enumeration
  const ip = getClientIp(request);
  const rl = await rateLimit(`check-pass:${ip}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error_code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  try {
    const { email, userId } = await request.json();

    if (!email && !userId) {
      return NextResponse.json(
        { error: 'Email or userId required' },
        { status: 400 }
      );
    }

    // For userId-based lookups: verify the caller owns that userId.
    // This prevents one user from checking another user's pass status.
    if (userId) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== userId) {
        return NextResponse.json(
          { error_code: 'UNAUTHORIZED', message: 'Cannot check pass for another user' },
          { status: 401 }
        );
      }
    }

    // Check for active pass
    const identifier = userId ? { userId } : { email };
    const active = await hasActivePass(identifier);

    if (!active) {
      return NextResponse.json({
        hasPass: false,
        expiresAt: null,
      });
    }

    // Get pass details
    const pass = await getActivePass(identifier);

    return NextResponse.json({
      hasPass: true,
      expiresAt: pass?.passEndAt || null,
    });
  } catch (error) {
    console.error('Check pass error:', error);
    return NextResponse.json(
      { error: 'Failed to check pass status' },
      { status: 500 }
    );
  }
}
