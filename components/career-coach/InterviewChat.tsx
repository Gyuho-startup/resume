'use client';

import { useRef, useEffect } from 'react';
import type { ChatMessage } from '@/lib/coach/types';
import type { VoiceRecordingState } from '@/lib/voice/types';
import VoiceInputBar from './VoiceInputBar';

interface InterviewChatProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (message: string) => void;
  assistantResponseText: string | null;
  onVoiceStateChange?: (state: VoiceRecordingState) => void;
  isThinking?: boolean; // AI is preparing TTS response
  onThinkingComplete?: () => void; // Called when TTS starts playing
}

export default function InterviewChat({
  messages,
  isLoading,
  onSend,
  assistantResponseText,
  onVoiceStateChange,
  isThinking = false,
  onThinkingComplete,
}: InterviewChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
        role="log"
        aria-live="polite"
        aria-label="Conversation history"
      >
        {messages.map((msg, i) => {
          // Show "AI thinking..." for the last assistant message when in thinking state
          const isLastAssistant = msg.role === 'assistant' && i === messages.length - 1;
          const showThinking = isThinking && isLastAssistant;

          return (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                }`}
              >
                {showThinking ? (
                  <span className="italic text-slate-500 flex items-center gap-2">
                    <span className="inline-block animate-pulse">💭</span>
                    AI thinking...
                  </span>
                ) : (
                  msg.content.split('\n').map((line, j, arr) => (
                    <span key={j}>
                      {line}
                      {j < arr.length - 1 && <br />}
                    </span>
                  ))
                )}
              </div>
            </div>
          );
        })}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start" aria-label="AI is thinking">
            <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center h-4">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Voice/Text Input */}
      <VoiceInputBar
        isAiLoading={isLoading}
        onSend={onSend}
        assistantResponseText={assistantResponseText}
        onVoiceStateChange={onVoiceStateChange}
        onTTSStart={onThinkingComplete}
      />
    </div>
  );
}
