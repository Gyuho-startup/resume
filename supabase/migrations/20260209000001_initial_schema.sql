-- UK Resume Builder MVP - Initial Schema Migration
-- Created: 2026-02-09
-- Description: Core tables for resumes, templates, exports, and purchases

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TEMPLATES TABLE (Public)
-- =============================================================================
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  is_ats_safe BOOLEAN NOT NULL DEFAULT true,
  version TEXT NOT NULL DEFAULT '1.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for listing templates
CREATE INDEX idx_templates_is_ats_safe ON templates(is_ats_safe);

-- =============================================================================
-- RESUMES TABLE (User-owned)
-- =============================================================================
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  role_slug TEXT,
  country TEXT NOT NULL DEFAULT 'UK',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for user queries
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_role_slug ON resumes(role_slug);
CREATE INDEX idx_resumes_created_at ON resumes(created_at DESC);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- RESUME_VERSIONS TABLE (Version History)
-- =============================================================================
CREATE TABLE resume_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for version queries
CREATE INDEX idx_resume_versions_resume_id ON resume_versions(resume_id);
CREATE INDEX idx_resume_versions_user_id ON resume_versions(user_id);
CREATE INDEX idx_resume_versions_created_at ON resume_versions(created_at DESC);

-- =============================================================================
-- EXPORTS TABLE (Export History)
-- =============================================================================
CREATE TABLE exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  watermark BOOLEAN NOT NULL DEFAULT true,
  source TEXT NOT NULL CHECK (source IN ('guest', 'user')),
  storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for export queries
CREATE INDEX idx_exports_user_id ON exports(user_id);
CREATE INDEX idx_exports_resume_id ON exports(resume_id);
CREATE INDEX idx_exports_created_at ON exports(created_at DESC);
CREATE INDEX idx_exports_watermark ON exports(watermark);

-- =============================================================================
-- PURCHASES TABLE (Export Pass Purchases)
-- =============================================================================
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  stripe_checkout_session_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('paid', 'failed', 'refunded')),
  pass_start_at TIMESTAMPTZ,
  pass_end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for purchase queries
CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_email ON purchases(email);
CREATE INDEX idx_purchases_stripe_checkout_session_id ON purchases(stripe_checkout_session_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_purchases_pass_window ON purchases(pass_start_at, pass_end_at);

-- Trigger to update updated_at
CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE templates IS 'ATS-friendly resume templates (publicly readable)';
COMMENT ON TABLE resumes IS 'User-owned resumes (logged-in users only)';
COMMENT ON TABLE resume_versions IS 'Version history for resumes (logged-in users only)';
COMMENT ON TABLE exports IS 'Export history for logged-in users';
COMMENT ON TABLE purchases IS 'Export Pass purchases (supports guest purchases via email)';

COMMENT ON COLUMN resumes.user_id IS 'Foreign key to auth.users - NOT NULL (only logged-in users can save)';
COMMENT ON COLUMN resumes.data IS 'JSONB containing full resume content (personal, education, experience, projects, skills, etc.)';
COMMENT ON COLUMN exports.source IS 'Indicates if export was from guest session or logged-in user';
COMMENT ON COLUMN exports.storage_path IS 'Optional path to stored PDF in Supabase Storage';
COMMENT ON COLUMN purchases.user_id IS 'NULLABLE - supports guest purchases via email only';
COMMENT ON COLUMN purchases.pass_start_at IS '24-hour pass start timestamp (UTC)';
COMMENT ON COLUMN purchases.pass_end_at IS '24-hour pass end timestamp (UTC)';
