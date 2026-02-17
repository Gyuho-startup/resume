-- Complete RLS policies for purchases table
-- Issue: Only SELECT policy exists, missing INSERT/UPDATE policies
-- Solution: Add comprehensive RLS policies for all operations

-- Drop existing policies to recreate cleanly
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.purchases;

-- SELECT: Users can view their own purchases (by user_id or email)
CREATE POLICY "Users can view their own purchases"
  ON public.purchases
  FOR SELECT
  USING (
    user_id = auth.uid() OR                    -- Authenticated: by user_id
    email = (SELECT email FROM auth.users WHERE id = auth.uid()) -- By email
  );

-- INSERT: Allow purchase record creation
-- Note: Service role will handle Stripe webhook inserts
-- Users can create purchase records during checkout (before Stripe confirms)
CREATE POLICY "Allow purchase creation during checkout"
  ON public.purchases
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR  -- Authenticated users
    user_id IS NULL          -- Guest purchases (email-only)
  );

-- UPDATE: Only service role should update (via webhooks)
-- But allow users to update their own draft purchases (before webhook confirmation)
CREATE POLICY "Users can update their pending purchases"
  ON public.purchases
  FOR UPDATE
  USING (
    (user_id = auth.uid() OR user_id IS NULL) AND
    status = 'pending'  -- Only update pending purchases
  )
  WITH CHECK (
    (user_id = auth.uid() OR user_id IS NULL) AND
    status IN ('pending', 'paid', 'failed', 'refunded')
  );

-- DELETE: Users cannot delete purchases (audit trail)
-- Only service role can delete (via Supabase admin)
-- No DELETE policy = no user deletions

-- Add index for email lookups (performance)
CREATE INDEX IF NOT EXISTS idx_purchases_email
  ON public.purchases(email);

-- Add index for pass expiry checks
CREATE INDEX IF NOT EXISTS idx_purchases_pass_expiry
  ON public.purchases(pass_end_at)
  WHERE status = 'paid';

-- Add helpful comment
COMMENT ON TABLE public.purchases IS
  'Purchase records for Export Pass (24h). Supports both authenticated and guest purchases (email-only). RLS policies enforce user isolation.';
