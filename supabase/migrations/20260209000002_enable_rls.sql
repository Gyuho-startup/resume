-- UK Resume Builder MVP - Enable RLS and Apply Policies
-- Created: 2026-02-09
-- Description: Enable Row Level Security and apply all policies

-- =============================================================================
-- TEMPLATES - Public Read Access
-- =============================================================================

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates are publicly readable"
  ON templates
  FOR SELECT
  USING (true);

-- =============================================================================
-- RESUMES - User-Owned Data
-- =============================================================================

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resumes"
  ON resumes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes"
  ON resumes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes"
  ON resumes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes"
  ON resumes
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- RESUME_VERSIONS - User-Owned Version History
-- =============================================================================

ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resume versions"
  ON resume_versions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resume versions"
  ON resume_versions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resume versions"
  ON resume_versions
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- EXPORTS - User-Owned Export History
-- =============================================================================

ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exports"
  ON exports
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exports"
  ON exports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own exports"
  ON exports
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- PURCHASES - User-Owned Purchase History
-- =============================================================================

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- Note: INSERT/UPDATE for purchases handled server-side only via service role
-- No client-side INSERT/UPDATE/DELETE policies for purchases table
