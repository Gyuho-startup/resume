// ANTHROPIC_API_KEY must be present in .env.local for this route to work.
// Example: ANTHROPIC_API_KEY=sk-ant-api03-...
// Never commit the actual key.

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { parseCoachResponse, getDisplayText } from '@/lib/coach/parser';
import { mergeAIDataIntoResume } from '@/lib/coach/data-bridge';
import { CAREER_COACH_SYSTEM_PROMPT } from '@/lib/coach/system-prompt';
import type { CoachRequest, CoachResponse, InterviewStage, ParsedBlock } from '@/lib/coach/types';
import { captureCoachError } from '@/lib/sentry';
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

// Initialise the Anthropic client once per cold start (not per request)
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Log API key status on module load (do not log the actual key)
console.log('[/api/coach] Anthropic API key configured:', !!process.env.ANTHROPIC_API_KEY);
if (process.env.ANTHROPIC_API_KEY) {
  console.log('[/api/coach] API key format:', process.env.ANTHROPIC_API_KEY.substring(0, 20) + '...');
}

/**
 * Determines the next interview stage based on which tags appeared in the
 * AI response.
 *
 * Transition rules:
 *  - Any RESUME block → move to 'review'
 *  - STRENGTHS or STAR while in 'deep_dive' → move to 'structuring'
 *  - STRENGTHS or STAR while in 'structuring' → move to 'generation'
 *  - Otherwise keep the current stage
 */
function detectNextStage(
  blocks: ParsedBlock[],
  currentStage: InterviewStage
): InterviewStage {
  const tags = new Set(blocks.map(b => b.tag));

  if (tags.has('RESUME')) return 'review';

  if (tags.has('STRENGTHS') || tags.has('STAR')) {
    if (currentStage === 'deep_dive') return 'structuring';
    if (currentStage === 'structuring') return 'generation';
  }

  return currentStage;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Rate limit: 20 req/min per IP. Anthropic streaming calls are expensive.
  const ip = getClientIp(request);
  const rl = rateLimit(`coach:${ip}`, 20, 60_000);
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
    const body: CoachRequest = await request.json();
    const { messages, stage, resumeData, sessionId } = body;

    // Basic input validation — do not log message content (PII)
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error_code: 'INVALID_INPUT', message: 'messages array is required' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error_code: 'SERVICE_UNAVAILABLE', message: 'AI service not configured' },
        { status: 503 }
      );
    }

    // Validate sessionId to prevent path traversal / SSRF via crafted URL segment
    // Must be a valid UUID (hex + hyphens only)
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (sessionId && !UUID_RE.test(sessionId)) {
      return NextResponse.json(
        { error_code: 'INVALID_INPUT', message: 'Invalid session ID format' },
        { status: 400 }
      );
    }

    // SESSION CHECK: Check if user has paid (after payment gate)
    let hasPaid = false;

    if (sessionId) {
      const sessionCheckUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/coach/session/${sessionId}`;

      try {
        const sessionRes = await fetch(sessionCheckUrl);
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          hasPaid = sessionData.payment_status === 'paid';

          console.log('[/api/coach] Session check:', {
            sessionId,
            paymentStatus: sessionData.payment_status,
            hasPaid,
          });
        }
      } catch (error) {
        console.warn('[/api/coach] Session check failed (continuing anyway):', error);
        // Continue even if session check fails (graceful degradation)
      }
    }

    // Log message count only — do not log message content (PII)
    const userMsgCount = messages.filter(m => m.role === 'user').length;
    console.log('[/api/coach] Processing request:', { userMsgCount, stage });

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullText = '';

          // Call the Anthropic API with streaming
          const messageStream = await client.messages.stream({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 3000,  // 2x increase to allow longer, more detailed responses
            system: CAREER_COACH_SYSTEM_PROMPT,
            messages: messages.map(m => ({
              role: m.role,
              content: m.content,
            })),
          });

          // Stream each text delta to the client
          for await (const event of messageStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const textChunk = event.delta.text;
              fullText += textChunk;

              // Send the chunk to the client
              const data = JSON.stringify({ type: 'text', content: textChunk });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          // Get final message (keep for potential analytics)
          const finalMessage = await messageStream.finalMessage();
          const usage = finalMessage.usage;

          console.log('[/api/coach] Token usage (analytics only):', {
            input: usage.input_tokens,
            output: usage.output_tokens,
          });

          // After streaming completes, parse and send structured data
          console.log('[/api/coach] Full AI response:', fullText.substring(0, 200));
          const blocks = parseCoachResponse(fullText);
          const updatedResumeData = mergeAIDataIntoResume(blocks, resumeData ?? {});
          const nextStage = detectNextStage(blocks, stage as InterviewStage);
          const displayText = getDisplayText(blocks);
          console.log('[/api/coach] Display text:', displayText.substring(0, 200));

          // Check if payment gate should trigger (after 10 conversation turns)
          let hasPaymentGate = false;

          // Count total conversation turns (user + assistant messages)
          // Current messages array + this new assistant response = total turns
          const updatedConversation = messages.concat([
            { role: 'assistant', content: displayText }
          ]);

          // Count assistant responses (each assistant message = 1 turn completed)
          const turnCount = updatedConversation.filter(m => m.role === 'assistant').length;

          if (sessionId) {
            try {
              const sessionCheckUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/coach/session/${sessionId}`;
              const sessionRes = await fetch(sessionCheckUrl);

              if (sessionRes.ok) {
                const sessionData = await sessionRes.json();

                console.log('[/api/coach] Turn count check:', {
                  currentTurn: turnCount,
                  paymentStatus: sessionData.payment_status,
                });

                // Trigger payment gate after 10 turns if user hasn't paid
                if (turnCount >= 10 && sessionData.payment_status === 'free') {
                  hasPaymentGate = true;
                  console.log('[/api/coach] Payment gate triggered after ' + turnCount + ' turns');
                }
              }
            } catch (error) {
              console.warn('[/api/coach] Failed to check turn count:', error);
            }
          }

          // Send final metadata
          const finalData = JSON.stringify({
            type: 'complete',
            blocks,
            updatedResumeData,
            nextStage,
            rawResponse: displayText,
            paymentGate: hasPaymentGate,
          });
          controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));

          // SAVE CONVERSATION: Update session with latest conversation data
          if (sessionId) {
            try {
              const updateUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/coach/session/${sessionId}`;
              await fetch(updateUrl, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  conversation_data: updatedConversation,
                  resume_data: updatedResumeData,
                }),
              });
              console.log('[/api/coach] Conversation saved to session:', sessionId);
            } catch (error) {
              console.error('[/api/coach] Failed to save conversation:', error);
              // Don't fail the request if save fails
            }
          }

          controller.close();
        } catch (error: unknown) {
          // Enhanced error logging
          console.error('[/api/coach] Full error:', error);
          if (error instanceof Error) {
            console.error('[/api/coach] Error name:', error.name);
            console.error('[/api/coach] Error message:', error.message);
            console.error('[/api/coach] Error stack:', error.stack);
          }

          captureCoachError(error, {
            sessionId: sessionId ?? undefined,
            stage: stage ?? undefined,
            turnCount: messages.filter((m: { role: string }) => m.role === 'assistant').length,
          });

          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const userMessage = errorMessage.includes('API key') || errorMessage.includes('authentication')
            ? 'Invalid Anthropic API key. Please check your configuration.'
            : errorMessage.includes('rate limit') || errorMessage.includes('429')
            ? 'Rate limit reached. Please try again in a moment.'
            : errorMessage.includes('overloaded') || errorMessage.includes('529')
            ? 'AI service is temporarily overloaded. Please try again.'
            : 'Failed to get AI response. Please try again.';

          const errorData = JSON.stringify({
            type: 'error',
            message: userMessage,
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: unknown) {
    // Enhanced error logging for debugging (do not log request body - PII risk)
    console.error('[/api/coach] Full error:', error);

    if (error instanceof Error) {
      console.error('[/api/coach] Error name:', error.name);
      console.error('[/api/coach] Error message:', error.message);
      console.error('[/api/coach] Error stack:', error.stack);
    }

    // Check for specific Anthropic API errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const userMessage = errorMessage.includes('API key') || errorMessage.includes('authentication')
      ? 'Invalid Anthropic API key. Please check your configuration.'
      : errorMessage.includes('rate limit') || errorMessage.includes('429')
      ? 'Rate limit reached. Please try again in a moment.'
      : errorMessage.includes('overloaded') || errorMessage.includes('529')
      ? 'AI service is temporarily overloaded. Please try again.'
      : 'Failed to get AI response. Please try again.';

    return NextResponse.json(
      { error_code: 'INTERNAL_ERROR', message: userMessage },
      { status: 500 }
    );
  }
}
