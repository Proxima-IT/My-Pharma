'use client';

import { useState, useEffect, useCallback } from 'react';
import { comboAdminApi } from '../api/comboAdminApi';

/**
 * My Pharma - Super Admin Combo Management Hook
 * Manages state and operations for product bundles/combos.
 */
export const useComboAdmin = () => {
  const [combos, setCombos] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
  });

  const fetchCombos = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const data = await comboAdminApi.getCombos(token, params);
      setCombos({ results: data.results, count: data.count });
      setPagination({
        next: data.next,
        previous: data.previous,
      });
    } catch (err) {
      setError(err.message || 'Failed to load combos');
    } finally {
      setLoading(false);
    }
  }, []);

  const addCombo = async formData => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Unauthorized: No token found');

      const newCombo = await comboAdminApi.createCombo(token, formData);
      setCombos(prev => ({
        ...prev,
        results: [newCombo, ...prev.results],
        count: prev.count + 1,
      }));
      return newCombo;
    } catch (err) {
      setError(err.message || 'Failed to create combo');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateCombo = async (id, formData) => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Unauthorized');

      const updatedCombo = await comboAdminApi.updateCombo(token, id, formData);
      setCombos(prev => ({
        ...prev,
        results: prev.results.map(c => (c.id === id ? updatedCombo : c)),
      }));
      return updatedCombo;
    } catch (err) {
      setError(err.message || 'Failed to update combo');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteCombo = async id => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Unauthorized');

      await comboAdminApi.deleteCombo(token, id);
      setCombos(prev => ({
        ...prev,
        results: prev.results.filter(c => c.id !== id),
        count: prev.count - 1,
      }));
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete combo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCombos();
  }, [fetchCombos]);

  return {
    combos,
    loading,
    isUpdating,
    error,
    pagination,
    fetchCombos,
    addCombo,
    updateCombo,
    deleteCombo,
  };
};
