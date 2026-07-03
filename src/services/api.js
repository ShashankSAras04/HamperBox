import { supabase, supabaseAdmin } from './supabase';

const IS_MOCK_MODE = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your-project-ref');

// Helper to load seed data into LocalStorage if not present
const initMockDB = () => {
  if (!localStorage.getItem('hb_categories')) {
    localStorage.setItem('hb_categories', JSON.stringify([
      {
        category_id: 'e1111111-1111-1111-1111-111111111111',
        category_name: 'Gourmet & Chocolates',
        category_description: 'Exquisite hampers filled with artisanal chocolates, premium nuts, and gourmet treats.',
        category_image: 'https://images.unsplash.com/photo-1549007994-cb92ca8a3bd0?auto=format&fit=crop&q=80&w=400',
        created_at: new Date().toISOString()
      },
      {
        category_id: 'e2222222-2222-2222-2222-222222222222',
        category_name: 'Self Care & Spa',
        category_description: 'Luxurious spa, wellness, and self-care gift boxes for home relaxation.',
        category_image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=400',
        created_at: new Date().toISOString()
      },
      {
        category_id: 'e3333333-3333-3333-3333-333333333333',
        category_name: 'Corporate Gifts',
        category_description: 'Sophisticated desk accessories, journals, and tech items for professionals.',
        category_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400',
        created_at: new Date().toISOString()
      }
    ]));
  }

  if (!localStorage.getItem('hb_gifts')) {
    localStorage.setItem('hb_gifts', JSON.stringify([
      {
        gift_id: 'f1111111-1111-1111-1111-111111111111',
        category_id: 'e1111111-1111-1111-1111-111111111111',
        gift_name: 'The Sweet Delight Hamper',
        gift_description: "A chocolate lover's dream. Premium hand-crafted dark chocolates, roasted almonds, and wildflower honey.",
        gift_price: 2450.00,
        gift_image: 'https://images.unsplash.com/photo-1548907040-4d42b3228b90?auto=format&fit=crop&q=80&w=600',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        gift_id: 'f1111111-1111-1111-1111-111111111112',
        category_id: 'e1111111-1111-1111-1111-111111111111',
        gift_name: 'Artisanal Coffee & Cookies',
        gift_description: 'Freshly roasted single-origin coffee beans accompanied by organic oat cookies.',
        gift_price: 1890.00,
        gift_image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        gift_id: 'f2222222-2222-2222-2222-222222222221',
        category_id: 'e2222222-2222-2222-2222-222222222222',
        gift_name: 'The Lavender Serenity Box',
        gift_description: 'Unwind with organic lavender essential oils, bath salts, and a hand-poured soy candle.',
        gift_price: 2999.00,
        gift_image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        gift_id: 'f3333333-3333-3333-3333-333333333331',
        category_id: 'e3333333-3333-3333-3333-333333333333',
        gift_name: 'Executive Desk Essentials',
        gift_description: 'Perfect welcome gift for executives. Includes a leather organizer, a brass pen, and an insulated tumbler.',
        gift_price: 3500.00,
        gift_image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=600',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        gift_id: 'f3333333-3333-3333-3333-333333333332',
        category_id: 'e3333333-3333-3333-3333-333333333333',
        gift_name: 'Premium Office Box (Discontinued)',
        gift_description: 'Older model of office starter kit.',
        gift_price: 4200.00,
        gift_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600',
        status: 'inactive',
        created_at: new Date().toISOString()
      }
    ]));
  }

  if (!localStorage.getItem('hb_gift_items')) {
    localStorage.setItem('hb_gift_items', JSON.stringify([
      { item_id: '1', gift_id: 'f1111111-1111-1111-1111-111111111111', item_name: '70% Dark Chocolate Bar', item_description: 'Artisanal single-origin dark chocolate bar (80g)', quantity: 2 },
      { item_id: '2', gift_id: 'f1111111-1111-1111-1111-111111111111', item_name: 'Roasted Salted Almonds', item_description: 'Jar of lightly salted, dry roasted almonds (150g)', quantity: 1 },
      { item_id: '3', gift_id: 'f1111111-1111-1111-1111-111111111111', item_name: 'Wildflower Organic Honey', item_description: 'Pure wildflower honey glass bottle (200g)', quantity: 1 },
      { item_id: '4', gift_id: 'f1111111-1111-1111-1111-111111111112', item_name: 'Arabica Medium Roast Beans', item_description: '100% Arabica medium roast coffee bag (250g)', quantity: 1 },
      { item_id: '5', gift_id: 'f1111111-1111-1111-1111-111111111112', item_name: 'Chocochip Oatmeal Cookies', item_description: 'Box of freshly baked gluten-free cookies', quantity: 1 },
      { item_id: '6', gift_id: 'f2222222-2222-2222-2222-222222222221', item_name: 'Lavender Essential Oil', item_description: 'Pure steam-distilled lavender oil bottle (15ml)', quantity: 1 },
      { item_id: '7', gift_id: 'f2222222-2222-2222-2222-222222222221', item_name: 'Scented Soy Wax Candle', item_description: 'Hand-poured lavender scented jar candle', quantity: 1 },
      { item_id: '8', gift_id: 'f2222222-2222-2222-2222-222222222221', item_name: 'Himalayan Pink Bath Salts', item_description: 'Relaxing bath soak crystals jar (250g)', quantity: 1 },
      { item_id: '9', gift_id: 'f3333333-3333-3333-3333-333333333331', item_name: 'Genuine Leather Planner', item_description: 'A5 refillable leather ring binder diary', quantity: 1 },
      { item_id: '10', gift_id: 'f3333333-3333-3333-3333-333333333331', item_name: 'Signature Brass Ballpoint Pen', item_description: 'Heavyweight brass pen with black ink', quantity: 1 },
      { item_id: '11', gift_id: 'f3333333-3333-3333-3333-333333333331', item_name: 'Matte Black Travel Mug', item_description: 'Double-walled stainless steel insulated coffee tumbler', quantity: 1 }
    ]));
  }

  if (!localStorage.getItem('hb_addresses')) {
    localStorage.setItem('hb_addresses', JSON.stringify([
      {
        address_id: '91111111-1111-1111-1111-111111111111',
        user_id: 'c0000000-0000-0000-0000-000000000002',
        recipient_name: 'Aditi Sharma',
        phone_number: '+91 9876543210',
        address_line1: 'Flat 402, Sunshine Apartments',
        address_line2: 'Jubilee Hills Road No. 36',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500033',
        country: 'India'
      }
    ]));
  }

  if (!localStorage.getItem('hb_orders')) {
    localStorage.setItem('hb_orders', JSON.stringify([
      {
        order_id: '81111111-1111-1111-1111-111111111111',
        user_id: 'c0000000-0000-0000-0000-000000000002',
        gift_id: 'f1111111-1111-1111-1111-111111111111',
        address_id: '91111111-1111-1111-1111-111111111111',
        quantity: 1,
        order_status: 'Delivered',
        total_amount: 2450.00,
        created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
      },
      {
        order_id: '82222222-2222-2222-2222-222222222222',
        user_id: 'c0000000-0000-0000-0000-000000000002',
        gift_id: 'f2222222-2222-2222-2222-222222222221',
        address_id: '91111111-1111-1111-1111-111111111111',
        quantity: 2,
        order_status: 'Pending',
        total_amount: 5998.00,
        created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
      }
    ]));
  }

  if (!localStorage.getItem('hb_users')) {
    localStorage.setItem('hb_users', JSON.stringify([
      {
        user_id: 'd0000000-0000-0000-0000-000000000001',
        email: 'admin@hamperbox.com',
        full_name: 'Jane Admin',
        phone_number: '+91 9999999999',
        is_admin: true,
        created_at: new Date().toISOString()
      },
      {
        user_id: 'c0000000-0000-0000-0000-000000000002',
        email: 'customer1@gmail.com',
        full_name: 'Rahul Sharma',
        phone_number: '+91 9876543210',
        is_admin: false,
        created_at: new Date().toISOString()
      }
    ]));
  }
};

initMockDB();

// Dynamic Getter helper
const getItems = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const setItems = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Subscribers for simulated real-time updates
const listeners = [];
export const subscribeToOrders = (callback) => {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
};

const notifyOrderChange = (payload) => {
  listeners.forEach(cb => cb(payload));
};

// ==========================================
// 1. CATEGORIES API
// ==========================================
export const api = {
  getCategories: async () => {
    if (!IS_MOCK_MODE) {
      const { data, error } = await supabase.from('categories').select('*').order('category_name');
      if (!error) return data;
    }
    return getItems('hb_categories').sort((a, b) => a.category_name.localeCompare(b.category_name));
  },

  createCategory: async (category) => {
    if (!IS_MOCK_MODE) {
      const { data, error } = await supabase.from('categories').insert([category]).select();
      if (error) throw error;
      return data[0];
    }
    const categories = getItems('hb_categories');
    const newCategory = {
      category_id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...category
    };
    categories.push(newCategory);
    setItems('hb_categories', categories);
    return newCategory;
  },

  updateCategory: async (id, category) => {
    if (!IS_MOCK_MODE) {
      const { data, error } = await supabase.from('categories').update(category).eq('category_id', id).select();
      if (error) throw error;
      return data[0];
    }
    const categories = getItems('hb_categories');
    const idx = categories.findIndex(c => c.category_id === id);
    if (idx !== -1) {
      categories[idx] = { ...categories[idx], ...category, updated_at: new Date().toISOString() };
      setItems('hb_categories', categories);
      return categories[idx];
    }
    throw new Error('Category not found');
  },

  deleteCategory: async (id) => {
    if (!IS_MOCK_MODE) {
      const { error } = await supabase.from('categories').delete().eq('category_id', id);
      if (error) throw error;
      return true;
    }
    let categories = getItems('hb_categories');
    categories = categories.filter(c => c.category_id !== id);
    setItems('hb_categories', categories);
    return true;
  },

  // ==========================================
  // 2. GIFTS API
  // ==========================================
  getGifts: async (activeOnly = false) => {
    if (!IS_MOCK_MODE) {
      let query = supabase.from('gifts').select('*, categories(category_name)');
      if (activeOnly) {
        query = query.eq('status', 'active');
      }
      const { data, error } = await query;
      if (!error) return data;
    }
    
    const gifts = getItems('hb_gifts');
    const categories = getItems('hb_categories');
    
    const mappedGifts = gifts.map(g => {
      const cat = categories.find(c => c.category_id === g.category_id);
      return {
        ...g,
        categories: cat ? { category_name: cat.category_name } : null
      };
    });
    
    return activeOnly ? mappedGifts.filter(g => g.status === 'active') : mappedGifts;
  },

  getGiftById: async (id) => {
    if (!IS_MOCK_MODE) {
      const { data, error } = await supabase.from('gifts').select('*, categories(category_name)').eq('gift_id', id).single();
      if (!error) return data;
    }
    const gifts = getItems('hb_gifts');
    const gift = gifts.find(g => g.gift_id === id);
    if (gift) {
      const categories = getItems('hb_categories');
      const cat = categories.find(c => c.category_id === gift.category_id);
      return {
        ...gift,
        categories: cat ? { category_name: cat.category_name } : null
      };
    }
    return null;
  },

  createGift: async (gift) => {
    if (!IS_MOCK_MODE) {
      const { data, error } = await supabase.from('gifts').insert([gift]).select();
      if (error) throw error;
      return data[0];
    }
    const gifts = getItems('hb_gifts');
    const newGift = {
      gift_id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...gift
    };
    gifts.push(newGift);
    setItems('hb_gifts', gifts);
    return newGift;
  },

  updateGift: async (id, gift) => {
    if (!IS_MOCK_MODE) {
      const { data, error } = await supabase.from('gifts').update(gift).eq('gift_id', id).select();
      if (error) throw error;
      return data[0];
    }
    const gifts = getItems('hb_gifts');
    const idx = gifts.findIndex(g => g.gift_id === id);
    if (idx !== -1) {
      gifts[idx] = { ...gifts[idx], ...gift, updated_at: new Date().toISOString() };
      setItems('hb_gifts', gifts);
      return gifts[idx];
    }
    throw new Error('Gift not found');
  },

  deleteGift: async (id) => {
    if (!IS_MOCK_MODE) {
      const { error } = await supabase.from('gifts').delete().eq('gift_id', id);
      if (error) throw error;
      return true;
    }
    let gifts = getItems('hb_gifts');
    gifts = gifts.filter(g => g.gift_id !== id);
    setItems('hb_gifts', gifts);
    return true;
  },

  // ==========================================
  // 3. GIFT ITEMS API (Sub-contents of hampers)
  // ==========================================
  getGiftItems: async (giftId) => {
    if (!IS_MOCK_MODE) {
      const { data, error } = await supabase.from('gift_items').select('*').eq('gift_id', giftId);
      if (!error) return data;
    }
    const items = getItems('hb_gift_items');
    return items.filter(item => item.gift_id === giftId);
  },

  createGiftItem: async (item) => {
    if (!IS_MOCK_MODE) {
      const { data, error } = await supabase.from('gift_items').insert([item]).select();
      if (error) throw error;
      return data[0];
    }
    const items = getItems('hb_gift_items');
    const newItem = {
      item_id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...item
    };
    items.push(newItem);
    setItems('hb_gift_items', items);
    return newItem;
  },

  updateGiftItem: async (id, item) => {
    if (!IS_MOCK_MODE) {
      const { data, error } = await supabase.from('gift_items').update(item).eq('item_id', id).select();
      if (error) throw error;
      return data[0];
    }
    const items = getItems('hb_gift_items');
    const idx = items.findIndex(i => i.item_id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...item, updated_at: new Date().toISOString() };
      setItems('hb_gift_items', items);
      return items[idx];
    }
    throw new Error('Item not found');
  },

  deleteGiftItem: async (id) => {
    if (!IS_MOCK_MODE) {
      const { error } = await supabase.from('gift_items').delete().eq('item_id', id);
      if (error) throw error;
      return true;
    }
    let items = getItems('hb_gift_items');
    items = items.filter(i => i.item_id !== id);
    setItems('hb_gift_items', items);
    return true;
  },

  setHamperContents: async (giftId, contentsList) => {
    if (!IS_MOCK_MODE) {
      // 1. Delete existing items
      const { error: delErr } = await supabase.from('gift_items').delete().eq('gift_id', giftId);
      if (delErr) throw delErr;

      // 2. Insert new items
      if (contentsList.length > 0) {
        const payload = contentsList.map(item => ({
          gift_id: giftId,
          item_name: item.item_name,
          item_description: item.item_description || '',
          quantity: item.quantity
        }));
        const { error: insErr } = await supabase.from('gift_items').insert(payload);
        if (insErr) throw insErr;
      }
      return true;
    } else {
      let items = getItems('hb_gift_items') || [];
      // Filter out existing
      items = items.filter(i => i.gift_id !== giftId);
      // Add new
      contentsList.forEach(item => {
        items.push({
          item_id: crypto.randomUUID(),
          gift_id: giftId,
          item_name: item.item_name,
          item_description: item.item_description || '',
          quantity: item.quantity,
          created_at: new Date().toISOString()
        });
      });
      setItems('hb_gift_items', items);
      return true;
    }
  },

  // ==========================================
  // 4. ORDERS & CHECKOUT API
  // ==========================================
  getOrders: async (userId = null) => {
    if (!IS_MOCK_MODE) {
      let query = supabase.from('gift_orders').select(`
        *,
        gifts(gift_name, gift_price, gift_image),
        addresses(*),
        users(full_name, email, phone_number)
      `).order('created_at', { ascending: false });
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
      if (!error) return data;
    }

    const orders = getItems('hb_orders');
    const gifts = getItems('hb_gifts');
    const addresses = getItems('hb_addresses');
    const users = getItems('hb_users');

    const detailedOrders = orders.map(o => {
      const gift = gifts.find(g => g.gift_id === o.gift_id);
      const addr = addresses.find(a => a.address_id === o.address_id);
      const usr = users.find(u => u.user_id === o.user_id);
      
      return {
        ...o,
        gifts: gift ? { gift_name: gift.gift_name, gift_price: gift.gift_price, gift_image: gift.gift_image } : null,
        addresses: addr || null,
        users: usr ? { full_name: usr.full_name, email: usr.email, phone_number: usr.phone_number } : null
      };
    });

    const filtered = userId ? detailedOrders.filter(o => o.user_id === userId) : detailedOrders;
    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  getOrdersByPhone: async (phone) => {
    if (!IS_MOCK_MODE) {
      // 1. Fetch addresses matching phone
      const { data: addrData, error: addrErr } = await supabase
        .from('addresses')
        .select('address_id')
        .eq('phone_number', phone);
        
      if (addrErr || !addrData || addrData.length === 0) return [];
      const addressIds = addrData.map(a => a.address_id);

      // 2. Fetch orders matching those address IDs
      const { data: orderData, error: orderErr } = await supabase
        .from('gift_orders')
        .select(`
          *,
          gifts(gift_name, gift_price, gift_image),
          addresses(*),
          users(full_name, email, phone_number)
        `)
        .in('address_id', addressIds)
        .order('created_at', { ascending: false });

      if (orderErr) throw orderErr;
      return orderData;
    } else {
      const orders = getItems('hb_orders');
      const gifts = getItems('hb_gifts');
      const addresses = getItems('hb_addresses');
      const users = getItems('hb_users');

      const detailedOrders = orders.map(o => {
        const gift = gifts.find(g => g.gift_id === o.gift_id);
        const addr = addresses.find(a => a.address_id === o.address_id);
        const usr = users.find(u => u.user_id === o.user_id);
        
        return {
          ...o,
          gifts: gift ? { gift_name: gift.gift_name, gift_price: gift.gift_price, gift_image: gift.gift_image } : null,
          addresses: addr || null,
          users: usr ? { full_name: usr.full_name, email: usr.email, phone_number: usr.phone_number } : null
        };
      });

      const filtered = detailedOrders.filter(o => o.addresses?.phone_number === phone);
      return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  },

  createOrder: async (orderPayload) => {
    // orderPayload format: { user_id, gift_id, address, quantity, total_amount }
    const { address, ...orderData } = orderPayload;
    
    let finalAddressId;
    if (address.address_id) {
      finalAddressId = address.address_id;
    } else {
      // Build address payload — omit user_id entirely if null so FK is not violated
      const addrPayload = { ...address };
      if (orderData.user_id) {
        addrPayload.user_id = orderData.user_id;
      }
      const savedAddr = await api.createAddress(addrPayload);
      finalAddressId = savedAddr.address_id;
    }

    // Build order row — omit user_id entirely when null to avoid FK violation
    const orderRow = {
      gift_id: orderData.gift_id,
      address_id: finalAddressId,
      quantity: orderData.quantity || 1,
      total_amount: orderData.total_amount,
      order_status: 'Pending'
    };
    if (orderData.user_id) {
      orderRow.user_id = orderData.user_id;
    }

    if (!IS_MOCK_MODE) {
      // Use supabaseAdmin to bypass RLS — guest checkouts have no auth session
      const { data, error } = await supabaseAdmin.from('gift_orders').insert([orderRow]).select();
      if (error) throw error;
      return data[0];
    }

    const orders = getItems('hb_orders');
    const newOrder = {
      order_id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...orderRow
    };
    orders.push(newOrder);
    setItems('hb_orders', orders);

    // Notify real-time subscribers
    setTimeout(() => {
      const gifts = getItems('hb_gifts');
      const users = getItems('hb_users');
      const gift = gifts.find(g => g.gift_id === newOrder.gift_id);
      const usr = users.find(u => u.user_id === newOrder.user_id);
      
      notifyOrderChange({
        type: 'INSERT',
        new: {
          ...newOrder,
          gifts: gift ? { gift_name: gift.gift_name, gift_price: gift.gift_price, gift_image: gift.gift_image } : null,
          users: usr ? { full_name: usr.full_name, email: usr.email, phone_number: usr.phone_number } : null
        }
      });
    }, 500);

    return newOrder;
  },

  updateOrderStatus: async (id, status) => {
    if (!IS_MOCK_MODE) {
      const { data, error } = await supabase.from('gift_orders').update({ order_status: status }).eq('order_id', id).select();
      if (error) throw error;
      return data[0];
    }
    const orders = getItems('hb_orders');
    const idx = orders.findIndex(o => o.order_id === id);
    if (idx !== -1) {
      orders[idx].order_status = status;
      orders[idx].updated_at = new Date().toISOString();
      setItems('hb_orders', orders);

      // Trigger listener
      setTimeout(() => {
        notifyOrderChange({
          type: 'UPDATE',
          new: orders[idx]
        });
      }, 200);

      return orders[idx];
    }
    throw new Error('Order not found');
  },

  // ==========================================
  // 5. ADDRESSES API
  // ==========================================
  getAddresses: async (userId) => {
    if (!IS_MOCK_MODE) {
      const { data, error } = await supabase.from('addresses').select('*').eq('user_id', userId);
      if (!error) return data;
    }
    const addresses = getItems('hb_addresses');
    return addresses.filter(a => a.user_id === userId);
  },

  createAddress: async (address) => {
    if (!IS_MOCK_MODE) {
      // Strip any null/undefined user_id before inserting to avoid FK violation
      const cleanAddr = { ...address };
      if (!cleanAddr.user_id) delete cleanAddr.user_id;
      // Use supabaseAdmin to bypass RLS — guest checkouts have no auth session
      const { data, error } = await supabaseAdmin.from('addresses').insert([cleanAddr]).select();
      if (error) throw error;
      return data[0];
    }
    const addresses = getItems('hb_addresses');
    const newAddress = {
      address_id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...address
    };
    addresses.push(newAddress);
    setItems('hb_addresses', addresses);
    return newAddress;
  },

  deleteAddress: async (id) => {
    if (!IS_MOCK_MODE) {
      const { error } = await supabase.from('addresses').delete().eq('address_id', id);
      if (error) throw error;
      return true;
    }
    let addresses = getItems('hb_addresses');
    addresses = addresses.filter(a => a.address_id !== id);
    setItems('hb_addresses', addresses);
    return true;
  },

  // ==========================================
  // 6. USERS & PROFILES API
  // ==========================================
  getUsers: async () => {
    if (!IS_MOCK_MODE) {
      const { data, error } = await supabase.from('users').select('*');
      if (!error) return data;
    }
    return getItems('hb_users');
  },

  getUserProfile: async (userId) => {
    if (!IS_MOCK_MODE) {
      const { data, error } = await supabase.from('users').select('*').eq('user_id', userId).single();
      if (!error) return data;
    }
    const users = getItems('hb_users');
    return users.find(u => u.user_id === userId) || null;
  },

  updateUserProfile: async (userId, profileData) => {
    if (!IS_MOCK_MODE) {
      const { data, error } = await supabase.from('users').update(profileData).eq('user_id', userId).select();
      if (error) throw error;
      return data[0];
    }
    const users = getItems('hb_users');
    const idx = users.findIndex(u => u.user_id === userId);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...profileData };
      setItems('hb_users', users);
      return users[idx];
    }
    throw new Error('User not found');
  },

  createAdminUser: async (adminData) => {
    if (!IS_MOCK_MODE) {
      // 1. Create the user cleanly in Auth using the service role admin client
      const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email: adminData.email,
        password: adminData.password,
        email_confirm: true, // auto confirms the email (no OTP required!)
        user_metadata: {
          full_name: adminData.full_name,
          phone: adminData.phone_number || ''
        }
      });
      if (authErr) throw authErr;

      // 2. Elevate that profile to admin in the public table
      const { data: dbData, error: dbErr } = await supabase
        .from('users')
        .update({ is_admin: true, full_name: adminData.full_name, phone_number: adminData.phone_number || '' })
        .eq('user_id', authData.user.id)
        .select();

      if (dbErr) {
        // Fallback upsert if trigger delayed
        const { data: insData, error: insErr } = await supabase
          .from('users')
          .upsert({
            user_id: authData.user.id,
            email: adminData.email,
            full_name: adminData.full_name,
            phone_number: adminData.phone_number || '',
            is_admin: true
          })
          .select();
        if (insErr) throw insErr;
        return insData[0];
      }
      return dbData[0];
    } else {
      const users = getItems('hb_users');
      if (users.find(u => u.email.toLowerCase() === adminData.email.toLowerCase())) {
        throw new Error('User with this email already exists.');
      }
      const newAdmin = {
        user_id: crypto.randomUUID(),
        email: adminData.email,
        full_name: adminData.full_name,
        phone_number: adminData.phone_number || '',
        is_admin: true,
        created_at: new Date().toISOString()
      };
      users.push(newAdmin);
      setItems('hb_users', users);
      return newAdmin;
    }
  },

  // ==========================================
  // 7. SITE SETTINGS & BANNERS API
  // ==========================================
  getSiteSettings: async () => {
    if (!IS_MOCK_MODE) {
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
      if (!error && data) return data;
    }
    
    // Fallback/Mock
    let settings = getItems('hb_settings');
    if (!settings || Object.keys(settings).length === 0) {
      settings = {
        id: 1,
        whatsapp_number: '+919620000000',
        instagram_url: 'https://instagram.com',
        facebook_url: 'https://facebook.com'
      };
      setItems('hb_settings', settings);
    }
    return settings;
  },

  updateSiteSettings: async (settingsData) => {
    if (!IS_MOCK_MODE) {
      const { data, error } = await supabase.from('site_settings').update(settingsData).eq('id', 1).select();
      if (!error && data) return data[0];
    }
    
    const settings = { ...getItems('hb_settings'), ...settingsData };
    setItems('hb_settings', settings);
    return settings;
  },

  getBanners: async () => {
    if (!IS_MOCK_MODE) {
      const { data, error } = await supabase.from('banners').select('*').order('created_at', { ascending: true });
      if (!error) return data;
    }
    
    let banners = getItems('hb_banners');
    if (!banners || banners.length === 0) {
      banners = [
        {
          banner_id: 'b1',
          image_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=1200',
          layout_position: 'hero',
          link_url: '/gifts'
        }
      ];
      setItems('hb_banners', banners);
    }
    return banners;
  },

  createBanner: async (banner) => {
    if (!IS_MOCK_MODE) {
      const { data, error } = await supabase.from('banners').insert([banner]).select();
      if (error) throw error;
      return data[0];
    }
    
    const banners = getItems('hb_banners') || [];
    const newBanner = {
      banner_id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...banner
    };
    banners.push(newBanner);
    setItems('hb_banners', banners);
    return newBanner;
  },

  deleteBanner: async (id) => {
    if (!IS_MOCK_MODE) {
      const { error } = await supabase.from('banners').delete().eq('banner_id', id);
      if (error) throw error;
      return true;
    }
    
    let banners = getItems('hb_banners') || [];
    banners = banners.filter(b => b.banner_id !== id);
    setItems('hb_banners', banners);
    return true;
  },

  // ==========================================
  // 8. COUPONS & PROMOCODES API
  // ==========================================
  getCoupons: async () => {
    if (!IS_MOCK_MODE) {
      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (!error) return data;
    }
    
    let coupons = getItems('hb_coupons');
    if (!coupons || coupons.length === 0) {
      coupons = [
        {
          coupon_id: 'c1',
          code: 'WELCOME10',
          discount_type: 'percentage',
          discount_value: 10.00,
          is_active: true
        }
      ];
      setItems('hb_coupons', coupons);
    }
    return coupons;
  },

  createCoupon: async (coupon) => {
    if (!IS_MOCK_MODE) {
      const { data, error } = await supabase.from('coupons').insert([coupon]).select();
      if (error) throw error;
      return data[0];
    }
    
    const coupons = getItems('hb_coupons') || [];
    const newCoupon = {
      coupon_id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...coupon
    };
    coupons.push(newCoupon);
    setItems('hb_coupons', coupons);
    return newCoupon;
  },

  updateCoupon: async (id, couponData) => {
    if (!IS_MOCK_MODE) {
      const { data, error } = await supabase.from('coupons').update(couponData).eq('coupon_id', id).select();
      if (error) throw error;
      return data[0];
    }
    
    const coupons = getItems('hb_coupons') || [];
    const idx = coupons.findIndex(c => c.coupon_id === id);
    if (idx !== -1) {
      coupons[idx] = { ...coupons[idx], ...couponData };
      setItems('hb_coupons', coupons);
      return coupons[idx];
    }
    throw new Error('Coupon not found');
  },

  deleteCoupon: async (id) => {
    if (!IS_MOCK_MODE) {
      const { error } = await supabase.from('coupons').delete().eq('coupon_id', id);
      if (error) throw error;
      return true;
    }
    
    let coupons = getItems('hb_coupons') || [];
    coupons = coupons.filter(c => c.coupon_id !== id);
    setItems('hb_coupons', coupons);
    return true;
  },

  validateCoupon: async (code) => {
    if (!IS_MOCK_MODE) {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();
      if (!error && data) return data;
      return null;
    }
    
    const coupons = getItems('hb_coupons') || [];
    return coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.is_active) || null;
  },

  // ==========================================
  // 9. UPI IDs MANAGEMENT API
  // ==========================================
  getUpiIds: async () => {
    if (!IS_MOCK_MODE) {
      try {
        const { data, error } = await supabase.from('upi_ids').select('*').order('created_at', { ascending: true });
        if (!error && data) return data;
      } catch (e) {
        console.warn('upi_ids table not found, falling back to local storage:', e.message);
      }
    }
    let upiIds = getItems('hb_upi_ids');
    if (!upiIds || upiIds.length === 0) {
      upiIds = [];
      setItems('hb_upi_ids', upiIds);
    }
    return upiIds;
  },

  createUpiId: async (upiData) => {
    if (!IS_MOCK_MODE) {
      try {
        const { data, error } = await supabase.from('upi_ids').insert([upiData]).select();
        if (!error && data) return data[0];
        // If table doesn't exist, fall through to local storage
        if (error && !error.message?.includes('schema')) throw error;
      } catch (e) {
        if (e.message?.includes('schema')) {
          console.warn('upi_ids table not found, using local storage');
        } else {
          throw e;
        }
      }
    }
    const upiIds = getItems('hb_upi_ids') || [];
    if (upiIds.find(u => u.upi_address.toLowerCase() === upiData.upi_address.toLowerCase())) {
      throw new Error('UPI ID already exists');
    }
    // If marking as default, clear others
    if (upiData.is_default) {
      upiIds.forEach(u => u.is_default = false);
    }
    const newUpi = {
      upi_id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...upiData
    };
    upiIds.push(newUpi);
    setItems('hb_upi_ids', upiIds);
    return newUpi;
  },

  updateUpiId: async (id, upiData) => {
    if (!IS_MOCK_MODE) {
      try {
        // If setting as default, clear others first
        if (upiData.is_default) {
          await supabase.from('upi_ids').update({ is_default: false }).neq('upi_id', id);
        }
        const { data, error } = await supabase.from('upi_ids').update(upiData).eq('upi_id', id).select();
        if (!error && data) return data[0];
        if (error && !error.message?.includes('schema')) throw error;
      } catch (e) {
        if (e.message?.includes('schema')) {
          console.warn('upi_ids table not found, using local storage');
        } else {
          throw e;
        }
      }
    }
    const upiIds = getItems('hb_upi_ids') || [];
    if (upiData.is_default) {
      upiIds.forEach(u => u.is_default = false);
    }
    const idx = upiIds.findIndex(u => u.upi_id === id);
    if (idx !== -1) {
      upiIds[idx] = { ...upiIds[idx], ...upiData };
      setItems('hb_upi_ids', upiIds);
      return upiIds[idx];
    }
    throw new Error('UPI ID not found');
  },

  deleteUpiId: async (id) => {
    if (!IS_MOCK_MODE) {
      try {
        const { error } = await supabase.from('upi_ids').delete().eq('upi_id', id);
        if (!error) return true;
        if (error && !error.message?.includes('schema')) throw error;
      } catch (e) {
        if (e.message?.includes('schema')) {
          console.warn('upi_ids table not found, using local storage');
        } else {
          throw e;
        }
      }
    }
    let upiIds = getItems('hb_upi_ids') || [];
    upiIds = upiIds.filter(u => u.upi_id !== id);
    setItems('hb_upi_ids', upiIds);
    return true;
  },

  // ==========================================
  // 10. ORDER UPI TRACKING & REF SEARCH
  // ==========================================
  updateOrderUpi: async (orderId, upiAddress) => {
    if (!IS_MOCK_MODE) {
      try {
        // Check if UPI is locked
        const { data: orderCheck } = await supabase.from('gift_orders').select('upi_locked').eq('order_id', orderId).single();
        if (orderCheck?.upi_locked) throw new Error('UPI is locked for this order');
        
        const { data, error } = await supabase.from('gift_orders').update({ selected_upi: upiAddress }).eq('order_id', orderId).select();
        if (!error && data) return data[0];
        // If columns don't exist yet, fall through to local storage
        if (error && !error.message?.includes('schema') && !error.message?.includes('column')) throw error;
      } catch (e) {
        if (e.message === 'UPI is locked for this order') throw e;
        console.warn('Order UPI update fell back to local storage:', e.message);
      }
    }
    const orders = getItems('hb_orders');
    const idx = orders.findIndex(o => o.order_id === orderId);
    if (idx !== -1) {
      if (orders[idx].upi_locked) throw new Error('UPI is locked for this order');
      orders[idx].selected_upi = upiAddress;
      orders[idx].updated_at = new Date().toISOString();
      setItems('hb_orders', orders);
      return orders[idx];
    }
    throw new Error('Order not found');
  },

  lockOrderUpi: async (orderId, upiAddress) => {
    if (!IS_MOCK_MODE) {
      try {
        const { data, error } = await supabase.from('gift_orders')
          .update({ selected_upi: upiAddress, upi_locked: true })
          .eq('order_id', orderId).select();
        if (!error && data) return data[0];
        // If columns don't exist yet, fall through to local storage
        if (error && !error.message?.includes('schema') && !error.message?.includes('column')) throw error;
      } catch (e) {
        console.warn('Order UPI lock fell back to local storage:', e.message);
      }
    }
    const orders = getItems('hb_orders');
    const idx = orders.findIndex(o => o.order_id === orderId);
    if (idx !== -1) {
      orders[idx].selected_upi = upiAddress;
      orders[idx].upi_locked = true;
      orders[idx].updated_at = new Date().toISOString();
      setItems('hb_orders', orders);
      return orders[idx];
    }
    throw new Error('Order not found');
  },

  getOrdersByRef: async (refCode) => {
    // refCode can be full "#HB-XXXXXXXX" or just the partial id
    const cleanRef = refCode.replace(/^#?HB-?/i, '').trim().toLowerCase();
    if (!cleanRef) return [];

    if (!IS_MOCK_MODE) {
      // Search using ILIKE on order_id prefix
      const { data, error } = await supabase
        .from('gift_orders')
        .select(`
          *,
          gifts(gift_name, gift_price, gift_image),
          addresses(*),
          users(full_name, email, phone_number)
        `)
        .ilike('order_id', `${cleanRef}%`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } else {
      const orders = getItems('hb_orders');
      const gifts = getItems('hb_gifts');
      const addresses = getItems('hb_addresses');
      const users = getItems('hb_users');

      const detailedOrders = orders.map(o => {
        const gift = gifts.find(g => g.gift_id === o.gift_id);
        const addr = addresses.find(a => a.address_id === o.address_id);
        const usr = users.find(u => u.user_id === o.user_id);
        
        return {
          ...o,
          gifts: gift ? { gift_name: gift.gift_name, gift_price: gift.gift_price, gift_image: gift.gift_image } : null,
          addresses: addr || null,
          users: usr ? { full_name: usr.full_name, email: usr.email, phone_number: usr.phone_number } : null
        };
      });

      const filtered = detailedOrders.filter(o => 
        o.order_id.toLowerCase().startsWith(cleanRef)
      );
      return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  }
};

