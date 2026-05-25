'use client';
import { useState, useCallback } from 'react';
import { sidebarAdminApi } from '../api/sidebarAdminApi';

/**
 * useSidebarAdmin Hook
 * Manages custom sidebar items (Method B: Independent title and image entries).
 * Updated: Aligned with the refactored sidebarAdminApi method names.
 */
export const useSidebarAdmin = () => {
  const [sidebarItems, setSidebarItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // 1. Load all custom sidebar categories
  const fetchSidebarItems = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const data = await sidebarAdminApi.getCustomSidebarCategories(
        token,
        params,
      );
      // API returns a paginated result set
      setSidebarItems(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Create a new custom sidebar item
  const createSidebarItem = async formData => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await sidebarAdminApi.createCustomSidebarCategory(token, formData);
      return true;
    } catch (err) {
      setError(err.detail || 'Failed to create custom menu item');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // 3. Update an existing custom sidebar item
  const updateSidebarItem = async (id, formData) => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await sidebarAdminApi.updateCustomSidebarCategory(token, id, formData);
      return true;
    } catch (err) {
      setError(err.detail || 'Failed to update custom menu item');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // 4. Delete a custom sidebar item
  const deleteSidebarItem = async id => {
    try {
      const token = localStorage.getItem('access_token');
      await sidebarAdminApi.deleteCustomSidebarCategory(token, id);
      setSidebarItems(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return {
    sidebarItems,
    loading,
    isUpdating,
    error,
    fetchSidebarItems,
    createSidebarItem,
    updateSidebarItem,
    deleteSidebarItem,
  };
};
