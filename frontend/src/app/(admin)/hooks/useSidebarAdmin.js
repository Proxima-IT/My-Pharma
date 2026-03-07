'use client';
import { useState, useCallback } from 'react';
import { sidebarAdminApi } from '../api/sidebarAdminApi';

export const useSidebarAdmin = () => {
  const [sidebarItems, setSidebarItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // 1. Load all sidebar categories
  const fetchSidebarItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const data = await sidebarAdminApi.getList(token);
      // API returns a results array
      setSidebarItems(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Create a new category
  const createSidebarItem = async formData => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await sidebarAdminApi.create(token, formData);
      return true;
    } catch (err) {
      setError(err.detail || 'Failed to create menu item');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // 3. Update an existing category
  const updateSidebarItem = async (id, formData) => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await sidebarAdminApi.update(token, id, formData);
      return true;
    } catch (err) {
      setError(err.detail || 'Failed to update menu item');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // 4. Delete a category
  const deleteSidebarItem = async id => {
    try {
      const token = localStorage.getItem('access_token');
      await sidebarAdminApi.delete(token, id);
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
