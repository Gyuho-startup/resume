export const runtime = 'nodejs';
export const maxDuration = 30;

import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/voice/openai-client';
import { WHISPER_CONFIG } from '@/lib/voice/whisper-config';
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';

// Session-based failure tracking (in-memory, resets on server restart)
// In production, use Redis with TTL
const sessionFailures = new Map<string, { count: number; lastFailure: number }>();
const MAX_CONSECUTIVE_FAILURES = 5;
const SESSION_FAILURE_TTL = 3600000; // 1 hour in ms

// Cleanup old sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, data] of sessionFailures.entries()) {
    if (now - data.lastFailure > SESSION_FAILURE_TTL) {
      sessionFailures.delete(sessionId);
    }
  }
}, 300000); // Cleanup every 5 minutes

// Helper function to record a failure
function recordFailure(sessionId: string): number {
  const sessionData = sessionFailures.get(sessionId) || { count: 0, lastFailure: 0 };
  sessionData.count += 1;
  sessionData.lastFailure = Date.now();
  sessionFailures.set(sessionId, sessionData);
  console.log(`[/api/voice/transcribe] 📊 Session ${sessionId} failure count: ${sessionData.count}/${MAX_CONSECUTIVE_FAILURES}`);
  return sessionData.count;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Auth guard: voice pipeline calls OpenAI Whisper (billed per audio second).
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
  const rl = rateLimit(`transcribe:${user.id}:${ip}`, 30, 60_000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error_code: 'SERVICE_UNAVAILABLE', message: 'STT service not configured' },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error_code: 'INVALID_FORMAT', message: 'Expected multipart/form-data' },
      { status: 400 }
    );
  }

  const audioFile = formData.get('audio');
  if (!audioFile || !(audioFile instanceof File)) {
    return NextResponse.json(
      { error_code: 'INVALID_INPUT', message: 'audio field is required' },
      { status: 400 }
    );
  }

  // Get or generate session ID for failure tracking
  const sessionId = (formData.get('session_id') as string) || 'default';
  const sessionData = sessionFailures.get(sessionId) || { count: 0, lastFailure: 0 };

  // Check if session has exceeded failure limit
  if (sessionData.count >= MAX_CONSECUTIVE_FAILURES) {
    console.error('[/api/voice/transcribe] 🚫 Session hit consecutive failure limit:', sessionId);
    return NextResponse.json(
      {
        error_code: 'CONSECUTIVE_FAILURES',
        message: 'Too many consecutive failures. Please try again later or restart the conversation.',
        failure_count: sessionData.count,
        suggested_action: 'circuit_break'
      },
      { status: 429 }
    );
  }

  // Log audio file metadata for debugging
  console.log('[/api/voice/transcribe] 📥 Received audio file:', {
    name: audioFile.name,
    type: audioFile.type,
    size: audioFile.size,
    sizeKB: (audioFile.size / 1024).toFixed(2),
  });

  // Additional validation: check if file has actual content
  const arrayBuffer = await audioFile.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  console.log('[/api/voice/transcribe] 🔍 First 16 bytes (hex):',
    Array.from(bytes.slice(0, 16))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ')
  );

  // Validate WebM header (EBML signature: 0x1A45DFA3)
  if (audioFile.type.includes('webm')) {
    const isValidWebM = bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
    if (!isValidWebM) {
      const failureCount = recordFailure(sessionId);
      console.error('[/api/voice/transcribe] ❌ Invalid WebM header detected');
      console.error('[/api/voice/transcribe] Expected: 1a 45 df a3, Got:',
        Array.from(bytes.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' ')
      );
      return NextResponse.json(
        {
          error_code: 'INVALID_WEBM',
          message: 'Recording was incomplete. Please try speaking again.',
          failure_count: failureCount,
          suggested_action: failureCount >= 3 ? 'circuit_break' : 'retry'
        },
        { status: 400 }
      );
    }
    console.log('[/api/voice/transcribe] ✅ Valid WebM header confirmed');
  }

  // Check if audio has sufficient volume (not silence)
  // Sample 1000 bytes from the middle of the file to check for actual audio content
  const sampleStart = Math.floor(bytes.length / 2);
  const sampleEnd = Math.min(sampleStart + 1000, bytes.length);
  const sample = bytes.slice(sampleStart, sampleEnd);
  const avgAmplitude = sample.reduce((sum, byte) => sum + Math.abs(byte - 128), 0) / sample.length;

  console.log('[/api/voice/transcribe] 🔊 Audio amplitude check:', avgAmplitude.toFixed(2));

  // ENHANCED: More aggressive threshold (was < 2, now < 5)
  // This prevents hallucinations from silence/background noise
  if (avgAmplitude < 5) {
    const failureCount = recordFailure(sessionId);
    console.warn('[/api/voice/transcribe] ⚠️ Audio appears to be silence or very quiet');
    return NextResponse.json(
      {
        error_code: 'TOO_QUIET_ENHANCED',
        message: "I didn't catch that. Please speak louder and try again.",
        failure_count: failureCount,
        suggested_action: failureCount >= 3 ? 'circuit_break' : 'retry'
      },
      { status: 400 }
    );
  }

  // Recreate the File from arrayBuffer to ensure it's properly formed
  const reconstructedFile = new File([arrayBuffer], audioFile.name, { type: audioFile.type });

  const MAX_BYTES = 25 * 1024 * 1024;
  if (audioFile.size > MAX_BYTES) {
    return NextResponse.json(
      { error_code: 'AUDIO_TOO_LARGE', message: 'Audio file exceeds 25MB limit' },
      { status: 400 }
    );
  }

  // Minimum size check (recordings < 1KB are likely empty)
  if (audioFile.size < 1000) {
    console.error('[/api/voice/transcribe] Audio file too small:', audioFile.size, 'bytes');
    return NextResponse.json(
      { error_code: 'AUDIO_TOO_SHORT', message: 'Recording was too short. Please hold and speak clearly.' },
      { status: 400 }
    );
  }

  try {
    const openai = getOpenAIClient();
    console.log('[/api/voice/transcribe] 🚀 Calling Whisper API...');
    console.log('[/api/voice/transcribe] 📝 Config:', {
      model: WHISPER_CONFIG.model,
      language: WHISPER_CONFIG.language,
      fileName: reconstructedFile.name,
      fileType: reconstructedFile.type,
    });

    const transcription = await openai.audio.transcriptions.create({
      file: reconstructedFile,
      model: WHISPER_CONFIG.model,
      language: WHISPER_CONFIG.language,
      temperature: WHISPER_CONFIG.temperature,
      prompt: WHISPER_CONFIG.prompt,
    });

    // Log character count only — do not log transcribed text (PII)
    console.log('[/api/voice/transcribe] Success. Transcription length:', transcription.text.length, 'chars');

    // ENHANCED: Comprehensive hallucination pattern library
    // Common Whisper hallucinations when processing silence/noise
    const hallucinationPatterns = [
      // YouTube/Video content markers
      /thank you for watching/i,
      /thanks for watching/i,
      /subscribe.*channel/i,
      /like.*comment.*subscribe/i,
      /don't forget to subscribe/i,
      /hit.*bell.*notification/i,

      // Media/Audio markers
      /\[music\]/i,
      /\[applause\]/i,
      /\[laughter\]/i,
      /\[silence\]/i,
      /\[inaudible\]/i,
      /\(music\)/i,

      // Transcription service markers
      /transcript.*provided.*by/i,
      /subtitles.*by/i,
      /captions.*by/i,

      // System/Application markers
      /microsoft.*word.*document/i,
      /msworddoc/i,
      /word\.document/i,
      /powerpoint.*presentation/i,
      /adobe.*acrobat/i,

      // Generic pleasantries (common hallucinations)
      /^thank you\.?$/i,
      /^nice work\.?$/i,
      /^good job\.?$/i,
      /thank you.*nice work.*everybody/i,
      /^bye\.?$/i,
      /^goodbye\.?$/i,

      // Repeated filler words only
      /^(um+|uh+|ah+|er+)\.?$/i,
    ];

    const isHallucination = hallucinationPatterns.some(pattern => pattern.test(transcription.text));

    if (isHallucination) {
      const failureCount = recordFailure(sessionId);
      console.warn('[/api/voice/transcribe] ⚠️ Detected hallucination pattern:', transcription.text);
      return NextResponse.json(
        {
          error_code: 'HALLUCINATION_DETECTED',
          message: "I didn't catch that clearly. Please try speaking again.",
          failure_count: failureCount,
          suggested_action: failureCount >= 3 ? 'circuit_break' : 'retry'
        },
        { status: 400 }
      );
    }

    // ENHANCED: Text quality validation
    const text = transcription.text.trim();

    // Reject if too short (likely noise)
    if (text.length < 5) {
      const failureCount = recordFailure(sessionId);
      console.warn('[/api/voice/transcribe] ⚠️ Text too short:', text);
      return NextResponse.json(
        {
          error_code: 'TEXT_TOO_SHORT',
          message: "I didn't catch that. Please speak a bit more.",
          failure_count: failureCount,
          suggested_action: failureCount >= 3 ? 'circuit_break' : 'retry'
        },
        { status: 400 }
      );
    }

    // Reject if only punctuation/whitespace
    const hasLetters = /[a-zA-Z]/.test(text);
    if (!hasLetters) {
      const failureCount = recordFailure(sessionId);
      console.warn('[/api/voice/transcribe] ⚠️ No letters detected:', text);
      return NextResponse.json(
        {
          error_code: 'NO_SPEECH_DETECTED',
          message: "I didn't hear any words. Please try again.",
          failure_count: failureCount,
          suggested_action: failureCount >= 3 ? 'circuit_break' : 'retry'
        },
        { status: 400 }
      );
    }

    // Success! Reset failure counter for this session
    sessionFailures.delete(sessionId);
    console.log('[/api/voice/transcribe] ✅ Success, session failure counter reset');

    return NextResponse.json({
      text: transcription.text,
      failure_count: 0,
      suggested_action: 'continue'
    });
  } catch (error: unknown) {
    // Enhanced error logging
    console.error('[/api/voice/transcribe] Full error:', error);
    if (error instanceof Error) {
      console.error('[/api/voice/transcribe] Error name:', error.name);
      console.error('[/api/voice/transcribe] Error message:', error.message);
      console.error('[/api/voice/transcribe] Error stack:', error.stack);
    }

    // Check for specific OpenAI API errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const userMessage = errorMessage.includes('API key')
      ? 'Invalid OpenAI API key. Please check your configuration.'
      : errorMessage.includes('rate limit')
      ? 'Rate limit reached. Please try again in a moment.'
      : 'Failed to transcribe audio. Please try again.';

    return NextResponse.json(
      { error_code: 'TRANSCRIPTION_FAILED', message: userMessage },
      { status: 500 }
    );
  }
}
