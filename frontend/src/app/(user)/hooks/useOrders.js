'use client';

import { useState, useEffect, useCallback } from 'react';
import { orderApi } from '../api/orderApi';

/**
 * My Pharma - Orders Hook
 * Updated: Handles complex error objects from the backend for better UI feedback.
 */
export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const [durations, setDurations] = useState([]);
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState(null);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const params = { page };
      if (filter !== 'All') params.status = filter.toUpperCase();
      const data = await orderApi.getOrders(token, params);
      if (data.results) {
        setOrders(data.results);
        setTotalPages(Math.ceil(data.count / 10));
      } else {
        setOrders(data);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [filter, page]);

  const loadOrderDetails = useCallback(async id => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Session expired.');
      const data = await orderApi.getOrderDetails(token, id);
      setOrderDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadDurations = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const data = await orderApi.getDeliveryDurations(token);
      setDurations(data.results || data);
    } catch (err) {
      console.error('Failed to load durations:', err);
    }
  }, []);

  const placePrescriptionOrder = async formData => {
    setIsPlacingOrder(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Please login to place an order.');
      const result = await orderApi.createPrescriptionOrder(token, formData);
      return result;
    } catch (err) {
      // Extract specific field errors or general detail
      const msg =
        err.detail ||
        (typeof err === 'object' ? Object.values(err)[0][0] : err.message);
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  useEffect(() => {
    loadOrders();
    loadDurations();
  }, [loadOrders, loadDurations]);

  return {
    orders,
    orderDetails,
    durations,
    filter,
    setFilter,
    page,
    setPage,
    totalPages,
    isLoading,
    isPlacingOrder,
    error,
    refresh: loadOrders,
    loadOrderDetails,
    placePrescriptionOrder,
  };
};
