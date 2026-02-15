'use client';
import { useState, useEffect, useCallback } from 'react';
import { fetchOrdersApi } from '../api/orderApi';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Session expired. Please login again.');

      const data = await fetchOrdersApi(token, filter);
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return {
    orders,
    filter,
    setFilter,
    isLoading,
    error,
    refresh: loadOrders,
  };
};
