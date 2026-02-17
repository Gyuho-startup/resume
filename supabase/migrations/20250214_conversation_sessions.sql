-- Conversation Sessions table for AI Coach monetization
-- Tracks 10-minute free tier, payment status, and data retention

CREATE TABLE IF NOT EXISTS public.conversation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User tracking (nullable for guest users)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_identifier TEXT, -- For guest tracking (browser fingerprint, session cookie)

  -- Session timing
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL, -- started_at + 10 minutes

  -- Payment tracking
  payment_status TEXT NOT NULL DEFAULT 'free' CHECK (payment_status IN ('free', 'gated', 'paid')),
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount_paid INTEGER, -- in pence (499 = £4.99)

  -- Conversation data (encrypted for privacy)
  conversation_data JSONB NOT NULL DEFAULT '[]', -- Array of messages
  resume_data JSONB, -- Generated resume data

  -- Soft delete for GDPR compliance
  deleted_at TIMESTAMPTZ,
  deletion_reason TEXT, -- 'user_cancelled', 'expired', 'gdpr_request'

  -- Metadata
  user_agent TEXT,
  ip_address INET,

  CONSTRAINT valid_expires_at CHECK (expires_at > started_at)
);

-- Indexes for performance
CREATE INDEX idx_conversation_sessions_user_id
  ON public.conversation_sessions(user_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_conversation_sessions_expires_at
  ON public.conversation_sessions(expires_at)
  WHERE payment_status = 'free' AND deleted_at IS NULL;

CREATE INDEX idx_conversation_sessions_payment_status
  ON public.conversation_sessions(payment_status, created_at);

CREATE INDEX idx_conversation_sessions_deleted_at
  ON public.conversation_sessions(deleted_at)
  WHERE deleted_at IS NOT NULL;

-- RLS Policies
ALTER TABLE public.conversation_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own sessions
CREATE POLICY "Users can view own sessions"
  ON public.conversation_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

-- Policy: Users can update their own sessions
CREATE POLICY "Users can update own sessions"
  ON public.conversation_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

-- Policy: Service role can do everything (for API operations)
CREATE POLICY "Service role has full access"
  ON public.conversation_sessions
  FOR ALL
  TO service_role
  USING (true);

-- Policy: Guest users can access via guest_identifier (temporary, expires after session)
-- This is handled in API layer with service_role key

-- Function to auto-delete expired sessions (GDPR compliance)
CREATE OR REPLACE FUNCTION public.cleanup_deleted_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Hard delete sessions that were soft-deleted more than 7 days ago
  DELETE FROM public.conversation_sessions
  WHERE deleted_at IS NOT NULL
    AND deleted_at < now() - INTERVAL '7 days';
END;
$$;

-- Create cron job to run cleanup daily (requires pg_cron extension)
-- Note: This needs to be set up manually in Supabase dashboard
-- Cron: 0 2 * * * (2 AM daily)
-- SELECT cron.schedule('cleanup-deleted-sessions', '0 2 * * *', 'SELECT public.cleanup_deleted_sessions()');

COMMENT ON TABLE public.conversation_sessions IS 'Tracks AI Coach conversation sessions with 10-minute free tier and payment gating';
COMMENT ON COLUMN public.conversation_sessions.payment_status IS 'free = within 10min, gated = expired awaiting payment, paid = payment completed';
COMMENT ON COLUMN public.conversation_sessions.deleted_at IS 'Soft delete timestamp for GDPR compliance (hard deleted after 7 days)';
