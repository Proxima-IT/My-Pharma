'use client';
import { useState, useEffect, useCallback } from 'react';
import { fetchPrescriptionsApi } from '../api/prescriptionApi';

export const usePrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [filter, setFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPrescriptions = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('Session expired. Please login again.');

        const data = await fetchPrescriptionsApi(token, filter);

        // FIXED: Handle paginated response structure
        // If backend returns { results: [...] }, use that. Otherwise use raw array.
        const list = data.results || (Array.isArray(data) ? data : []);
        setPrescriptions(list);
      } catch (err) {
        setError(err.message);
        setPrescriptions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [filter],
  );

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
