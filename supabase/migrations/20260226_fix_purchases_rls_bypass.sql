-- Fix: Remove overly permissive purchases RLS policies from 20250216_fix_purchases_rls.sql
--
-- Vulnerability: "Allow purchase creation during checkout" allowed any authenticated user
-- to INSERT a row with status='paid', directly granting themselves a free Export Pass.
-- "Users can update their pending purchases" allowed updating status to any value.
--
-- The correct approach (from 20250209000002_rls_policies.sql) is already in place:
--   "Service role can insert purchases"  — INSERT restricted to service_role only
--   "Service role can update purchases"  — UPDATE restricted to service_role only
-- Only the Stripe webhook (running as service_role) should ever write to this table.

-- Drop permissive INSERT policy (payment bypass vulnerability)
DROP POLICY IF EXISTS "Allow purchase creation during checkout" ON public.purchases;

-- Drop permissive UPDATE policy (status could be changed by users)
DROP POLICY IF EXISTS "Users can update their pending purchases" ON public.purchases;

-- Drop duplicate SELECT policy added by 20250216 (original "Users can view own purchases" remains)
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.purchases;
