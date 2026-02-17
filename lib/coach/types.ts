import type { ResumeData } from '@/types/resume';

export type InterviewStage =
  | 'onboarding'
  | 'deep_dive'
  | 'structuring'
  | 'generation'
  | 'review';

export type ResponseTag =
  | 'QUESTION'
  | 'SUMMARY'
  | 'RESUME'
  | 'STAR'
  | 'STRENGTHS';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CoachRequest {
  messages: ChatMessage[];
  stage: InterviewStage;
  resumeData: Partial<ResumeData>;
  sessionId?: string; // Session ID for timer tracking and conversation persistence
}

export interface ParsedBlock {
  tag: ResponseTag;
  content: string;
}

export interface CoachResponse {
  blocks: ParsedBlock[];                   // All tagged blocks in the response
  updatedResumeData: Partial<ResumeData>;  // Resume data extracted from RESUME:/STAR: blocks
  nextStage: InterviewStage;               // Stage to transition to (may be same as current)
  rawResponse: string;                     // Full raw text for display in chat
  paymentGate?: boolean;                   // Whether to show payment gate (token cost >= $0.01)
}

export interface SessionInfo {
  session_id: string;
  started_at: string;
  expires_at: string;
  time_remaining_ms: number;
  payment_status: 'free' | 'gated' | 'paid';
  is_expired?: boolean;
  in_grace_period?: boolean;
  can_continue?: boolean;
  token_usage?: {
    input: number;
    output: number;
    cost_usd: number;
  };
}
