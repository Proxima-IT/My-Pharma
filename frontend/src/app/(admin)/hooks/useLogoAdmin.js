'use client';

import { useState, useEffect, useCallback } from 'react';
import { logoAdminApi } from '../api/logoAdminApi';

/**
 * My Pharma - Logo Management Hook
 * Updated: fetchLogos now runs for guests (no token required).
 */
export const useLogoAdmin = () => {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });

  const fetchLogos = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('access_token')
          : null;
      const data = await logoAdminApi.getLogos(token, page);
      setLogos(data.results || []);
      setPagination({
        count: data.count,
        next: data.next,
        previous: data.previous,
      });
    } catch (err) {
      setError(err.message || 'Failed to load logos');
    } finally {
      setLoading(false);
    }
  }, []);

  const addLogo = async formData => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Unauthorized');
    setLoading(true);
    try {
      const newLogo = await logoAdminApi.createLogo(token, formData);
      setLogos(prev => [newLogo, ...prev]);
      return newLogo;
    } catch (err) {
      setError(err.message || 'Failed to create logo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLogo = async (slug, formData) => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Unauthorized');
    setLoading(true);
    try {
      const updatedLogo = await logoAdminApi.patchLogo(token, slug, formData);
      setLogos(prev => prev.map(l => (l.slug === slug ? updatedLogo : l)));
      return updatedLogo;
    } catch (err) {
      setError(err.message || 'Failed to update logo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteLogo = async slug => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Unauthorized');
    setLoading(true);
    try {
      await logoAdminApi.deleteLogo(token, slug);
      setLogos(prev => prev.filter(l => l.slug !== slug));
    } catch (err) {
      setError(err.message || 'Failed to delete logo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogos();
  }, [fetchLogos]);

  return {
    logos,
    loading,
    error,
    pagination,
    fetchLogos,
    addLogo,
    updateLogo,
    deleteLogo,
  };
};
