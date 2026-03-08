'use client';
import { useState, useCallback } from 'react';
import { adsAdminApi } from '../api/adsAdminApi';

export const useAdsAdmin = () => {
  const [ads, setAds] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const fetchAds = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const data = await adsAdminApi.getList(token, params);
      setAds(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAd = async formData => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await adsAdminApi.create(token, formData);
      return true;
    } catch (err) {
      // Stringify error object if it's from backend validation
      const msg = typeof err === 'object' ? JSON.stringify(err) : err.message;
      setError(msg);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateAd = async (id, formData) => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await adsAdminApi.update(token, id, formData);
      return true;
    } catch (err) {
      const msg = typeof err === 'object' ? JSON.stringify(err) : err.message;
      setError(msg);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteAd = async id => {
    try {
      const token = localStorage.getItem('access_token');
      await adsAdminApi.delete(token, id);
      setAds(prev => ({
        ...prev,
        results: prev.results.filter(ad => ad.id !== id),
        count: prev.count - 1,
      }));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return {
    ads,
    loading,
    isUpdating,
    error,
    fetchAds,
    createAd,
    updateAd,
    deleteAd,
  };
};
