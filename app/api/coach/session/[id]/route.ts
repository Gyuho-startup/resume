// @ts-nocheck - Supabase types need regeneration for conversation_sessions table
// GET /api/coach/session/:id
// Check session status and time remaining

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';

type ConversationSession = Database['public']['Tables']['conversation_sessions']['Row'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const supabase = createServiceClient();

    // Fetch session
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

    // Calculate time remaining
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    const timeRemaining = expiresAt.getTime() - now.getTime();
    const isExpired = timeRemaining <= 0;

    // Check if in grace period (2 minutes after expiration)
    const GRACE_PERIOD_MS = 2 * 60 * 1000; // 2 minutes
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
    console.error('[/api/coach/session/:id] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error_code: 'INTERNAL_ERROR', message },
      { status: 500 }
    );
  }
}

// PATCH /api/coach/session/:id
// Update session (conversation data, resume data, payment status, token usage)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createServiceClient();

    // Fetch current session to get existing token usage
    // @ts-ignore - Table exists but Supabase types need regeneration
    const { data: currentSession, error: fetchError } = await supabase
      .from('conversation_sessions')
      .select('token_usage')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('[/api/coach/session/:id] Failed to fetch current session:', fetchError);
      return NextResponse.json(
        { error_code: 'SESSION_NOT_FOUND', message: 'Session not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (body.conversation_data !== undefined) {
      updateData.conversation_data = body.conversation_data;
    }

    if (body.resume_data !== undefined) {
      updateData.resume_data = body.resume_data;
    }

    if (body.payment_status !== undefined) {
      updateData.payment_status = body.payment_status;
    }

    // Handle token usage: accumulate with existing usage
    if (body.token_usage !== undefined) {
      const existingUsage = currentSession.token_usage || { input: 0, output: 0, cost_usd: 0 };
      const newUsage = body.token_usage;

      updateData.token_usage = {
        input: existingUsage.input + newUsage.input,
        output: existingUsage.output + newUsage.output,
        cost_usd: existingUsage.cost_usd + newUsage.cost_usd,
      };

      console.log('[/api/coach/session/:id] Token usage update:', {
        existing: existingUsage,
        new: newUsage,
        cumulative: updateData.token_usage,
      });
    }

    // Update session
    // @ts-ignore - Table exists but Supabase types need regeneration
    const { error: updateError } = await supabase
      .from('conversation_sessions')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('[/api/coach/session/:id] Update error:', updateError);
      return NextResponse.json(
        { error_code: 'UPDATE_FAILED', message: 'Failed to update session' },
        { status: 500 }
      );
    }

    console.log('[/api/coach/session/:id] Session updated successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Session updated successfully',
    });
  } catch (error: unknown) {
    console.error('[/api/coach/session/:id] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error_code: 'INTERNAL_ERROR', message },
      { status: 500 }
    );
  }
}
