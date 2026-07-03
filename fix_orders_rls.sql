-- ==========================================
-- Migration: Fix Row Level Security (RLS) policies for gift_orders table
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ==========================================

-- 1. Enable RLS on gift_orders table (if not already enabled)
ALTER TABLE public.gift_orders ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing update policies on gift_orders
DROP POLICY IF EXISTS "Allow admins to update gift_orders" ON public.gift_orders;
DROP POLICY IF EXISTS "Allow admin users to manage gift_orders" ON public.gift_orders;

-- 3. Create UPDATE policy: Allow authenticated admin users to update any order status or UPI
CREATE POLICY "Allow admin users to manage gift_orders"
    ON public.gift_orders
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.user_id = auth.uid()
            AND users.is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.user_id = auth.uid()
            AND users.is_admin = true
        )
    );
