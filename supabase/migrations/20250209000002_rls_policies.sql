-- UK Resume Builder MVP - RLS Policies
-- Migration: 20250209000002_rls_policies.sql
-- Description: Row Level Security policies for all tables

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TEMPLATES - PUBLIC READ ACCESS
-- ============================================================================
-- Anyone can read templates (no authentication required)
CREATE POLICY "Templates are publicly readable"
    ON public.templates
    FOR SELECT
    USING (true);

-- Only service role can manage templates
CREATE POLICY "Service role can manage templates"
    ON public.templates
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- RESUMES - USER-OWNED ONLY
-- ============================================================================
-- Users can only view their own resumes
CREATE POLICY "Users can view own resumes"
    ON public.resumes
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert their own resumes
CREATE POLICY "Users can insert own resumes"
    ON public.resumes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only update their own resumes
CREATE POLICY "Users can update own resumes"
    ON public.resumes
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own resumes
CREATE POLICY "Users can delete own resumes"
    ON public.resumes
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- RESUME_VERSIONS - USER-OWNED ONLY
-- ============================================================================
-- Users can only view their own resume versions
CREATE POLICY "Users can view own resume versions"
    ON public.resume_versions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert their own resume versions
CREATE POLICY "Users can insert own resume versions"
    ON public.resume_versions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own resume versions
CREATE POLICY "Users can delete own resume versions"
    ON public.resume_versions
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- EXPORTS - USER-OWNED ONLY
-- ============================================================================
-- Users can only view their own exports
CREATE POLICY "Users can view own exports"
    ON public.exports
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert their own exports
CREATE POLICY "Users can insert own exports"
    ON public.exports
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own exports
CREATE POLICY "Users can delete own exports"
    ON public.exports
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- PURCHASES - USER-OWNED OR GUEST (BY EMAIL)
-- ============================================================================
-- Logged-in users can view their own purchases
CREATE POLICY "Users can view own purchases"
    ON public.purchases
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR (user_id IS NULL AND email = auth.jwt()->>'email')
    );

-- Only backend (service role) can insert purchases (via Stripe webhook)
CREATE POLICY "Service role can insert purchases"
    ON public.purchases
    FOR INSERT
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Only backend (service role) can update purchases (status changes)
CREATE POLICY "Service role can update purchases"
    ON public.purchases
    FOR UPDATE
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if user has active Export Pass (24h window)
CREATE OR REPLACE FUNCTION public.has_active_export_pass(p_user_id UUID DEFAULT NULL, p_email TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.purchases
        WHERE
            status = 'paid'
            AND pass_start_at IS NOT NULL
            AND pass_end_at IS NOT NULL
            AND NOW() BETWEEN pass_start_at AND pass_end_at
            AND (
                (p_user_id IS NOT NULL AND user_id = p_user_id)
                OR (p_email IS NOT NULL AND email = p_email)
            )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get active Export Pass for user
CREATE OR REPLACE FUNCTION public.get_active_export_pass(p_user_id UUID DEFAULT NULL, p_email TEXT DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    pass_start_at TIMESTAMPTZ,
    pass_end_at TIMESTAMPTZ,
    email TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.pass_start_at,
        p.pass_end_at,
        p.email
    FROM public.purchases p
    WHERE
        p.status = 'paid'
        AND p.pass_start_at IS NOT NULL
        AND p.pass_end_at IS NOT NULL
        AND NOW() BETWEEN p.pass_start_at AND p.pass_end_at
        AND (
            (p_user_id IS NOT NULL AND p.user_id = p_user_id)
            OR (p_email IS NOT NULL AND p.email = p_email)
        )
    ORDER BY p.pass_end_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
