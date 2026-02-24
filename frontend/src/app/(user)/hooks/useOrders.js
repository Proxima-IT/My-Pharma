'use client';
import { useState, useEffect, useCallback } from 'react';
import { fetchOrdersApi, fetchOrderDetailsApi } from '../api/orderApi';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Session expired. Please login again.');

      const data = await fetchOrdersApi(token, filter, page);

      // Handle DRF Paginated Response
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
      if (!token) throw new Error('Session expired. Please login again.');

      const data = await fetchOrderDetailsApi(token, id);
      setOrderDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [filter]);

  return {
    orders,
    orderDetails,
    filter,
    setFilter,
    page,
    setPage,
    totalPages,
    isLoading,
    error,
    refresh: loadOrders,
    loadOrderDetails,
  };
};
