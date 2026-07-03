-- ==========================================
-- Migration: Fix Row Level Security (RLS) policies for coupons table
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ==========================================

-- 1. Enable RLS on coupons table (if not already enabled)
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing SELECT policies on coupons to clean up duplicates
DROP POLICY IF EXISTS "Allow public read access to coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow authenticated users to read coupons" ON public.coupons;

-- 3. Create SELECT policy: Allow all users (including anonymous guest customers during checkout) to read coupons
CREATE POLICY "Allow public read access to coupons"
    ON public.coupons
    FOR SELECT
    USING (true);

-- 4. Drop existing write/manage policies on coupons
DROP POLICY IF EXISTS "Allow admins to manage coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow admin users to manage coupons" ON public.coupons;

-- 5. Create ALL policies: Allow admin users to insert, update, and delete coupons
-- (This policy checks the 'users' table to verify the user has is_admin = true)
CREATE POLICY "Allow admin users to manage coupons"
    ON public.coupons
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
