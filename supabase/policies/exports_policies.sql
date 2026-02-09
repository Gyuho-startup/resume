-- RLS Policies for Exports Table
-- Users can only access their own export history

-- Enable RLS
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

-- Users can view their own exports
CREATE POLICY "Users can view own exports"
  ON exports
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own exports
CREATE POLICY "Users can insert own exports"
  ON exports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own exports
CREATE POLICY "Users can delete own exports"
  ON exports
  FOR DELETE
  USING (auth.uid() = user_id);

-- Note: Exports are typically append-only
-- Update policy is intentionally omitted
