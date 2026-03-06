'use client';
import { useState, useCallback } from 'react';
import { orderAdminApi } from '../api/orderAdminApi';

export const useAdminOrders = () => {
  const [orders, setOrders] = useState({ results: [], count: 0 });
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // ১. সব অর্ডারের লিস্ট লোড করা
  const fetchOrders = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const data = await orderAdminApi.getOrders(token, params);
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ২. একটি নির্দিষ্ট অর্ডারের তথ্য লোড করা
  const fetchOrderDetails = useCallback(async id => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const data = await orderAdminApi.getOrderDetails(token, id);
      setOrderDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ৩. অর্ডারের স্ট্যাটাস পরিবর্তন করা (যেমন: ডেলিভারি সম্পন্ন করা)
  const updateStatus = async (id, status) => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('access_token');
      const updatedOrder = await orderAdminApi.updateOrderStatus(
        token,
        id,
        status,
      );

      // লিস্ট এবং ডিটেইলস আপডেট করা
      setOrderDetails(updatedOrder);
      setOrders(prev => ({
        ...prev,
        results: prev.results.map(order =>
          order.id === id ? updatedOrder : order,
        ),
      }));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    orders,
    orderDetails,
    loading,
    isUpdating,
    error,
    fetchOrders,
    fetchOrderDetails,
    updateStatus,
  };
};
