'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  fetchPharmacyOrdersApi,
  fetchPharmacyOrderDetailsApi,
  updateOrderStatusApi,
} from '../api/orderApi';

export const usePharmacyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const data = await fetchPharmacyOrdersApi(token, page);
      setOrders(data.results || []);
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / 10));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  const loadOrderDetails = useCallback(async id => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const data = await fetchPharmacyOrderDetailsApi(token, id);
      setOrderDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // FIXED: Immediate UI Update Logic
  const updateStatus = async (id, newStatus) => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await updateOrderStatusApi(token, id, newStatus);

      // 1. Update local details state immediately with the new status
      setOrderDetails(prev =>
        prev ? { ...prev, status: response.status } : null,
      );

      // 2. Silently refresh the list in the background
      const updatedListData = await fetchPharmacyOrdersApi(token, page);
      setOrders(updatedListData.results || []);

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return {
    orders,
    orderDetails,
    isLoading,
    isUpdating,
    error,
    page,
    setPage,
    totalPages,
    totalCount,
    refresh: loadOrders,
    loadOrderDetails,
    updateStatus,
  };
};
