-- Add token tracking to conversation_sessions table
-- This enables $0.02 USD payment gate based on Anthropic API token usage

-- Add token_usage column with JSONB structure
ALTER TABLE public.conversation_sessions
ADD COLUMN IF NOT EXISTS token_usage JSONB DEFAULT '{"input": 0, "output": 0, "cost_usd": 0.0}'::jsonb;

-- Add index for efficient querying by cost (for payment gate checks)
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_token_cost
  ON public.conversation_sessions(CAST(token_usage->>'cost_usd' AS numeric))
  WHERE payment_status = 'free' AND deleted_at IS NULL;

-- Add documentation comment
COMMENT ON COLUMN public.conversation_sessions.token_usage IS
  'Tracks cumulative token usage from Anthropic API: {input: number, output: number, cost_usd: number}. Payment gate triggers at $0.02 USD. Pricing: Input=$3/M tokens, Output=$15/M tokens (Claude Sonnet 4.5).';
