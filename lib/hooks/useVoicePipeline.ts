'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { VoiceRecordingState } from '@/lib/voice/types';
import { MAX_RECORDING_MS } from '@/lib/voice/whisper-config';

interface UseVoicePipelineOptions {
  onTranscript: (text: string) => void;
  onStateChange?: (state: VoiceRecordingState) => void;
  onError?: (message: string) => void;
  onRetryQuestion?: () => string | null; // Returns the last AI question to repeat
  onTTSStart?: () => void; // Called when TTS audio starts playing
}

interface UseVoicePipelineReturn {
  state: VoiceRecordingState;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  playTTS: (text: string) => Promise<void>;
  error: string | null;
  isSupported: boolean;
  startConversation: () => Promise<void>;
  stopConversation: () => void;
  pauseConversation: () => void;
  resumeConversation: () => void;
  isInConversation: boolean;
  isPaused: boolean;
  notifyAiResponseReady: () => void;
}

// Generate a unique session ID for failure tracking
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function useVoicePipeline(options: UseVoicePipelineOptions): UseVoicePipelineReturn {
  const [state, setState] = useState<VoiceRecordingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isInConversation, setIsInConversation] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const shouldContinueRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  // Circuit breaker state
  const sessionIdRef = useRef<string>(generateSessionId());
  const consecutiveFailuresRef = useRef<number>(0);
  const backoffDelayRef = useRef<number>(1200); // Base delay: 1200ms
  const circuitBrokenRef = useRef<boolean>(false);
  const MAX_FAILURES_BEFORE_BREAK = 3;

  // Refs to store functions for retry logic (avoid circular dependencies)
  const playTTSRef = useRef<((text: string) => Promise<void>) | null>(null);
  const startRecordingRef = useRef<(() => Promise<void>) | null>(null);

  // Retry counter for empty transcriptions (max 2 retries per question)
  const retryCountRef = useRef<number>(0);
  const MAX_RETRIES = 2;

  // Check support only on client after mount (prevents hydration mismatch)
  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      typeof window.MediaRecorder !== 'undefined' &&
      typeof navigator.mediaDevices?.getUserMedia === 'function';
    setIsSupported(supported);
  }, []);

  const updateState = useCallback(
    (newState: VoiceRecordingState) => {
      setState(newState);
      options.onStateChange?.(newState);
    },
    [options]
  );

  const handleError = useCallback(
    (message: string) => {
      setError(message);
      updateState('error');
      options.onError?.(message);
      // Auto-reset to idle after 3s so user can retry
      setTimeout(() => {
        setState('idle');
        setError(null);

        // CRITICAL: In continuous conversation mode, automatically restart listening after error
        if (shouldContinueRef.current && isInConversation) {
          console.log('[Voice Pipeline] 🔄 Error cleared, auto-restarting listening in continuous mode');
          setTimeout(() => startRecordingRef.current?.(), 500);
        }
      }, 3000);
    },
    [updateState, options, isInConversation]
  );

  const transcribeAudio = useCallback(
    async (audioBlob: Blob) => {
      updateState('processing_stt');
      try {
        const formData = new FormData();

        // Determine the correct file extension based on the blob's MIME type
        let filename = 'recording.webm';
        let fileType = audioBlob.type;

        console.log('[Voice Pipeline] 🔍 Original blob type:', fileType);
        console.log('[Voice Pipeline] 🔍 Original blob size:', audioBlob.size);

        // Map MIME type to filename extension
        if (fileType.includes('ogg')) {
          filename = 'recording.ogg';
        } else if (fileType.includes('wav')) {
          filename = 'recording.wav';
        } else if (fileType.includes('mp4')) {
          filename = 'recording.mp4';
        } else if (fileType.includes('mpeg') || fileType.includes('mp3')) {
          filename = 'recording.mp3';
        } else if (fileType.includes('webm')) {
          filename = 'recording.webm';
        } else {
          // Fallback: if type is empty or unknown, default to webm
          console.warn('[Voice Pipeline] ⚠️ Unknown MIME type, defaulting to webm');
          filename = 'recording.webm';
          fileType = 'audio/webm';
        }

        console.log('[Voice Pipeline] ✅ Final filename:', filename, 'type:', fileType, 'size:', audioBlob.size);

        // Strip codecs from MIME type (e.g., "audio/webm;codecs=opus" -> "audio/webm")
        // OpenAI expects clean MIME types without codec specifications
        const cleanMimeType = fileType.split(';')[0];
        console.log('[Voice Pipeline] 🧹 Clean MIME type:', cleanMimeType);

        const file = new File([audioBlob], filename, { type: cleanMimeType });
        formData.append('audio', file);
        formData.append('session_id', sessionIdRef.current);

        const res = await fetch('/api/voice/transcribe', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: 'Transcription failed' }));

          // Update failure tracking
          const failureCount = err.failure_count || 1;
          const suggestedAction = err.suggested_action || 'retry';
          consecutiveFailuresRef.current = failureCount;

          console.log('[Voice Pipeline] 📊 Failure count:', failureCount, 'Action:', suggestedAction);

          // Circuit breaker check
          if (suggestedAction === 'circuit_break' || failureCount >= MAX_FAILURES_BEFORE_BREAK) {
            circuitBrokenRef.current = true;
            shouldContinueRef.current = false;
            setIsInConversation(false);
            console.error('[Voice Pipeline] 🚫 Circuit breaker triggered!');
            handleError(`Too many consecutive failures (${failureCount}). Conversation paused. Please click "Start Conversation" to try again.`);
            return;
          }

          // Apply exponential backoff
          backoffDelayRef.current = Math.min(1200 * Math.pow(2, failureCount - 1), 10000);
          console.log('[Voice Pipeline] ⏱️ Applying backoff delay:', backoffDelayRef.current, 'ms');

          throw new Error(err.message || 'Transcription failed');
        }

        const data = await res.json();
        const text: string = data.text?.trim() ?? '';

        if (!text) {
          console.log('[Voice Pipeline] ⚠️ Empty transcription detected', {
            shouldContinue: shouldContinueRef.current,
            isInConversation,
            retryCount: retryCountRef.current,
            maxRetries: MAX_RETRIES,
          });

          // In continuous conversation mode, retry up to MAX_RETRIES times
          if (shouldContinueRef.current && isInConversation) {
            if (retryCountRef.current >= MAX_RETRIES) {
              // Max retries exceeded - give up and wait for user to manually continue
              console.log('[Voice Pipeline] ❌ Max retries exceeded, stopping retry loop');
              retryCountRef.current = 0; // Reset for next question
              handleError("I didn't hear a response. Please click the microphone to try again.");
              return;
            }

            // Increment retry counter
            retryCountRef.current += 1;
            console.log(`[Voice Pipeline] 🔄 Retry attempt ${retryCountRef.current}/${MAX_RETRIES}`);

            const lastQuestion = options.onRetryQuestion?.();
            console.log('[Voice Pipeline] Last question retrieved:', lastQuestion?.substring(0, 50) || 'NULL');

            if (lastQuestion && playTTSRef.current) {
              // Replay the question with TTS, which will auto-restart listening
              console.log('[Voice Pipeline] ✅ Replaying question via TTS');
              updateState('idle');
              setTimeout(() => {
                console.log('[Voice Pipeline] 🎙️ Executing TTS replay now');
                playTTSRef.current?.(lastQuestion);
              }, 500);
              return;
            } else {
              // If we can't replay, just restart listening without TTS
              console.warn('[Voice Pipeline] ⚠️ Cannot replay question - restarting listening without TTS');
              updateState('idle');
              setTimeout(() => {
                console.log('[Voice Pipeline] 🎙️ Restarting listening without TTS');
                startRecordingRef.current?.();
              }, 1000);
              return;
            }
          }
          // Outside continuous mode, show error
          console.log('[Voice Pipeline] Showing error to user (not in continuous mode)');
          handleError("I didn't catch that. Please try speaking again.");
          return;
        }

        // Success! Reset failure tracking and retry counter
        consecutiveFailuresRef.current = 0;
        backoffDelayRef.current = 1200;
        retryCountRef.current = 0; // Reset retry counter on successful transcription
        console.log('[Voice Pipeline] ✅ Success, counters reset');

        updateState('processing_ai');
        options.onTranscript(text);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Transcription failed';
        handleError(message);
      }
    },
    [updateState, handleError, options, isInConversation]
  );

  // Voice Activity Detection
  const startVAD = useCallback((stream: MediaStream, recordingStartTime: number) => {
    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const SILENCE_THRESHOLD = 10; // Slightly higher to be more sensitive to actual speech
      const SILENCE_DURATION = 1500; // 1.5 seconds of silence → much more responsive!
      const MIN_RECORDING_DURATION = 800; // Minimum 800ms before VAD can stop (allows quick answers)
      let silenceStart = 0;

      const checkAudioLevel = () => {
        if (!analyserRef.current || !shouldContinueRef.current) {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
          return;
        }

        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

        // Check if minimum recording time has elapsed
        const recordingDuration = Date.now() - recordingStartTime;

        if (average < SILENCE_THRESHOLD) {
          if (silenceStart === 0) {
            silenceStart = Date.now();
          } else if (
            Date.now() - silenceStart > SILENCE_DURATION &&
            recordingDuration >= MIN_RECORDING_DURATION
          ) {
            // Auto-stop due to silence (only if minimum duration met)
            console.log('[Voice Pipeline] 🛑 VAD auto-stop after', recordingDuration, 'ms');
            if (mediaRecorderRef.current?.state === 'recording') {
              mediaRecorderRef.current.stop();
            }
            return;
          }
        } else {
          silenceStart = 0;
        }

        animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
      };

      if (shouldContinueRef.current) {
        checkAudioLevel();
      }
    } catch (error) {
      console.error('VAD error:', error);
    }
  }, []);

  const startRecording = useCallback(async () => {
    console.log('[Voice Pipeline] startRecording called, isInConversation:', shouldContinueRef.current);

    // SAFETY: Never start recording while AI is speaking
    if (state === 'playing_tts') {
      console.log('[Voice Pipeline] ⚠️ Blocked: Cannot start recording while AI is speaking');
      return;
    }

    // Check if conversation is paused
    if (isPaused) {
      console.log('[Voice Pipeline] ⏸️ Blocked: Conversation is paused');
      return;
    }

    // Circuit breaker check
    if (circuitBrokenRef.current) {
      console.warn('[Voice Pipeline] 🚫 Circuit breaker is active, recording blocked');
      return;
    }

    if (!isSupported) {
      handleError('Voice recording is not supported in this browser.');
      return;
    }

    setError(null);
    updateState('requesting_permission');

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch {
      handleError('Microphone access was denied. Please allow microphone access and try again.');
      return;
    }

    // Try to use the best supported format for Whisper API
    // Priority: webm > ogg > wav > mp4
    let mimeType = '';
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      mimeType = 'audio/webm;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/webm')) {
      mimeType = 'audio/webm';
    } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
      mimeType = 'audio/ogg;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
      mimeType = 'audio/ogg';
    } else if (MediaRecorder.isTypeSupported('audio/wav')) {
      mimeType = 'audio/wav';
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      mimeType = 'audio/mp4';
    }

    console.log('[Voice Pipeline] Using MIME type:', mimeType || 'browser default');

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());

      // Only close AudioContext if NOT in continuous mode
      // In continuous mode, we reuse it to avoid re-initialization overhead
      if (audioContextRef.current && !shouldContinueRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
        autoStopTimerRef.current = null;
      }

      const blob = new Blob(chunksRef.current, {
        type: recorder.mimeType || 'audio/webm',
      });
      chunksRef.current = [];

      if (blob.size < 1000) {
        // Too short
        if (shouldContinueRef.current) {
          // In continuous mode, just restart
          console.log('[Voice Pipeline] ⚠️ Recording too short, restarting...');
          updateState('idle');
          setTimeout(() => startRecording(), backoffDelayRef.current); // Longer delay to let MediaRecorder finalize
        } else {
          handleError('Recording was too short. Please hold and speak clearly.');
        }
        return;
      }

      transcribeAudio(blob);
    };

    const recordingStartTime = Date.now();
    // Start without timeslice - let MediaRecorder collect all data when stop() is called
    // This ensures we get a complete WebM file with proper EBML header
    recorder.start();
    updateState('recording');
    console.log('[Voice Pipeline] 🎙️ Recording started at', new Date(recordingStartTime).toISOString());

    // Start VAD in continuous mode
    if (shouldContinueRef.current) {
      startVAD(stream, recordingStartTime);
    }

    // Safety timeout
    autoStopTimerRef.current = setTimeout(() => {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    }, MAX_RECORDING_MS);
  }, [state, isSupported, isPaused, updateState, handleError, transcribeAudio, startVAD]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const playTTS = useCallback(
    async (text: string) => {
      updateState('playing_tts');
      try {
        const res = await fetch('/api/voice/synthesise', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });

        if (!res.ok) {
          updateState('idle');
          if (shouldContinueRef.current) {
            setTimeout(() => startRecording(), backoffDelayRef.current);
          }
          return;
        }

        const audioBlob = await res.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        const handleEnd = () => {
          URL.revokeObjectURL(audioUrl);
          updateState('idle');

          if (shouldContinueRef.current) {
            console.log('[Voice Pipeline] TTS ended, restarting recording...');
            setTimeout(() => startRecording(), backoffDelayRef.current);
          }
        };

        audio.onended = handleEnd;
        audio.onerror = (e) => {
          console.error('[Voice Pipeline] Audio playback error:', e);
          handleEnd();
        };

        // Attempt to play with proper error handling
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('[Voice Pipeline] TTS playing successfully');
              // Notify that TTS has started (for UI updates)
              options.onTTSStart?.();
            })
            .catch((error) => {
              console.error('[Voice Pipeline] Autoplay blocked:', error);
              // If autoplay is blocked, clean up and continue
              handleEnd();
            });
        }
      } catch (error) {
        console.error('[Voice Pipeline] TTS error:', error);
        updateState('idle');
        if (shouldContinueRef.current) {
          setTimeout(() => startRecording(), backoffDelayRef.current);
        }
      }
    },
    [updateState, startRecording]
  );

  // Keep the refs updated for retry logic
  useEffect(() => {
    playTTSRef.current = playTTS;
  }, [playTTS]);

  useEffect(() => {
    startRecordingRef.current = startRecording;
  }, [startRecording]);

  const startConversation = useCallback(async () => {
    // Reset circuit breaker and failure tracking when user manually starts
    circuitBrokenRef.current = false;
    consecutiveFailuresRef.current = 0;
    backoffDelayRef.current = 1200;
    sessionIdRef.current = generateSessionId(); // New session
    console.log('[Voice Pipeline] 🔄 New conversation started, circuit breaker reset');

    shouldContinueRef.current = true;
    setIsInConversation(true);
    await startRecording();
  }, [startRecording]);

  const stopConversation = useCallback(() => {
    shouldContinueRef.current = false;
    setIsInConversation(false);
    stopRecording();

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [stopRecording]);

  // Pause conversation temporarily (user needs time to think)
  const pauseConversation = useCallback(() => {
    console.log('[Voice Pipeline] ⏸️ Conversation paused');
    setIsPaused(true);
    stopRecording(); // Stop any active recording
    updateState('idle'); // Go to idle state but keep conversation active
  }, [stopRecording, updateState]);

  // Resume conversation after pause
  const resumeConversation = useCallback(() => {
    console.log('[Voice Pipeline] ▶️ Conversation resumed, restarting listening');
    setIsPaused(false);

    // CRITICAL: Restart listening immediately after resume
    // Use setTimeout to ensure isPaused state is updated first
    setTimeout(() => {
      if (shouldContinueRef.current) {
        console.log('[Voice Pipeline] 🎙️ Starting recording after resume');
        startRecordingRef.current?.();
      } else {
        console.warn('[Voice Pipeline] ⚠️ Cannot resume - conversation not active');
      }
    }, 100);
  }, []);

  // Called when AI response is ready to be played
  // This transitions from 'processing_ai' to 'idle' so TTS can play
  const notifyAiResponseReady = useCallback(() => {
    console.log('[Voice Pipeline] 📢 AI response ready, transitioning to idle');
    updateState('idle');
  }, [updateState]);

  return {
    state,
    startRecording,
    stopRecording,
    playTTS,
    error,
    isSupported,
    startConversation,
    stopConversation,
    pauseConversation,
    resumeConversation,
    isInConversation,
    isPaused,
    notifyAiResponseReady,
  };
}
