-- ==========================================
-- Row Level Security (RLS) Policies
-- ==========================================

-- 1. Helper function to check if the current user is an Admin
-- This function runs with SECURITY DEFINER to bypass RLS when checking the user's role.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN COALESCE(
        (SELECT is_admin FROM public.users WHERE user_id = auth.uid()),
        FALSE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_orders ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- Policies for public.users
-- ==========================================

-- Select policy: users can view their own profile, admins can view all profiles
CREATE POLICY "Allow user read own profile or admin read all"
    ON public.users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

-- Insert policy: Handled automatically by the trigger `handle_new_user` running under SECURITY DEFINER.
-- However, we define a policy just in case direct creation is needed by admins.
CREATE POLICY "Allow admin to insert profiles"
    ON public.users
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- Update policy: users can update their own details (but cannot set is_admin to true), admins can update all
CREATE POLICY "Allow user update own profile or admin update all"
    ON public.users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (public.is_admin() OR (auth.uid() = user_id AND NOT is_admin));

-- Delete policy: admins only
CREATE POLICY "Allow admin to delete profiles"
    ON public.users
    FOR DELETE
    TO authenticated
    USING (public.is_admin());


-- ==========================================
-- Policies for public.categories
-- ==========================================

-- Select policy: public access to read categories (browsing)
CREATE POLICY "Allow public read access for categories"
    ON public.categories
    FOR SELECT
    USING (TRUE);

-- Write policies: admin only
CREATE POLICY "Allow admin to manage categories"
    ON public.categories
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- ==========================================
-- Policies for public.gifts
-- ==========================================

-- Select policy: public read for active gifts, admin can read all (including inactive)
CREATE POLICY "Allow public read active gifts"
    ON public.gifts
    FOR SELECT
    USING (status = 'active' OR public.is_admin());

-- Write policies: admin only
CREATE POLICY "Allow admin to manage gifts"
    ON public.gifts
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- ==========================================
-- Policies for public.gift_items
-- ==========================================

-- Select policy: public read for all items
CREATE POLICY "Allow public read gift items"
    ON public.gift_items
    FOR SELECT
    USING (TRUE);

-- Write policies: admin only
CREATE POLICY "Allow admin to manage gift items"
    ON public.gift_items
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- ==========================================
-- Policies for public.addresses
-- ==========================================

-- All operations (CRUD): user can manage their own addresses, admin can manage all
CREATE POLICY "Allow user to manage own addresses"
    ON public.addresses
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admin to manage all addresses"
    ON public.addresses
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- ==========================================
-- Policies for public.gift_orders
-- ==========================================

-- Select policy: users can view their own orders, admins can view all
CREATE POLICY "Allow user to view own orders"
    ON public.gift_orders
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

-- Insert policy: users can place their own orders (their user_id must match auth.uid()), admins can place orders
CREATE POLICY "Allow user to place own orders"
    ON public.gift_orders
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Update/Delete policies: admins only (users cannot modify order status or delete orders)
CREATE POLICY "Allow admin to manage all orders"
    ON public.gift_orders
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
