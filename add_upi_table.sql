-- ==========================================
-- Migration: Add UPI ID Management & Order Payment Tracking
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ==========================================

-- 1. Create UPI IDs Table (admin-managed payment identifiers)
CREATE TABLE IF NOT EXISTS public.upi_ids (
    upi_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upi_address TEXT NOT NULL UNIQUE,
    label TEXT DEFAULT '',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Add UPI tracking columns to gift_orders
ALTER TABLE public.gift_orders ADD COLUMN IF NOT EXISTS selected_upi TEXT;
ALTER TABLE public.gift_orders ADD COLUMN IF NOT EXISTS upi_locked BOOLEAN DEFAULT FALSE;

-- 3. Enable RLS on upi_ids (admin-only access)
ALTER TABLE public.upi_ids ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Allow authenticated users to read UPI IDs
CREATE POLICY "Allow authenticated users to read upi_ids"
    ON public.upi_ids
    FOR SELECT
    TO authenticated
    USING (true);

-- 5. Policy: Allow admin users to manage UPI IDs
-- (Assumes your users table has is_admin column)
CREATE POLICY "Allow admin users to manage upi_ids"
    ON public.upi_ids
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

-- 6. Grant public read access for anon users (needed for WhatsApp messages showing UPI)
CREATE POLICY "Allow anon users to read upi_ids"
    ON public.upi_ids
    FOR SELECT
    TO anon
    USING (true);
