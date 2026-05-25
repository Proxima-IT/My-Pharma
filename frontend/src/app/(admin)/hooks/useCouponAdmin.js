'use client';

import { useState, useEffect, useCallback } from 'react';
import { couponAdminApi } from '../api/couponAdminApi';

/**
 * My Pharma - Super Admin Coupon Management Hook
 * Manages state and operations for discount codes.
 */
export const useCouponAdmin = () => {
  const [coupons, setCoupons] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
  });

  /**
   * Fetch paginated list of coupons
   */
  const fetchCoupons = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const data = await couponAdminApi.getCoupons(token, params);
      setCoupons({ results: data.results, count: data.count });
      setPagination({
        next: data.next,
        previous: data.previous,
      });
    } catch (err) {
      setError(err.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new coupon
   * @param {Object} couponData - JSON object matching backend schema
   */
  const addCoupon = async couponData => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Unauthorized: No token found');

      const newCoupon = await couponAdminApi.createCoupon(token, couponData);
      setCoupons(prev => ({
        ...prev,
        results: [newCoupon, ...prev.results],
        count: prev.count + 1,
      }));
      return newCoupon;
    } catch (err) {
      // Handle DRF validation error objects or generic messages
      const msg =
        err.detail ||
        (typeof err === 'object' ? 'Validation failed' : err.message);
      setError(msg);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Update existing coupon (Partial)
   */
  const updateCoupon = async (id, couponData) => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Unauthorized');

      const updatedCoupon = await couponAdminApi.updateCoupon(
        token,
        id,
        couponData,
      );
      setCoupons(prev => ({
        ...prev,
        results: prev.results.map(c => (c.id === id ? updatedCoupon : c)),
      }));
      return updatedCoupon;
    } catch (err) {
      setError(err.detail || err.message || 'Failed to update coupon');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Delete a coupon
   */
  const deleteCoupon = async id => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Unauthorized');

      await couponAdminApi.deleteCoupon(token, id);
      setCoupons(prev => ({
        ...prev,
        results: prev.results.filter(c => c.id !== id),
        count: prev.count - 1,
      }));
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete coupon');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  return {
    coupons,
    loading,
    isUpdating,
    error,
    pagination,
    fetchCoupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
  };
};
