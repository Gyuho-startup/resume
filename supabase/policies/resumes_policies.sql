-- RLS Policies for Resumes Table
-- Users can only access their own resumes

-- Enable RLS
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Users can view their own resumes
CREATE POLICY "Users can view own resumes"
  ON resumes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own resumes
CREATE POLICY "Users can insert own resumes"
  ON resumes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own resumes
CREATE POLICY "Users can update own resumes"
  ON resumes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own resumes
CREATE POLICY "Users can delete own resumes"
  ON resumes
  FOR DELETE
  USING (auth.uid() = user_id);
