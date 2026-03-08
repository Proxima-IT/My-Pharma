'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  addToCartApi,
  updateCartItemApi,
  removeFromCartApi,
  placeOrderApi,
} from '../api/cartApi';
import { useCartContext } from '../context/CartContext';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';

export const useCart = () => {
  const { cart, refreshCart, isLoading: contextLoading } = useCartContext();
  const [isUpdating, setIsUpdating] = useState(false);
  const [guestItems, setGuestItems] = useState([]);
  const [guestSummary, setGuestSummary] = useState(null);
  const [error, setError] = useState(null);

  const getGuestCart = () =>
    JSON.parse(localStorage.getItem('guest_cart') || '{"items": []}');

  const saveGuestCart = data => {
    localStorage.setItem('guest_cart', JSON.stringify(data));
    setGuestItems(data.items);
    calculateGuestSummary(data.items);
  };

  const calculateGuestSummary = items => {
    const subTotal = items.reduce(
      (acc, item) => acc + parseFloat(item.current_price || 0) * item.quantity,
      0,
    );
    const shipping = 150;

    setGuestSummary({
      sub_total: subTotal,
      total_amount: subTotal + shipping,
      shipping_charge: shipping,
      discount_amount: 0,
    });
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      const local = getGuestCart();
      setGuestItems(local.items || []);
      calculateGuestSummary(local.items || []);
    }
  }, [cart]);

  const addItem = async (product, quantity = 1) => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');

      if (token) {
        // Pass selected_dosage to the API
        await addToCartApi(
          token,
          product.id,
          quantity,
          product.selected_dosage,
        );
      } else {
        const guestCart = getGuestCart();
        // Check for existing item with SAME ID and SAME DOSAGE
        const existing = guestCart.items.find(
          i =>
            i.id === product.id &&
            i.selected_dosage === product.selected_dosage,
        );

        if (existing) {
          existing.quantity += quantity;
        } else {
          guestCart.items.push({
            id: product.id,
            product: product.slug,
            quantity: quantity,
            product_name: product.name,
            current_price: product.price,
            product_original_price: product.original_price,
            image_url: getMediaUrl(product.image),
            product_description: product.description,
            product_unit_label: product.unit_label,
            product_dosage: product.dosage,
            selected_dosage: product.selected_dosage, // Save the user's choice
            is_guest_item: true,
          });
        }
        saveGuestCart(guestCart);
      }

      await refreshCart(null, false);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    setIsUpdating(true);
    const token = localStorage.getItem('access_token');
    if (token) {
      await updateCartItemApi(token, itemId, newQuantity);
    } else {
      const guestCart = getGuestCart();
      const item = guestCart.items.find(i => i.id === itemId);
      if (item) item.quantity = newQuantity;
      saveGuestCart(guestCart);
    }
    await refreshCart(null, false);
    setIsUpdating(false);
  };

  const removeItem = async itemId => {
    setIsUpdating(true);
    const token = localStorage.getItem('access_token');
    if (token) {
      await removeFromCartApi(token, itemId);
    } else {
      const guestCart = getGuestCart();
      guestCart.items = guestCart.items.filter(i => i.id !== itemId);
      saveGuestCart(guestCart);
    }
    await refreshCart(null, false);
    setIsUpdating(false);
  };

  const placeOrder = async orderData => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    setIsUpdating(true);
    try {
      const result = await placeOrderApi(token, orderData);
      await refreshCart(null, true);
      return result;
    } catch (err) {
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  return {
    cart,
    items: token ? cart?.items || [] : guestItems,
    summary: token ? cart?.summary || null : guestSummary,
    isLoading: contextLoading,
    isUpdating,
    error,
    refresh: refreshCart,
    addItem,
    updateQuantity,
    removeItem,
    placeOrder,
  };
};
