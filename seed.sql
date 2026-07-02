-- ==========================================
-- HamperBox Seed Data
-- ==========================================

-- 1. Create standard users in Supabase auth.users schema
-- This triggers the handle_new_user trigger which creates public.users rows.
INSERT INTO auth.users (id, email, raw_user_meta_data, email_confirmed_at)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'admin@hamperbox.com', '{"full_name": "Jane Admin"}', NOW()),
    ('c0000000-0000-0000-0000-000000000002', 'customer1@gmail.com', '{"full_name": "Rahul Sharma"}', NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Elevate admin user's role in the public schema
UPDATE public.users 
SET is_admin = TRUE 
WHERE email = 'admin@hamperbox.com';

-- 3. Populate Categories
-- Assign fixed UUIDs to simplify referencing in downstream inserts
INSERT INTO public.categories (category_id, category_name, category_description, category_image)
VALUES
    ('e1111111-1111-1111-1111-111111111111', 'Gourmet & Chocolates', 'Exquisite hampers filled with artisanal chocolates, premium nuts, and gourmet treats.', 'https://images.unsplash.com/photo-1549007994-cb92ca8a3bd0?auto=format&fit=crop&q=80&w=400'),
    ('e2222222-2222-2222-2222-222222222222', 'Self Care & Spa', 'Luxurious spa, wellness, and self-care gift boxes for home relaxation.', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=400'),
    ('e3333333-3333-3333-3333-333333333333', 'Corporate Gifts', 'Sophisticated desk accessories, journals, and tech items for professionals.', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400')
ON CONFLICT (category_name) DO NOTHING;

-- 4. Populate Gifts
INSERT INTO public.gifts (gift_id, category_id, gift_name, gift_description, gift_price, gift_image, status)
VALUES
    -- Gourmet gifts
    ('f1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'The Sweet Delight Hamper', 'A chocolate lover''s dream. Premium hand-crafted dark chocolates, roasted almonds, and wildflower honey.', 2450.00, 'https://images.unsplash.com/photo-1548907040-4d42b3228b90?auto=format&fit=crop&q=80&w=600', 'active'),
    ('f1111111-1111-1111-1111-111111111112', 'e1111111-1111-1111-1111-111111111111', 'Artisanal Coffee & Cookies', 'Freshly roasted single-origin coffee beans accompanied by organic oat cookies.', 1890.00, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600', 'active'),
    
    -- Spa gifts
    ('f2222222-2222-2222-2222-222222222221', 'e2222222-2222-2222-2222-222222222222', 'The Lavender Serenity Box', 'Unwind with organic lavender essential oils, bath salts, and a hand-poured soy candle.', 2999.00, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600', 'active'),
    
    -- Corporate gifts
    ('f3333333-3333-3333-3333-333333333331', 'e3333333-3333-3333-3333-333333333333', 'Executive Desk Essentials', 'Perfect welcome gift for executives. Includes a leather organizer, a brass pen, and an insulated tumbler.', 3500.00, 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=600', 'active'),
    ('f3333333-3333-3333-3333-333333333332', 'e3333333-3333-3333-3333-333333333333', 'Premium Office Box (Discontinued)', 'Older model of office starter kit.', 4200.00, NULL, 'inactive')
ON CONFLICT (gift_id) DO NOTHING;

-- 5. Populate Gift Items
INSERT INTO public.gift_items (item_id, gift_id, item_name, item_description, quantity)
VALUES
    -- Items for Sweet Delight Hamper
    ('a1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', '70% Dark Chocolate Bar', 'Artisanal single-origin dark chocolate bar (80g)', 2),
    ('a1111111-1111-1111-1111-111111111112', 'f1111111-1111-1111-1111-111111111111', 'Roasted Salted Almonds', 'Jar of lightly salted, dry roasted almonds (150g)', 1),
    ('a1111111-1111-1111-1111-111111111113', 'f1111111-1111-1111-1111-111111111111', 'Wildflower Organic Honey', 'Pure wildflower honey glass bottle (200g)', 1),

    -- Items for Coffee & Cookies
    ('a1111111-1111-1111-1111-111111111121', 'f1111111-1111-1111-1111-111111111112', 'Arabica Medium Roast Beans', '100% Arabica medium roast coffee bag (250g)', 1),
    ('a1111111-1111-1111-1111-111111111122', 'f1111111-1111-1111-1111-111111111112', 'Chocochip Oatmeal Cookies', 'Box of freshly baked gluten-free cookies', 1),

    -- Items for Lavender Serenity Box
    ('a2222222-2222-2222-2222-222222222211', 'f2222222-2222-2222-2222-222222222221', 'Lavender Essential Oil', 'Pure steam-distilled lavender oil bottle (15ml)', 1),
    ('a2222222-2222-2222-2222-222222222212', 'f2222222-2222-2222-2222-222222222221', 'Scented Soy Wax Candle', 'Hand-poured lavender scented jar candle', 1),
    ('a2222222-2222-2222-2222-222222222213', 'f2222222-2222-2222-2222-222222222221', 'Himalayan Pink Bath Salts', 'Relaxing bath soak crystals jar (250g)', 1),

    -- Items for Executive Desk Essentials
    ('a3333333-3333-3333-3333-333333333311', 'f3333333-3333-3333-3333-333333333331', 'Genuine Leather Planner', 'A5 refillable leather ring binder diary', 1),
    ('a3333333-3333-3333-3333-333333333312', 'f3333333-3333-3333-3333-333333333331', 'Signature Brass Ballpoint Pen', 'Heavyweight brass pen with black ink', 1),
    ('a3333333-3333-3333-3333-333333333313', 'f3333333-3333-3333-3333-333333333331', 'Matte Black Travel Mug', 'Double-walled stainless steel insulated coffee tumbler', 1)
ON CONFLICT (item_id) DO NOTHING;

-- 6. Populate Addresses (Customer's shipping list)
INSERT INTO public.addresses (address_id, user_id, recipient_name, phone_number, address_line1, address_line2, city, state, pincode, country)
VALUES
    ('91111111-1111-1111-1111-111111111111', 'c0000000-0000-0000-0000-000000000002', 'Aditi Sharma', '+91 9876543210', 'Flat 402, Sunshine Apartments', 'Jubilee Hills Road No. 36', 'Hyderabad', 'Telangana', '500033', 'India'),
    ('92222222-2222-2222-2222-222222222222', 'c0000000-0000-0000-0000-000000000002', 'Rohan Sharma', '+91 9123456789', 'House 14, Sector 15', 'Near Market Square', 'Gurugram', 'Haryana', '122001', 'India')
ON CONFLICT (address_id) DO NOTHING;

-- 7. Populate Orders
INSERT INTO public.gift_orders (order_id, user_id, gift_id, address_id, quantity, order_status, total_amount, created_at)
VALUES
    -- Rahul ordering Sweet Delight Hamper to Aditi in Hyderabad
    ('81111111-1111-1111-1111-111111111111', 'c0000000-0000-0000-0000-000000000002', 'f1111111-1111-1111-1111-111111111111', '91111111-1111-1111-1111-111111111111', 1, 'Delivered', 2450.00, NOW() - INTERVAL '10 days'),
    -- Rahul ordering Lavender Serenity Box to Rohan in Gurugram
    ('82222222-2222-2222-2222-222222222222', 'c0000000-0000-0000-0000-000000000002', 'f2222222-2222-2222-2222-222222222221', '92222222-2222-2222-2222-222222222222', 2, 'Pending', 5998.00, NOW() - INTERVAL '2 hours')
ON CONFLICT (order_id) DO NOTHING;
