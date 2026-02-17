'use client';

import type { VoiceRecordingState } from '@/lib/voice/types';

interface VoiceButtonProps {
  state: VoiceRecordingState;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled: boolean;
  isSupported: boolean;
}

const STATE_LABELS: Record<VoiceRecordingState, string> = {
  idle: 'Tap to speak',
  requesting_permission: 'Requesting mic...',
  recording: 'Recording... (tap to stop)',
  processing_stt: 'Transcribing...',
  processing_ai: 'AI is thinking...',
  playing_tts: 'Speaking...',
  error: 'Error — tap to retry',
};

export default function VoiceButton({
  state,
  onStartRecording,
  onStopRecording,
  disabled,
  isSupported,
}: VoiceButtonProps) {
  const isRecording = state === 'recording';
  const isBusy =
    state === 'requesting_permission' ||
    state === 'processing_stt' ||
    state === 'processing_ai' ||
    state === 'playing_tts';

  const handleClick = () => {
    if (disabled || isBusy) return;
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  if (!isSupported) {
    return (
      <p className="text-xs text-slate-400 text-center py-2">
        Voice not supported in this browser
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleClick}
        disabled={disabled || isBusy}
        aria-label={STATE_LABELS[state]}
        aria-pressed={isRecording}
        className={`
          w-16 h-16 rounded-full flex items-center justify-center transition-all
          focus:outline-none focus:ring-4 focus:ring-offset-2
          ${isRecording
            ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300 animate-pulse'
            : isBusy
            ? 'bg-slate-300 cursor-not-allowed'
            : state === 'error'
            ? 'bg-orange-400 hover:bg-orange-500 focus:ring-orange-300'
            : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-300'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isBusy ? (
          /* Spinner */
          <svg
            className="w-7 h-7 text-white animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : isRecording ? (
          /* Stop icon */
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          /* Microphone icon */
          <svg
            className="w-7 h-7 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 3a4 4 0 014 4v4a4 4 0 01-8 0V7a4 4 0 014-4z"
            />
          </svg>
        )}
      </button>

      <span className="text-xs text-slate-500 text-center min-h-[1rem]">
        {STATE_LABELS[state]}
      </span>
    </div>
  );
}
