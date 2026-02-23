'use client';
import { useState, useEffect, useCallback } from 'react';
import { fetchPrescriptionsApi } from '../api/prescriptionApi';

export const usePrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [filter, setFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPrescriptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Session expired. Please login again.');

      const data = await fetchPrescriptionsApi(token, filter);
      setPrescriptions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadPrescriptions();
  }, [loadPrescriptions]);

  return {
    prescriptions,
    filter,
    setFilter,
    isLoading,
    error,
    refresh: loadPrescriptions,
  };
};
