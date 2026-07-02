import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('hb_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('hb_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (gift, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.gift_id === gift.gift_id);
      if (existing) {
        return prev.map(item =>
          item.gift_id === gift.gift_id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        gift_id: gift.gift_id,
        gift_name: gift.gift_name,
        gift_price: parseFloat(gift.gift_price),
        gift_image: gift.gift_image,
        quantity
      }];
    });
  };

  const removeFromCart = (giftId) => {
    setCart(prev => prev.filter(item => item.gift_id !== giftId));
  };

  const updateQuantity = (giftId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(giftId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.gift_id === giftId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.gift_price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
