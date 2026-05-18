'use client';
import { useState, useCallback } from 'react';
import { deliveryMethodAdminApi } from '../api/deliveryMethodAdminApi';

export const useDeliveryMethodAdmin = () => {
  const [methods, setMethods] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // List all delivery methods (search & pagination)
  const fetchMethods = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const data = await deliveryMethodAdminApi.getMethods(token, params);
      // Normalize: API may return array or paginated object
      if (Array.isArray(data)) {
        setMethods({ results: data, count: data.length });
      } else {
        setMethods(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new delivery method
  const createMethod = async data => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await deliveryMethodAdminApi.createMethod(token, data);
      return true;
    } catch (err) {
      setError(err.detail || err.name?.[0] || 'Failed to create delivery method.');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Update an existing delivery method
  const updateMethod = async (id, data) => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await deliveryMethodAdminApi.updateMethod(token, id, data);
      return true;
    } catch (err) {
      setError(err.detail || err.name?.[0] || 'Failed to update delivery method.');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete a delivery method
  const deleteMethod = async id => {
    try {
      const token = localStorage.getItem('access_token');
      await deliveryMethodAdminApi.deleteMethod(token, id);
      setMethods(prev => ({
        ...prev,
        results: prev.results.filter(m => m.id !== id),
        count: prev.count - 1,
      }));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return {
    methods,
    loading,
    isUpdating,
    error,
    fetchMethods,
    createMethod,
    updateMethod,
    deleteMethod,
  };
};
