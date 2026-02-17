'use client';

import { useState, useEffect } from 'react';
import VoiceButton from './VoiceButton';
import { useVoicePipeline } from '@/lib/hooks/useVoicePipeline';
import { parseCoachResponse, getVoiceText } from '@/lib/coach/parser';
import type { VoiceRecordingState } from '@/lib/voice/types';

interface VoiceInputBarProps {
  isAiLoading: boolean;
  onSend: (text: string) => void;
  assistantResponseText: string | null;
  onVoiceStateChange?: (state: VoiceRecordingState) => void;
  onTTSStart?: () => void; // Called when TTS starts playing
}

export default function VoiceInputBar({
  isAiLoading,
  onSend,
  assistantResponseText,
  onVoiceStateChange,
  onTTSStart,
}: VoiceInputBarProps) {
  const [mode, setMode] = useState<'voice' | 'text'>('voice'); // Server default

  // Hydrate from localStorage after mount (client-only)
  useEffect(() => {
    const savedMode = localStorage.getItem('coach-input-mode') as 'voice' | 'text';
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);
  const [textInput, setTextInput] = useState('');
  const [lastPlayedText, setLastPlayedText] = useState<string | null>(null);
  const [pendingPlay, setPendingPlay] = useState<string | null>(null);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);

  const handleTranscript = (text: string) => {
    onSend(text);
  };

  const handleRetryQuestion = (): string | null => {
    // Return the last AI response to replay if user didn't answer
    if (assistantResponseText) {
      const blocks = parseCoachResponse(assistantResponseText);
      const voiceText = getVoiceText(blocks);
      return voiceText || null;
    }
    return null;
  };

  const {
    state,
    startConversation,
    stopConversation,
    pauseConversation,
    resumeConversation,
    isInConversation,
    isPaused,
    playTTS,
    error,
    isSupported,
    notifyAiResponseReady
  } = useVoicePipeline({
      onTranscript: handleTranscript,
      onStateChange: onVoiceStateChange,
      onRetryQuestion: handleRetryQuestion,
      onTTSStart,
    });

  // When AI finishes responding (isAiLoading becomes false), reset voice state to 'idle'
  // This allows TTS auto-play and next recording to proceed
  useEffect(() => {
    if (!isAiLoading && isInConversation && state === 'processing_ai') {
      console.log('[VoiceInputBar] AI loading complete, notifying voice pipeline');
      notifyAiResponseReady();
    }
  }, [isAiLoading, isInConversation, state, notifyAiResponseReady]);

  // When AI responds and voice mode is active, auto-play TTS in continuous mode
  // OPTIMIZATION: Handles both early TTS (first sentence) and full response
  // Uses prefix matching to avoid re-playing text that was already spoken
  useEffect(() => {
    if (
      assistantResponseText &&
      assistantResponseText !== lastPlayedText &&
      mode === 'voice' &&
      state === 'idle'
    ) {
      // In continuous conversation mode, auto-play immediately
      if (isInConversation) {
        const blocks = parseCoachResponse(assistantResponseText);
        const voiceText = getVoiceText(blocks);

        console.log('[VoiceInputBar] 🎤 Preparing TTS:', {
          originalLength: assistantResponseText.length,
          voiceTextLength: voiceText.length,
          originalText: assistantResponseText.substring(0, 100),
          voiceText: voiceText.substring(0, 100),
        });

        // Only trigger TTS if this is genuinely new content
        // (not just an extension of what we already played)
        if (lastPlayedText && assistantResponseText.startsWith(lastPlayedText)) {
          console.log('[VoiceInputBar] ⚠️ Skipping TTS - content is extension of already-played text');
          setLastPlayedText(assistantResponseText);
          return;
        }

        setLastPlayedText(assistantResponseText);
        console.log('[VoiceInputBar] ✅ Triggering TTS for new content');
        playTTS(voiceText);
      } else {
        // Outside continuous mode, set pending for manual play
        setLastPlayedText(assistantResponseText);
        setPendingPlay(assistantResponseText);
      }
    }
  }, [assistantResponseText, lastPlayedText, mode, state, isInConversation, playTTS]);

  const handlePlayPending = () => {
    if (pendingPlay) {
      const blocks = parseCoachResponse(pendingPlay);
      const voiceText = getVoiceText(blocks);
      setPendingPlay(null);
      playTTS(voiceText);
    }
  };

  const toggleMode = (newMode: 'voice' | 'text') => {
    setMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('coach-input-mode', newMode);
    }
  };

  const handleTextSend = () => {
    const text = textInput.trim();
    if (!text || isAiLoading) return;
    setTextInput('');
    onSend(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSend();
    }
  };

  const handleEndConversationClick = () => {
    setShowEndConfirmation(true);
  };

  const handleConfirmEnd = () => {
    setShowEndConfirmation(false);
    stopConversation();
    // Clear local states
    setLastPlayedText(null);
    setPendingPlay(null);
  };

  const handleCancelEnd = () => {
    setShowEndConfirmation(false);
  };

  const isVoiceBusy =
    state === 'recording' ||
    state === 'processing_stt' ||
    state === 'requesting_permission' ||
    state === 'playing_tts';

  return (
    <div className="border-t border-slate-200 p-4 bg-white">
      {/* Mode Toggle */}
      <div
        className="flex justify-center mb-4"
        role="tablist"
        aria-label="Input mode"
      >
        <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
          <button
            role="tab"
            aria-selected={mode === 'voice'}
            onClick={() => toggleMode('voice')}
            className={`px-4 py-1.5 text-xs font-medium transition ${
              mode === 'voice'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            Voice
          </button>
          <button
            role="tab"
            aria-selected={mode === 'text'}
            onClick={() => toggleMode('text')}
            className={`px-4 py-1.5 text-xs font-medium transition ${
              mode === 'text'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            Text
          </button>
        </div>
      </div>

      {/* Voice mode */}
      {mode === 'voice' && (
        <div className="flex flex-col items-center gap-3">
          {!isInConversation ? (
            // Start Conversation Button
            <button
              onClick={startConversation}
              disabled={isAiLoading || !isSupported}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
              </svg>
              Start Conversation
            </button>
          ) : (
            <div className="flex flex-col items-center gap-3">
              {/* Recording indicator */}
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  isPaused ? 'bg-orange-500' :
                  state === 'recording' ? 'bg-red-500 animate-pulse' :
                  state === 'processing_stt' || state === 'processing_ai' ? 'bg-yellow-500 animate-pulse' :
                  state === 'playing_tts' ? 'bg-green-500 animate-pulse' :
                  'bg-blue-500'
                }`} />
                <span className="text-sm text-slate-600">
                  {isPaused ? '⏸️ Paused' :
                   state === 'recording' ? '🎤 Listening...' :
                   state === 'processing_stt' ? '🔄 Processing...' :
                   state === 'processing_ai' ? '🤖 AI thinking...' :
                   state === 'playing_tts' ? '🔊 Speaking...' :
                   '⏹️ Waiting for you...'}
                </span>
              </div>

              {/* Pause/Resume and Stop buttons */}
              <div className="flex gap-3">
                {/* Pause/Resume Button */}
                <button
                  onClick={isPaused ? resumeConversation : pauseConversation}
                  disabled={state === 'playing_tts'} // Can't pause while AI is speaking
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-medium shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPaused ? '▶️ Resume' : '⏸️ Pause'}
                </button>

                {/* End Conversation Button - Only works when paused */}
                <button
                  onClick={handleEndConversationClick}
                  disabled={!isPaused}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!isPaused ? 'Pause the conversation first to end it' : 'End conversation'}
                >
                  End Conversation
                </button>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <p className="text-xs text-red-500 text-center max-w-xs">{error}</p>
          )}

          {/* Pending TTS play button (browser autoplay policy workaround) */}
          {pendingPlay && !isVoiceBusy && !isAiLoading && !isInConversation && (
            <button
              onClick={handlePlayPending}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-full transition"
            >
              <svg
                className="w-4 h-4 text-blue-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              Tap to hear response
            </button>
          )}
        </div>
      )}

      {/* Text mode */}
      {mode === 'text' && (
        <div className="flex gap-3 items-end">
          <label htmlFor="coach-text-input" className="sr-only">
            Your message to the AI Career Coach
          </label>
          <textarea
            id="coach-text-input"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isAiLoading}
            placeholder={isAiLoading ? 'AI is responding...' : 'Type your answer... (Enter to send)'}
            rows={2}
            className="flex-1 resize-none px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
          />
          <button
            onClick={handleTextSend}
            disabled={isAiLoading || !textInput.trim()}
            aria-label="Send message"
            className="px-5 py-3 bg-blue-500 text-white rounded-xl font-semibold text-sm hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Send
          </button>
        </div>
      )}

      {mode === 'text' && (
        <p className="text-xs text-slate-400 mt-2 text-center">
          Press Enter to send · Shift+Enter for new line
        </p>
      )}

      {/* End Conversation Confirmation Modal */}
      {showEndConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCancelEnd}>
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">End Conversation</h3>
                <p className="text-sm text-slate-600">Are you sure you want to end this conversation?</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">⚠️ Warning:</span> All conversation history will be deleted. This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelEnd}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEnd}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition"
              >
                End Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
