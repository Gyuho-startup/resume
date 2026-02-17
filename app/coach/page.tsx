'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
// import StageIndicator from '@/components/career-coach/StageIndicator';
import InterviewChat from '@/components/career-coach/InterviewChat';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import PaymentGateResumePreview from '@/components/career-coach/PaymentGateResumePreview';
import { DEFAULT_SECTION_ORDER } from '@/lib/section-order';
import { emptyResumeData } from '@/lib/sample-data';
import type { ChatMessage, InterviewStage, SessionInfo } from '@/lib/coach/types';
import type { ResumeData } from '@/types/resume';
import type { VoiceRecordingState } from '@/lib/voice/types';

export default function CoachPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [stage, setStage] = useState<InterviewStage>('onboarding');
  const [resumeData, setResumeData] = useState<Partial<ResumeData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [mobileTab, setMobileTab] = useState<'chat' | 'preview'>('chat');
  const [initialized, setInitialized] = useState(false);
  const [assistantResponseText, setAssistantResponseText] = useState<string | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceRecordingState>('idle');

  // Track voice mode based on voice state
  // Voice mode is active during: recording, processing, playing_tts, requesting_permission
  // This helps us know when to hide text until TTS starts
  useEffect(() => {
    const activeVoiceStates: VoiceRecordingState[] = [
      'recording',
      'processing_stt',
      'processing_ai',
      'playing_tts',
      'requesting_permission',
    ];
    setVoiceMode(activeVoiceStates.includes(voiceState));
  }, [voiceState]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showGenerateButton, setShowGenerateButton] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showPaymentGate, setShowPaymentGate] = useState(false);
  const [isThinking, setIsThinking] = useState(false); // AI thinking before TTS starts
  const [voiceMode, setVoiceMode] = useState(false); // Track if user is in voice mode

  // Initialize session on mount
  useEffect(() => {
    if (initialized) return;
    setInitialized(true);

    const initSession = async () => {
      try {
        const res = await fetch('/api/coach/session/init', {
          method: 'POST',
        });

        if (!res.ok) {
          console.error('[Coach] Failed to create session');
          // Continue without session (graceful degradation)
          const initialMessage: ChatMessage = {
            role: 'user',
            content: 'Hello! I need help building my CV.',
          };
          fetchCoachResponse([initialMessage], false);
          return;
        }

        const sessionData: SessionInfo = await res.json();
        setSessionId(sessionData.session_id);
        console.log('[Coach] Session created:', sessionData.session_id);

        // Start the conversation
        const initialMessage: ChatMessage = {
          role: 'user',
          content: 'Hello! I need help building my CV.',
        };
        fetchCoachResponse([initialMessage], false, sessionData.session_id);
      } catch (error) {
        console.error('[Coach] Session init error:', error);
        // Continue anyway without session (graceful degradation)
        const initialMessage: ChatMessage = {
          role: 'user',
          content: 'Hello! I need help building my CV.',
        };
        fetchCoachResponse([initialMessage], false);
      }
    };

    initSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCoachResponse = useCallback(async (
    msgs: ChatMessage[],
    showUserMessage = true,
    overrideSessionId?: string // Allow passing sessionId directly to avoid state timing issues
  ) => {
    setIsLoading(true);

    // Add user message + placeholder assistant message in one update (for immediate visual feedback)
    const userMessage = msgs[msgs.length - 1]; // Last message is the new user message
    const messagesToAdd = showUserMessage
      ? [userMessage, { role: 'assistant' as const, content: '' }]
      : [{ role: 'assistant' as const, content: '' }];

    // Calculate placeholder index - it's the last item in the array we're adding
    let placeholderIndex = 0;
    setMessages(prev => {
      // Assistant placeholder is always the last message after adding
      placeholderIndex = prev.length + messagesToAdd.length - 1;
      return [...prev, ...messagesToAdd];
    });

    // Use overrideSessionId if provided, otherwise use state sessionId
    const effectiveSessionId = overrideSessionId || sessionId;

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: msgs,
          stage,
          resumeData,
          sessionId: effectiveSessionId, // Use effective session ID
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to reach AI service' }));
        setMessages(prev => {
          const updated = [...prev];
          updated[placeholderIndex] = {
            role: 'assistant',
            content: err.error || 'Something went wrong. Please try again.',
          };
          return updated;
        });
        setIsLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let fullResponse = '';
      let firstSentenceTriggered = false;

      if (!reader) {
        throw new Error('No reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        // Process complete SSE messages
        const lines = accumulatedText.split('\n\n');
        accumulatedText = lines.pop() || ''; // Keep incomplete message

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            try {
              const data = JSON.parse(jsonStr);

              if (data.type === 'text') {
                // Hide loading indicator as soon as first text arrives
                setIsLoading(false);

                // Accumulate response text
                fullResponse += data.content;

                // In text mode OR non-voice mode, update messages in real-time
                // In voice mode, hide text until TTS starts (handled by isThinking state)
                if (!voiceMode) {
                  setMessages(prev => {
                    const updated = [...prev];
                    updated[placeholderIndex] = {
                      role: 'assistant',
                      content: fullResponse,
                    };
                    return updated;
                  });
                }

                // Store full response for later use (TTS will use this)
                // Don't trigger early TTS in voice mode - wait for complete response
              } else if (data.type === 'complete') {
                // Final update with structured data
                setIsLoading(false); // Ensure loading is stopped
                setAssistantResponseText(data.rawResponse);

                // In voice mode, show "AI thinking..." until TTS starts playing
                // Text will be shown when onThinkingComplete is called (when TTS starts)
                if (voiceMode) {
                  setIsThinking(true);
                  // Don't update messages yet - wait for TTS to start
                } else {
                  // In text mode, show message immediately
                  setMessages(prev => {
                    const updated = [...prev];
                    updated[placeholderIndex] = {
                      role: 'assistant',
                      content: data.rawResponse,
                    };
                    return updated;
                  });
                }

                if (data.updatedResumeData && Object.keys(data.updatedResumeData).length > 0) {
                  setResumeData(prev => ({ ...prev, ...data.updatedResumeData }));
                }
                if (data.nextStage) {
                  setStage(data.nextStage);
                  // Show generate button when AI outputs RESUME tag (stage becomes 'review')
                  if (data.nextStage === 'review') {
                    setShowGenerateButton(true);
                  }
                }

                // Show payment gate if triggered (after 10 conversation turns)
                if (data.paymentGate) {
                  setShowPaymentGate(true);
                }
              } else if (data.type === 'error') {
                setIsLoading(false); // Stop loading on error too
                setMessages(prev => {
                  const updated = [...prev];
                  updated[placeholderIndex] = {
                    role: 'assistant',
                    content: data.message,
                  };
                  return updated;
                });
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setMessages(prev => {
        const updated = [...prev];
        updated[placeholderIndex] = {
          role: 'assistant',
          content: "I'm having trouble connecting. Please check your internet connection and try again.",
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, resumeData, messages.length]);

  const handleSend = (text: string) => {
    const userMsg: ChatMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];

    // Detect if user is explicitly requesting CV generation
    const generateTriggers = [
      '이제 만들어줘',
      '만들어줘',
      'create it now',
      'generate cv',
      'make my cv',
      'download cv',
      'get my cv',
    ];
    const lowerText = text.toLowerCase();
    if (generateTriggers.some(trigger => lowerText.includes(trigger))) {
      console.log('[Coach] User requested CV generation explicitly');
      // The AI will respond with RESUME tag, which will trigger the button
    }

    // Don't set messages here - fetchCoachResponse will add both user + assistant in one update
    fetchCoachResponse(updatedMessages);
  };

  const handleSwitchToBuilder = () => {
    // Merge AI-collected data into a full ResumeData object and save to localStorage
    const fullData: ResumeData = {
      ...emptyResumeData,
      ...resumeData,
      personal: { ...emptyResumeData.personal, ...(resumeData.personal ?? {}) },
      skills: { ...emptyResumeData.skills, ...(resumeData.skills ?? {}) },
    };
    const draft = {
      title: resumeData.personal?.name
        ? `${resumeData.personal.name}'s CV`
        : 'My CV',
      country: 'UK',
      templateSlug: 'education-first',
      sectionOrder: DEFAULT_SECTION_ORDER,
      data: fullData,
    };
    localStorage.setItem('uk-resume-builder:draft', JSON.stringify(draft));
    router.push('/builder');
  };

  const handleGenerateCV = async () => {
    setIsGeneratingPDF(true);

    try {
      // Merge AI-collected data into a full ResumeData object
      const fullData: ResumeData = {
        ...emptyResumeData,
        ...resumeData,
        personal: { ...emptyResumeData.personal, ...(resumeData.personal ?? {}) },
        skills: { ...emptyResumeData.skills, ...(resumeData.skills ?? {}) },
      };

      console.log('[Coach] Generating CV with data:', fullData);

      const response = await fetch('/api/coach/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeData: fullData,
          templateSlug: 'education-first',
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to generate CV' }));
        throw new Error(error.message || 'Failed to generate CV');
      }

      // Get quality metrics from headers
      const qualityScore = response.headers.get('X-Quality-Score');
      const improvements = response.headers.get('X-Improvements-Made');

      console.log(`[Coach] CV generated! Quality: ${qualityScore}%, Improvements: ${improvements}`);

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fullData.personal?.name || 'My CV'}_CV.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Show success message
      alert(`CV generated successfully!\n\nQuality Score: ${qualityScore}%\nBullets Improved: ${improvements}`);
    } catch (error) {
      console.error('[Coach] CV generation error:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate CV. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Merged data for live preview
  const previewData: ResumeData = {
    ...emptyResumeData,
    ...resumeData,
    personal: { ...emptyResumeData.personal, ...(resumeData.personal ?? {}) },
    skills: { ...emptyResumeData.skills, ...(resumeData.skills ?? {}) },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      {/* <StageIndicator currentStage={stage} /> */}

      {/* Mobile tab switcher */}
      <div className="lg:hidden bg-white border-b border-slate-200" role="tablist" aria-label="View switcher">
        <div className="flex">
          <button
            role="tab"
            aria-selected={mobileTab === 'chat'}
            aria-controls="panel-chat"
            onClick={() => setMobileTab('chat')}
            className={`flex-1 py-2.5 text-sm font-medium transition border-b-2 ${
              mobileTab === 'chat'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500'
            }`}
          >
            AI Coach
          </button>
          <button
            role="tab"
            aria-selected={mobileTab === 'preview'}
            aria-controls="panel-preview"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2.5 text-sm font-medium transition border-b-2 ${
              mobileTab === 'preview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500'
            }`}
          >
            CV Preview
          </button>
        </div>
      </div>

      {/* Payment Gate Modal with Resume Preview */}
      {showPaymentGate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full my-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">✨</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Great Progress!</h2>
                    <p className="text-sm text-blue-100">See what we've built together</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPaymentGate(false)}
                  className="text-white/80 hover:text-white transition"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Two-column layout: Preview + Pricing */}
            <div className="grid lg:grid-cols-2 gap-6 p-6">
              {/* Left: Resume Preview */}
              <div className="lg:order-1 order-2">
                <PaymentGateResumePreview
                  resumeData={resumeData}
                  className="h-full max-h-[600px]"
                />
              </div>

              {/* Right: Pricing & CTA */}
              <div className="lg:order-2 order-1 flex flex-col">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    Unlock Complete CV Builder
                  </h3>
                  <p className="text-slate-600">
                    Continue building your professional CV with AI guidance
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 mb-6">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    What You'll Get
                  </h4>
                  <ul className="text-sm text-slate-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Add multiple experiences, projects & education</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>AI-guided STAR framework for each section</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Choose from 5 ATS-friendly templates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Download HR-quality PDF (no watermark)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>85-90% HR screening pass rate</span>
                    </li>
                  </ul>

                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-slate-600">One-time payment</span>
                      <div className="text-3xl font-bold text-blue-600">£4.99</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    // TODO: Implement Stripe checkout (Week 3)
                    alert('Stripe checkout coming in Week 3!');
                  }}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition mb-3"
                >
                  Continue Building - £4.99
                </button>

                <button
                  onClick={() => setShowPaymentGate(false)}
                  className="w-full py-2 text-sm text-slate-600 hover:text-slate-800 transition"
                >
                  Not now (conversation will be paused)
                </button>

                <p className="text-xs text-slate-500 text-center mt-4">
                  🔒 Secure payment via Stripe • GDPR compliant
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6">
        <div
          className="grid lg:grid-cols-2 gap-6 h-full"
          style={{ minHeight: 'calc(100vh - 220px)' }}
        >
          {/* Left panel: Chat */}
          <div
            id="panel-chat"
            role="tabpanel"
            className={`bg-white rounded-lg shadow flex flex-col overflow-hidden ${
              mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'
            }`}
            style={{ height: 'calc(100vh - 240px)' }}
          >
            <div className="px-4 pt-4 pb-2 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Let's build your CV</h2>
              <p className="text-xs text-slate-500">
                I'll help you create your CV as we chat
              </p>
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex-1 overflow-hidden">
                <InterviewChat
                  messages={messages}
                  isLoading={isLoading}
                  onSend={handleSend}
                  assistantResponseText={assistantResponseText}
                  onVoiceStateChange={setVoiceState}
                  isThinking={isThinking}
                  onThinkingComplete={() => {
                    // When TTS starts, show the actual text and clear thinking state
                    setIsThinking(false);
                    if (assistantResponseText) {
                      setMessages(prev => {
                        const updated = [...prev];
                        const lastMsg = updated[updated.length - 1];
                        if (lastMsg && lastMsg.role === 'assistant') {
                          // Update the last assistant message with actual text
                          updated[updated.length - 1] = {
                            role: 'assistant',
                            content: assistantResponseText,
                          };
                        }
                        return updated;
                      });
                    }
                  }}
                />
              </div>
              {showGenerateButton && (
                <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <button
                    onClick={handleGenerateCV}
                    disabled={isGeneratingPDF}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isGeneratingPDF ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
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
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Generating Your CV...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                          />
                        </svg>
                        <span>Download Your CV (HR-Quality Guaranteed)</span>
                      </>
                    )}
                  </button>
                  <p className="text-xs text-center text-slate-600 mt-2">
                    Watermark-free PDF with AI-validated bullets (85-90% HR pass rate)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: CV Preview */}
          <div
            id="panel-preview"
            role="tabpanel"
            className={`lg:sticky lg:top-6 h-fit ${
              mobileTab === 'preview' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-slate-900">CV Preview</h3>
                <button
                  onClick={handleSwitchToBuilder}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
                  aria-label="Open current CV data in the form-based builder"
                >
                  Open in Form Editor →
                </button>
              </div>
              <div className="border border-slate-200 rounded overflow-hidden">
                {/* Scale the A4 preview (794px wide) down to fit the ~50% column */}
                <div
                  className="scale-50 origin-top-left"
                  style={{ width: '200%' }}
                >
                  <TemplateRenderer
                    templateSlug="education-first"
                    data={previewData}
                    sectionOrder={DEFAULT_SECTION_ORDER}
                    watermark={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
