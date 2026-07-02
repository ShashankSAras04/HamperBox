-- ==========================================
-- Triggers for HamperBox Database
-- ==========================================

-- 1. Trigger Function to Update the updated_at Timestamp
CREATE OR REPLACE FUNCTION public.handle_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp update trigger to categories
CREATE OR REPLACE TRIGGER update_categories_timestamp
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_update_timestamp();

-- Apply timestamp update trigger to gifts
CREATE OR REPLACE TRIGGER update_gifts_timestamp
    BEFORE UPDATE ON public.gifts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_update_timestamp();

-- Apply timestamp update trigger to gift_items
CREATE OR REPLACE TRIGGER update_gift_items_timestamp
    BEFORE UPDATE ON public.gift_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_update_timestamp();

-- Apply timestamp update trigger to gift_orders
CREATE OR REPLACE TRIGGER update_gift_orders_timestamp
    BEFORE UPDATE ON public.gift_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_update_timestamp();


-- 2. Trigger Function to Sync Supabase Auth Users to public.users
-- This runs with SECURITY DEFINER to bypass RLS policies during creation.
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

-- Trigger to execute on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
