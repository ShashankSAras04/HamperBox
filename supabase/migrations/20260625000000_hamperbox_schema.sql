-- =========================================================================
-- HamperBox Migration: Initialize Database Schema, Triggers, Policies & Views
-- =========================================================================

-- Enable UUID extension (standard in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. Tables & Relationships
-- ==========================================

-- 1.1 Users Profile Table (public.users)
-- References auth.users from Supabase Auth
CREATE TABLE IF NOT EXISTS public.users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    is_admin BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 1.2 Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name TEXT NOT NULL UNIQUE,
    category_description TEXT,
    category_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 1.3 Gifts Table
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

-- 1.4 Gift Items Table
CREATE TABLE IF NOT EXISTS public.gift_items (
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gift_id UUID REFERENCES public.gifts(gift_id) ON DELETE CASCADE NOT NULL,
    item_name TEXT NOT NULL,
    item_description TEXT,
    quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 1.5 Addresses Table
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

-- 1.6 Gift Orders Table
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
-- 2. Performance Indexes
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories (category_name);
CREATE INDEX IF NOT EXISTS idx_gifts_category_id ON public.gifts (category_id);
CREATE INDEX IF NOT EXISTS idx_gifts_status ON public.gifts (status);
CREATE INDEX IF NOT EXISTS idx_gift_items_gift_id ON public.gift_items (gift_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.gift_orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_gift_id ON public.gift_orders (gift_id);
CREATE INDEX IF NOT EXISTS idx_orders_address_id ON public.gift_orders (address_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.gift_orders (order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.gift_orders (created_at DESC);

-- ==========================================
-- 3. Triggers for auto-updating timestamps & user creation
-- ==========================================

-- 3.1 Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bind updated_at trigger to categories, gifts, gift_items, and orders
CREATE OR REPLACE TRIGGER update_categories_timestamp BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();
CREATE OR REPLACE TRIGGER update_gifts_timestamp BEFORE UPDATE ON public.gifts FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();
CREATE OR REPLACE TRIGGER update_gift_items_timestamp BEFORE UPDATE ON public.gift_items FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();
CREATE OR REPLACE TRIGGER update_gift_orders_timestamp BEFORE UPDATE ON public.gift_orders FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();

-- 3.2 Trigger function to sync Auth signups to public profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (user_id, email, full_name, phone_number, is_admin)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.phone, ''),
        FALSE
    )
    ON CONFLICT (user_id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
        phone_number = COALESCE(EXCLUDED.phone_number, public.users.phone_number);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Auth signup trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 4. Row Level Security & Access Policies
-- ==========================================

-- 4.1 Helper function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN COALESCE(
        (SELECT is_admin FROM public.users WHERE user_id = auth.uid()),
        FALSE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_orders ENABLE ROW LEVEL SECURITY;

-- 4.2 public.users policies
CREATE POLICY "Allow user read own profile or admin read all" ON public.users FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Allow admin to insert profiles" ON public.users FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Allow user update own profile or admin update all" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (public.is_admin() OR (auth.uid() = user_id AND NOT is_admin));
CREATE POLICY "Allow admin to delete profiles" ON public.users FOR DELETE TO authenticated USING (public.is_admin());

-- 4.3 public.categories policies
CREATE POLICY "Allow public read access for categories" ON public.categories FOR SELECT USING (TRUE);
CREATE POLICY "Allow admin to manage categories" ON public.categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4.4 public.gifts policies
CREATE POLICY "Allow public read active gifts" ON public.gifts FOR SELECT USING (status = 'active' OR public.is_admin());
CREATE POLICY "Allow admin to manage gifts" ON public.gifts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4.5 public.gift_items policies
CREATE POLICY "Allow public read gift items" ON public.gift_items FOR SELECT USING (TRUE);
CREATE POLICY "Allow admin to manage gift items" ON public.gift_items FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4.6 public.addresses policies
CREATE POLICY "Allow user to manage own addresses" ON public.addresses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow admin to manage all addresses" ON public.addresses FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4.7 public.gift_orders policies
CREATE POLICY "Allow user to place own orders" ON public.gift_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Allow admin to manage all orders" ON public.gift_orders FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


-- ==========================================
-- 5. Views for Admin Dashboard
-- ==========================================

-- 5.1 Admin Dashboard Aggregates
CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
SELECT
    (SELECT COALESCE(SUM(total_amount), 0) FROM public.gift_orders WHERE order_status != 'Cancelled') AS total_revenue,
    (SELECT COUNT(*) FROM public.gift_orders) AS total_orders,
    (SELECT COUNT(*) FROM public.gift_orders WHERE order_status = 'Pending') AS pending_orders,
    (SELECT COUNT(*) FROM public.gifts WHERE status = 'active') AS active_gifts_count,
    (SELECT COUNT(*) FROM public.users WHERE is_admin = FALSE) AS total_customers_count;

-- 5.2 Joined orders list for admin review
CREATE OR REPLACE VIEW public.admin_order_details AS
SELECT
    o.order_id,
    o.quantity,
    o.total_amount,
    o.order_status,
    o.created_at AS order_date,
    o.updated_at AS order_updated_date,
    u.user_id,
    u.full_name AS customer_name,
    u.email AS customer_email,
    u.phone_number AS customer_phone,
    a.recipient_name,
    a.phone_number AS recipient_phone,
    a.address_line1,
    a.address_line2,
    a.city,
    a.state,
    a.pincode,
    a.country,
    TRIM(
        BOTH ', ' FROM 
        COALESCE(a.address_line1, '') || ', ' || 
        COALESCE(a.address_line2, '') || ', ' || 
        COALESCE(a.city, '') || ', ' || 
        COALESCE(a.state, '') || ' - ' || 
        COALESCE(a.pincode, '') || ', ' || 
        COALESCE(a.country, '')
    ) AS formatted_address,
    g.gift_id,
    g.gift_name,
    g.gift_price,
    g.gift_image
FROM public.gift_orders o
LEFT JOIN public.users u ON o.user_id = u.user_id
LEFT JOIN public.addresses a ON o.address_id = a.address_id
LEFT JOIN public.gifts g ON o.gift_id = g.gift_id;

-- 5.3 Inventory and Gift breakdown view
CREATE OR REPLACE VIEW public.admin_gift_inventory AS
SELECT
    g.gift_id,
    g.gift_name,
    g.gift_description,
    g.gift_price,
    g.status AS gift_status,
    c.category_name,
    COUNT(gi.item_id) AS total_distinct_items,
    COALESCE(SUM(gi.quantity), 0) AS total_items_quantity,
    COALESCE(
        STRING_AGG(gi.item_name || ' (Qty: ' || gi.quantity || ')', ', '), 
        'No items'
    ) AS item_contents_summary
FROM public.gifts g
LEFT JOIN public.categories c ON g.category_id = c.category_id
LEFT JOIN public.gift_items gi ON g.gift_id = gi.gift_id
GROUP BY g.gift_id, c.category_name;
