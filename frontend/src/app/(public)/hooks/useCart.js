'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  fetchCartApi,
  addToCartApi,
  updateCartItemApi,
  removeFromCartApi,
  placeOrderApi,
} from '../api/cartApi';

export const useCart = () => {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // 1. Load Cart Data
  const loadCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setCart(null);
        return;
      }
      const data = await fetchCartApi(token);
      // The API returns an array, we take the first active cart object
      setCart(Array.isArray(data) ? data[0] : data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Add Item to Cart
  const addItem = async (productId, quantity = 1) => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Please login to add items to cart');

      const updatedCart = await addToCartApi(token, productId, quantity);
      setCart(updatedCart);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // 3. Update Item Quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('access_token');
      const updatedCart = await updateCartItemApi(token, itemId, newQuantity);
      setCart(updatedCart);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // 4. Remove Item from Cart
  const removeItem = async itemId => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('access_token');
      await removeFromCartApi(token, itemId);
      // Refresh cart to get updated summary from backend
      await loadCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // 5. Place Order
  const placeOrder = async orderData => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('access_token');
      const result = await placeOrderApi(token, orderData);
      setCart(null); // Clear local cart state on success
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  return {
    cart,
    items: cart?.items || [],
    summary: cart?.summary || null,
    isLoading,
    isUpdating,
    error,
    refresh: loadCart,
    addItem,
    updateQuantity,
    removeItem,
    placeOrder,
  };
};
