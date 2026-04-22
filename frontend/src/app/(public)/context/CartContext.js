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
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);

  // Initialize selectedDeliveryId from localStorage
  useEffect(() => {
    const savedId = localStorage.getItem('selected_delivery_id');
    if (savedId) setSelectedDeliveryId(savedId);
  }, []);

  const processCartResponse = data => {
    if (!data) return null;
    if (data.results && Array.isArray(data.results))
      return data.results[0] || null;
    if (Array.isArray(data)) return data[0] || null;
    return data;
  };

  const refreshCart = useCallback(
    async (couponCode = null, showLoading = true, deliveryId = null) => {
      if (showLoading) setIsLoading(true);
      try {
        const token = localStorage.getItem('access_token');

        if (!token) {
          // GUEST LOGIC: Load from LocalStorage
          const localCart = localStorage.getItem('guest_cart');
          setCart(
            localCart ? JSON.parse(localCart) : { items: [], is_guest: true },
          );
          setIsLoading(false);
          return;
        }

        // Priority: Passed deliveryId > State selectedDeliveryId
        const activeDeliveryId =
          deliveryId ||
          selectedDeliveryId ||
          localStorage.getItem('selected_delivery_id');

        const params = {};
        if (couponCode) params.coupon_code = couponCode;
        if (activeDeliveryId) params.delivery_duration_id = activeDeliveryId;

        const data = await fetchCartApi(token, params);
        setCart(processCartResponse(data));
      } catch (err) {
        console.error('Cart refresh error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedDeliveryId],
  );

  /**
   * Updates the selected delivery option and triggers a cart refresh
   * to get updated delivery fees and total payable.
   */
  const updateDeliveryOption = async id => {
    setSelectedDeliveryId(id);
    localStorage.setItem('selected_delivery_id', id);
    // Immediately refresh with the new ID to ensure summary updates
    await refreshCart(null, true, id);
  };

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        refreshCart,
        isLoading,
        processCartResponse,
        selectedDeliveryId,
        updateDeliveryOption,
      }}
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
