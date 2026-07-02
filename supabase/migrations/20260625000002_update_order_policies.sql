-- =========================================================================
-- HamperBox Migration: Restrict Order Viewing (Select) to Admins Only
-- =========================================================================

-- Drop the policy that allowed users to view their own orders
DROP POLICY IF EXISTS "Allow user to view own orders" ON public.gift_orders;
