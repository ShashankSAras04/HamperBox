-- ==========================================
-- Migration: Fix Row Level Security (RLS) policies for gift_orders table
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ==========================================

-- 1. Enable RLS on gift_orders table (if not already enabled)
ALTER TABLE public.gift_orders ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing update/manage policies on gift_orders to clean up duplicates
DROP POLICY IF EXISTS "Allow admins to update gift_orders" ON public.gift_orders;
DROP POLICY IF EXISTS "Allow admin users to manage gift_orders" ON public.gift_orders;
DROP POLICY IF EXISTS "Allow authenticated users to manage gift_orders" ON public.gift_orders;

-- 3. Create UPDATE/ALL policy (FOOLPROOF OPTION)
-- This allows any authenticated user (e.g. your admin account) to view and update orders.
-- This is recommended as it doesn't depend on sync state or triggers in the public.users table.
CREATE POLICY "Allow authenticated users to manage gift_orders"
    ON public.gift_orders
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Also make sure public / anonymous checkouts can insert orders (needed for guest checkout)
DROP POLICY IF EXISTS "Allow public to insert orders" ON public.gift_orders;
CREATE POLICY "Allow public to insert orders"
    ON public.gift_orders
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- 5. Allow anyone to select/view orders (needed for order tracking by phone/ref)
DROP POLICY IF EXISTS "Allow public to select orders" ON public.gift_orders;
CREATE POLICY "Allow public to select orders"
    ON public.gift_orders
    FOR SELECT
    USING (true);
