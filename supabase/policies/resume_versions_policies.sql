-- RLS Policies for Resume Versions Table
-- Users can only access their own resume versions

-- Enable RLS
ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;

-- Users can view their own resume versions
CREATE POLICY "Users can view own resume versions"
  ON resume_versions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own resume versions
CREATE POLICY "Users can insert own resume versions"
  ON resume_versions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own resume versions
CREATE POLICY "Users can delete own resume versions"
  ON resume_versions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Note: Resume versions are typically append-only
-- Update policy is intentionally omitted
