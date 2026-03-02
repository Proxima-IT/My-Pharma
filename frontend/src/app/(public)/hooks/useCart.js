'use client';

import { useState, useCallback } from 'react';
import {
  addToCartApi,
  updateCartItemApi,
  removeFromCartApi,
  placeOrderApi,
} from '../api/cartApi';
import { useCartContext } from '../context/CartContext';

export const useCart = () => {
  // Access global state and the new silent refresh from context
  const { cart, refreshCart, isLoading } = useCartContext();

  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // 1. Add Item to Cart
  const addItem = async (productId, quantity = 1) => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Please login to add items to cart');

      await addToCartApi(token, productId, quantity);

      // FIXED: Instead of setting state with partial data,
      // we trigger a silent refresh to get the full updated cart.
      await refreshCart(null, false);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // 2. Update Item Quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await updateCartItemApi(token, itemId, newQuantity);

      // FIXED: Trigger silent refresh to sync the full cart and summary
      await refreshCart(null, false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // 3. Remove Item from Cart
  const removeItem = async itemId => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await removeFromCartApi(token, itemId);

      // Re-fetch full cart to update summary and badge
      await refreshCart(null, false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // 4. Place Order
  const placeOrder = async orderData => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const result = await placeOrderApi(token, orderData);

      // Re-fetch to clear/update cart state globally after order
      await refreshCart(null, true);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    cart,
    items: cart?.items || [],
    summary: cart?.summary || null,
    isLoading,
    isUpdating,
    error,
    refresh: refreshCart,
    addItem,
    updateQuantity,
    removeItem,
    placeOrder,
  };
};
