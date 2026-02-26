// @ts-nocheck - Supabase types need regeneration for conversation_sessions table
// POST /api/coach/session/init
// Creates a new conversation session with 10-minute timer

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Rate limit: 5 session inits per IP per hour.
  // Each init inserts a row into conversation_sessions; unbounded creates would
  // flood the table and incur storage costs.
  const ip = getClientIp(request);
  const rl = rateLimit(`session-init:${ip}`, 5, 60 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error_code: 'RATE_LIMITED', message: 'Too many session requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  try {
    // Use regular client to check auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Use service client for DB operations (bypasses RLS for guest users)
    const serviceSupabase = createServiceClient();

    // Generate guest identifier for non-logged-in users
    const guestIdentifier = user ? null : `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Calculate expiration time (10 minutes from now)
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + 10 * 60 * 1000); // 10 minutes

    // Get user agent and IP for tracking
    const userAgent = request.headers.get('user-agent') || undefined;
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : undefined;

    // Create session record
    // @ts-ignore - Table exists but Supabase types need regeneration
    const { data: session, error } = await serviceSupabase
      .from('conversation_sessions')
      .insert({
        user_id: user?.id || null,
        guest_identifier: guestIdentifier,
        started_at: startedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        payment_status: 'free',
        conversation_data: [],
        resume_data: null,
        user_agent: userAgent,
        ip_address: ipAddress,
      })
      .select()
      .single();

    if (error) {
      console.error('[/api/coach/session/init] Database error:', error);
      return NextResponse.json(
        { error_code: 'DB_ERROR', message: 'Failed to create session' },
        { status: 500 }
      );
    }

    console.log('[/api/coach/session/init] Session created:', session.id);

    return NextResponse.json({
      session_id: session.id,
      started_at: session.started_at,
      expires_at: session.expires_at,
      time_remaining_ms: expiresAt.getTime() - startedAt.getTime(),
      payment_status: session.payment_status,
    });
  } catch (error: unknown) {
    console.error('[/api/coach/session/init] Error:', error);
    return NextResponse.json(
      { error_code: 'INTERNAL_ERROR', message: 'An internal error occurred' },
      { status: 500 }
    );
  }
}
