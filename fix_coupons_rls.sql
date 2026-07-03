-- ==========================================
-- Migration: Fix Row Level Security (RLS) policies for coupons table
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ==========================================

-- 1. Enable RLS on coupons table (if not already enabled)
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to clean up duplicates
DROP POLICY IF EXISTS "Allow public read access to coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow authenticated users to read coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow admins to manage coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow admin users to manage coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow authenticated users to manage coupons" ON public.coupons;

-- 3. Create SELECT policy: Allow all users (including anonymous guest customers during checkout) to read/validate coupons
CREATE POLICY "Allow public read access to coupons"
    ON public.coupons
    FOR SELECT
    USING (true);

-- 4. Create WRITE policy (FOOLPROOF OPTION): Allow any authenticated user to manage coupons (insert, update, delete)
CREATE POLICY "Allow authenticated users to manage coupons"
    ON public.coupons
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
