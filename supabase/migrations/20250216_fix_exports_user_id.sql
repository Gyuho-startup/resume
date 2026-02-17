-- Fix exports.user_id to allow guest exports
-- Issue: exports.user_id is NOT NULL but guests don't have user_id
-- Solution: Make user_id NULLABLE

-- Step 1: Drop existing foreign key constraint
ALTER TABLE public.exports
DROP CONSTRAINT IF EXISTS exports_user_id_fkey;

-- Step 2: Make user_id NULLABLE
ALTER TABLE public.exports
ALTER COLUMN user_id DROP NOT NULL;

-- Step 3: Re-add foreign key constraint with ON DELETE CASCADE
ALTER TABLE public.exports
ADD CONSTRAINT exports_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Step 4: Update RLS policies for guest exports
-- Drop existing policy
DROP POLICY IF EXISTS "Users can view their own exports" ON public.exports;

-- Create new policy that handles both guest and authenticated exports
CREATE POLICY "Users can view their own exports or guest exports"
  ON public.exports
  FOR SELECT
  USING (
    user_id = auth.uid() OR  -- Authenticated users see their own
    user_id IS NULL          -- Anyone can see guest exports (stored in session)
  );

-- Policy for inserting exports (both guest and authenticated)
CREATE POLICY "Allow export creation"
  ON public.exports
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR  -- Authenticated users
    user_id IS NULL          -- Guest exports
  );

-- Policy for updating exports (only own exports)
CREATE POLICY "Users can update their own exports"
  ON public.exports
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add helpful comment
COMMENT ON COLUMN public.exports.user_id IS
  'User ID for authenticated exports. NULL for guest exports (session-based tracking only).';
