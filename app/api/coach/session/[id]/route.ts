// @ts-nocheck - Supabase types need regeneration for conversation_sessions table
// GET /api/coach/session/:id  — internal use only (called by /api/coach)
// PATCH /api/coach/session/:id — internal use only (called by /api/coach)
//
// Both endpoints require the INTERNAL_API_SECRET bearer token.
// payment_status is intentionally NOT patchable here — it is set exclusively
// by the Stripe webhook (/api/stripe/webhook) to prevent payment bypass.

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';

type ConversationSession = Database['public']['Tables']['conversation_sessions']['Row'];

/**
 * Verify the shared internal API secret.
 * Returns true only if the Authorization header matches INTERNAL_API_SECRET.
 * The secret is required unconditionally — absence always returns false.
 * Set INTERNAL_API_SECRET in .env.local for local development.
 */
function verifyInternalSecret(request: NextRequest): boolean {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) return false; // secret must always be configured
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${secret}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  if (!verifyInternalSecret(request)) {
    return NextResponse.json(
      { error_code: 'UNAUTHORIZED', message: 'Internal access only' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const supabase = createServiceClient();

    // @ts-ignore - Table exists but Supabase types need regeneration
    const { data: session, error } = await supabase
      .from('conversation_sessions')
      .select('*')
      .eq('id', id)
      .single<ConversationSession>();

    if (error || !session) {
      return NextResponse.json(
        { error_code: 'SESSION_NOT_FOUND', message: 'Session not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    const timeRemaining = expiresAt.getTime() - now.getTime();
    const isExpired = timeRemaining <= 0;

    const GRACE_PERIOD_MS = 2 * 60 * 1000;
    const gracePeriodEnd = new Date(expiresAt.getTime() + GRACE_PERIOD_MS);
    const inGracePeriod = isExpired && now < gracePeriodEnd;

    return NextResponse.json({
      session_id: session.id,
      started_at: session.started_at,
      expires_at: session.expires_at,
      payment_status: session.payment_status,
      time_remaining_ms: Math.max(0, timeRemaining),
      is_expired: isExpired,
      in_grace_period: inGracePeriod,
      can_continue: session.payment_status === 'paid' || !isExpired || inGracePeriod,
      conversation_turns: Array.isArray(session.conversation_data)
        ? session.conversation_data.length
        : 0,
      token_usage: session.token_usage || { input: 0, output: 0, cost_usd: 0 },
    });
  } catch (error: unknown) {
    console.error('[/api/coach/session/:id] GET Error:', error);
    return NextResponse.json(
      { error_code: 'INTERNAL_ERROR', message: 'An internal error occurred' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  if (!verifyInternalSecret(request)) {
    return NextResponse.json(
      { error_code: 'UNAUTHORIZED', message: 'Internal access only' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createServiceClient();

    // @ts-ignore - Table exists but Supabase types need regeneration
    const { data: currentSession, error: fetchError } = await supabase
      .from('conversation_sessions')
      .select('token_usage')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error_code: 'SESSION_NOT_FOUND', message: 'Session not found' },
        { status: 404 }
      );
    }

    // Only allow updating conversation data fields.
    // payment_status is intentionally excluded — it is set exclusively by
    // the Stripe webhook to prevent payment bypass attacks.
    const updateData: Record<string, unknown> = {};

    if (body.conversation_data !== undefined) {
      updateData.conversation_data = body.conversation_data;
    }

    if (body.resume_data !== undefined) {
      updateData.resume_data = body.resume_data;
    }

    if (body.token_usage !== undefined) {
      const existingUsage = currentSession.token_usage || { input: 0, output: 0, cost_usd: 0 };
      const newUsage = body.token_usage;
      updateData.token_usage = {
        input: existingUsage.input + newUsage.input,
        output: existingUsage.output + newUsage.output,
        cost_usd: existingUsage.cost_usd + newUsage.cost_usd,
      };
    }

    // @ts-ignore - Table exists but Supabase types need regeneration
    const { error: updateError } = await supabase
      .from('conversation_sessions')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      return NextResponse.json(
        { error_code: 'UPDATE_FAILED', message: 'Failed to update session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[/api/coach/session/:id] PATCH Error:', error);
    return NextResponse.json(
      { error_code: 'INTERNAL_ERROR', message: 'An internal error occurred' },
      { status: 500 }
    );
  }
}
