'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { fetchCartApi } from '../api/cartApi';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const processCartResponse = data => {
    if (!data) return null;
    // Handle DRF Pagination { count, results: [] }
    if (data.results && Array.isArray(data.results))
      return data.results[0] || null;
    // Handle raw array []
    if (Array.isArray(data)) return data[0] || null;
    // Handle single object {}
    return data;
  };

  const refreshCart = useCallback(
    async (couponCode = null, showLoading = true) => {
      if (showLoading) setIsLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setCart(null);
          setIsLoading(false);
          return;
        }
        const params = couponCode ? { coupon_code: couponCode } : {};
        const data = await fetchCartApi(token, params);
        setCart(processCartResponse(data));
      } catch (err) {
        console.error('Cart refresh error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider
      value={{ cart, setCart, refreshCart, isLoading, processCartResponse }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context)
    throw new Error('useCartContext must be used within a CartProvider');
  return context;
};
