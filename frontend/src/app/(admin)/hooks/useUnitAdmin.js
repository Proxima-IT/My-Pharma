'use client';
import { useState, useCallback } from 'react';
import { unitAdminApi } from '../api/unitAdminApi';

export const useUnitAdmin = () => {
  const [units, setUnits] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // List all units (search & pagination)
  const fetchUnits = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const data = await unitAdminApi.getUnits(token, params);
      setUnits(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new unit
  const createUnit = async data => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await unitAdminApi.createUnit(token, data);
      return true;
    } catch (err) {
      setError(err.detail || err.name?.[0] || 'Failed to create unit.');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Update an existing unit
  const updateUnit = async (slug, data) => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await unitAdminApi.updateUnit(token, slug, data);
      return true;
    } catch (err) {
      setError(err.detail || err.name?.[0] || 'Failed to update unit.');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete a unit
  const deleteUnit = async slug => {
    try {
      const token = localStorage.getItem('access_token');
      await unitAdminApi.deleteUnit(token, slug);
      setUnits(prev => ({
        ...prev,
        results: prev.results.filter(u => u.slug !== slug),
        count: prev.count - 1,
      }));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return {
    units,
    loading,
    isUpdating,
    error,
    fetchUnits,
    createUnit,
    updateUnit,
    deleteUnit,
  };
};
