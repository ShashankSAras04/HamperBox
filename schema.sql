-- ==========================================
-- HamperBox Database Schema
-- Production Ready Supabase-compatible SQL
-- ==========================================

-- Enable UUID extension (just in case, standard in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Profile Table (public.users)
-- References auth.users from Supabase Auth
CREATE TABLE IF NOT EXISTS public.users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    is_admin BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name TEXT NOT NULL UNIQUE,
    category_description TEXT,
    category_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Gifts Table
CREATE TABLE IF NOT EXISTS public.gifts (
    gift_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(category_id) ON DELETE CASCADE NOT NULL,
    gift_name TEXT NOT NULL,
    gift_description TEXT,
    gift_price NUMERIC(10, 2) NOT NULL CHECK (gift_price >= 0),
    gift_image TEXT,
    status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Gift Items Table
CREATE TABLE IF NOT EXISTS public.gift_items (
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gift_id UUID REFERENCES public.gifts(gift_id) ON DELETE CASCADE NOT NULL,
    item_name TEXT NOT NULL,
    item_description TEXT,
    quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Addresses Table
CREATE TABLE IF NOT EXISTS public.addresses (
    address_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE NOT NULL,
    recipient_name TEXT NOT NULL,
    phone_number TEXT,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    country TEXT DEFAULT 'India' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Gift Orders Table
CREATE TABLE IF NOT EXISTS public.gift_orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE NOT NULL,
    gift_id UUID REFERENCES public.gifts(gift_id) ON DELETE CASCADE NOT NULL,
    address_id UUID REFERENCES public.addresses(address_id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
    order_status TEXT DEFAULT 'Pending' NOT NULL CHECK (order_status IN ('Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled')),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================
-- Performance Optimization Indexes
-- ==========================================

-- Index on categories name for unique lookups and sorting
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories (category_name);

-- Indexes for gifts (category filtering and active status check)
CREATE INDEX IF NOT EXISTS idx_gifts_category_id ON public.gifts (category_id);
CREATE INDEX IF NOT EXISTS idx_gifts_status ON public.gifts (status);

-- Index for gift items (fetching items inside a gift)
CREATE INDEX IF NOT EXISTS idx_gift_items_gift_id ON public.gift_items (gift_id);

-- Index for user addresses (fetching a user's address book)
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses (user_id);

-- Indexes for orders (filtering/sorting by customer, status, and creation date)
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.gift_orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_gift_id ON public.gift_orders (gift_id);
CREATE INDEX IF NOT EXISTS idx_orders_address_id ON public.gift_orders (address_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.gift_orders (order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.gift_orders (created_at DESC);

-- ==========================================
-- New Core Configurations & Promotions tables
-- ==========================================

-- 1. Add columns to public.gifts
ALTER TABLE public.gifts ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'hamper' CHECK (type IN ('item', 'hamper'));
ALTER TABLE public.gifts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.gifts ADD COLUMN IF NOT EXISTS show_price BOOLEAN DEFAULT TRUE;

-- 1b. Make user_id nullable on addresses and gift_orders for guest checkout support
ALTER TABLE public.addresses ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.gift_orders ALTER COLUMN user_id DROP NOT NULL;

-- 2. Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    whatsapp_number TEXT DEFAULT '+919620000000',
    instagram_url TEXT DEFAULT 'https://instagram.com',
    facebook_url TEXT DEFAULT 'https://facebook.com',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Seed initial settings row if not present
INSERT INTO public.site_settings (id, whatsapp_number, instagram_url, facebook_url)
VALUES (1, '+919620000000', 'https://instagram.com', 'https://facebook.com')
ON CONFLICT (id) DO NOTHING;

-- 3. Create banners table
CREATE TABLE IF NOT EXISTS public.banners (
    banner_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    layout_position TEXT NOT NULL CHECK (layout_position IN ('hero', 'promo', 'footer')),
    link_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
    coupon_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Seed initial coupon
INSERT INTO public.coupons (code, discount_type, discount_value, is_active)
VALUES ('WELCOME10', 'percentage', 10.00, true)
ON CONFLICT (code) DO NOTHING;
