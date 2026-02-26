export const runtime = 'nodejs';
export const maxDuration = 30;

import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/voice/openai-client';
import { TTS_CONFIG, MAX_TTS_CHARS } from '@/lib/voice/whisper-config';
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Auth guard: TTS calls OpenAI (billed per character).
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { error_code: 'UNAUTHORIZED', message: 'Authentication required' },
      { status: 401 }
    );
  }

  // Rate limit: 30 req/min per user. Keyed by user ID to prevent IP-rotation bypass.
  const ip = getClientIp(request);
  const rl = rateLimit(`synthesise:${user.id}:${ip}`, 30, 60_000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error_code: 'SERVICE_UNAVAILABLE', message: 'TTS service not configured' },
      { status: 503 }
    );
  }

  let body: { text?: string; voice?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error_code: 'INVALID_FORMAT', message: 'Expected application/json' },
      { status: 400 }
    );
  }

  const { text, voice } = body;
  if (!text || typeof text !== 'string') {
    return NextResponse.json(
      { error_code: 'INVALID_INPUT', message: 'text field is required' },
      { status: 400 }
    );
  }

  if (text.length > MAX_TTS_CHARS) {
    return NextResponse.json(
      { error_code: 'TEXT_TOO_LONG', message: `Text exceeds ${MAX_TTS_CHARS} character limit` },
      { status: 400 }
    );
  }

  const resolvedVoice = (voice ?? TTS_CONFIG.voice) as typeof TTS_CONFIG.voice;

  // Log text length only — do not log text content (may contain PII)
  console.log('[TTS] Generating speech. Text length:', text.length, 'chars');

  try {
    const openai = getOpenAIClient();
    const response = await openai.audio.speech.create({
      model: TTS_CONFIG.model,
      voice: resolvedVoice,
      input: text,
      response_format: 'mp3',
    });

    const audioStream = response.body;
    return new NextResponse(audioStream as unknown as ReadableStream, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[/api/voice/synthesise] error:', message);
    return NextResponse.json(
      { error_code: 'SYNTHESIS_FAILED', message: 'Failed to synthesise audio. Please try again.' },
      { status: 500 }
    );
  }
}
