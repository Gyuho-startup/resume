-- RLS Policies for Purchases Table
-- Users can only access their own purchases
-- Guest purchases (user_id = NULL) are handled server-side only

-- Enable RLS
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
  ON purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only server-side (service role) can insert purchases
-- This prevents client-side manipulation of purchase records
-- No INSERT policy for authenticated users

-- Only server-side (service role) can update purchases
-- This prevents client-side manipulation of purchase status
-- No UPDATE policy for authenticated users

-- Users cannot delete purchases
-- Purchase records must be retained for accounting/compliance
-- No DELETE policy
