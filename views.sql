-- ==========================================
-- Admin Panel Analytical Views
-- ==========================================

-- 1. View: Admin Dashboard Stats
-- Provides real-time aggregates for the main dashboard metrics
CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
SELECT
    (SELECT COALESCE(SUM(total_amount), 0) FROM public.gift_orders WHERE order_status != 'Cancelled') AS total_revenue,
    (SELECT COUNT(*) FROM public.gift_orders) AS total_orders,
    (SELECT COUNT(*) FROM public.gift_orders WHERE order_status = 'Pending') AS pending_orders,
    (SELECT COUNT(*) FROM public.gifts WHERE status = 'active') AS active_gifts_count,
    (SELECT COUNT(*) FROM public.users WHERE is_admin = FALSE) AS total_customers_count;


-- 2. View: Detailed Orders List
-- Combines order, user, address, and gift details for the orders management table
CREATE OR REPLACE VIEW public.admin_order_details AS
SELECT
    o.order_id,
    o.quantity,
    o.total_amount,
    o.order_status,
    o.created_at AS order_date,
    o.updated_at AS order_updated_date,
    
    -- User details
    u.user_id,
    u.full_name AS customer_name,
    u.email AS customer_email,
    u.phone_number AS customer_phone,
    
    -- Recipient details and address
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
    
    -- Gift details
    g.gift_id,
    g.gift_name,
    g.gift_price,
    g.gift_image
FROM public.gift_orders o
LEFT JOIN public.users u ON o.user_id = u.user_id
LEFT JOIN public.addresses a ON o.address_id = a.address_id
LEFT JOIN public.gifts g ON o.gift_id = g.gift_id;


-- 3. View: Gift Inventory Details
-- Details each gift, its category name, and summarizes its internal gift items
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
