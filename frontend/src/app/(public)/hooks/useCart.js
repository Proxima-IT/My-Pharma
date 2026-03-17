'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  addToCartApi,
  updateCartItemApi,
  removeFromCartApi,
  placeOrderApi,
  applyCartCouponApi,
  removeCartCouponApi,
} from '../api/cartApi';
import { useCartContext } from '../context/CartContext';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';

/**
 * useCart Hook
 * Updated: Switched to stateful server-side coupon management.
 * Logic: For authenticated users, the backend persists the coupon and returns a pre-calculated summary.
 */
export const useCart = () => {
  const { cart, refreshCart, isLoading: contextLoading } = useCartContext();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
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
        await addToCartApi(
          token,
          product.id,
          quantity,
          product.selected_dosage,
        );
      } else {
        const guestCart = getGuestCart();
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
            selected_dosage: product.selected_dosage,
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
      const currentItem = cart?.items?.find(i => i.id === itemId);
      await updateCartItemApi(token, itemId, newQuantity, currentItem?.dosage);
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
      setError(err.message);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Apply Coupon via Stateful Backend Endpoint
   */
  const applyCoupon = async code => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Please login to use coupons.');
      return false;
    }
    setIsApplyingCoupon(true);
    setError(null);
    try {
      await applyCartCouponApi(token, code);
      // Refresh the cart to get the new discounted prices and summary from backend
      await refreshCart(null, false);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  /**
   * Remove Coupon via Stateful Backend Endpoint
   */
  const removeCoupon = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setIsUpdating(true);
    try {
      await removeCartCouponApi(token);
      await refreshCart(null, false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  /**
   * Computed Summary
   * For Auth Users: Uses backend summary (subtotal_before_discount, discount_amount, total_payable).
   * For Guests: Uses local calculation.
   */
  const summary = useMemo(() => {
    if (token) {
      const s = cart?.summary;
      if (!s) return null;

      return {
        ...s,
        // Map backend fields to frontend expected keys
        sub_total: parseFloat(s.subtotal_before_discount || s.subtotal || 0),
        discount_amount: parseFloat(s.discount_amount || 0),
        shipping_charge: parseFloat(s.shipping_charge || s.delivery_fee || 150),
        total_amount: parseFloat(s.total_payable || s.total_amount || 0),
        coupon_code: s.coupon_code || null,
      };
    }
    return guestSummary;
  }, [cart?.summary, guestSummary, token]);

  return {
    cart,
    items: token ? cart?.items || [] : guestItems,
    summary,
    isLoading: contextLoading,
    isUpdating,
    isApplyingCoupon,
    appliedCoupon: summary?.coupon_code ? { code: summary.coupon_code } : null,
    error,
    refresh: refreshCart,
    addItem,
    updateQuantity,
    removeItem,
    placeOrder,
    applyCoupon,
    removeCoupon,
  };
};
