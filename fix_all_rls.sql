-- ==========================================================
-- Migration: Fix Row Level Security (RLS) policies for ALL tables
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- This grants foolproof view/read access to all tables, and full write
-- access to authenticated users (admin dashboard).
-- ==========================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upi_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_orders ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to clean up duplicates
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
DROP POLICY IF EXISTS "Allow auth manage categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public read gifts" ON public.gifts;
DROP POLICY IF EXISTS "Allow auth manage gifts" ON public.gifts;
DROP POLICY IF EXISTS "Allow public read gift_items" ON public.gift_items;
DROP POLICY IF EXISTS "Allow auth manage gift_items" ON public.gift_items;
DROP POLICY IF EXISTS "Allow public read addresses" ON public.addresses;
DROP POLICY IF EXISTS "Allow auth manage addresses" ON public.addresses;
DROP POLICY IF EXISTS "Allow public read users" ON public.users;
DROP POLICY IF EXISTS "Allow auth manage users" ON public.users;
DROP POLICY IF EXISTS "Allow public read coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow auth manage coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow public read upi_ids" ON public.upi_ids;
DROP POLICY IF EXISTS "Allow auth manage upi_ids" ON public.upi_ids;
DROP POLICY IF EXISTS "Allow public read orders" ON public.gift_orders;
DROP POLICY IF EXISTS "Allow auth manage orders" ON public.gift_orders;
DROP POLICY IF EXISTS "Allow public to insert orders" ON public.gift_orders;
DROP POLICY IF EXISTS "Allow public to select orders" ON public.gift_orders;

-- 3. CATEGORIES Policies
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow auth manage categories" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. GIFTS Policies
CREATE POLICY "Allow public read gifts" ON public.gifts FOR SELECT USING (true);
CREATE POLICY "Allow auth manage gifts" ON public.gifts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. GIFT_ITEMS Policies
CREATE POLICY "Allow public read gift_items" ON public.gift_items FOR SELECT USING (true);
CREATE POLICY "Allow auth manage gift_items" ON public.gift_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. ADDRESSES Policies
CREATE POLICY "Allow public read addresses" ON public.addresses FOR SELECT USING (true);
CREATE POLICY "Allow auth manage addresses" ON public.addresses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. USERS Policies (public.users)
CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow auth manage users" ON public.users FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. COUPONS Policies
CREATE POLICY "Allow public read coupons" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Allow auth manage coupons" ON public.coupons FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. UPI_IDS Policies
CREATE POLICY "Allow public read upi_ids" ON public.upi_ids FOR SELECT USING (true);
CREATE POLICY "Allow auth manage upi_ids" ON public.upi_ids FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 10. GIFT_ORDERS Policies
CREATE POLICY "Allow public read orders" ON public.gift_orders FOR SELECT USING (true);
CREATE POLICY "Allow auth manage orders" ON public.gift_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public to insert orders" ON public.gift_orders FOR INSERT TO anon, authenticated WITH CHECK (true);
