export const runtime = 'nodejs';
export const maxDuration = 30;

import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/voice/openai-client';
import { TTS_CONFIG, MAX_TTS_CHARS } from '@/lib/voice/whisper-config';

export async function POST(request: NextRequest): Promise<NextResponse> {
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

  // Log the text being sent to TTS for debugging
  console.log('[TTS] Generating speech for text:', text.substring(0, 200));
  console.log('[TTS] Full text length:', text.length, 'chars');

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
