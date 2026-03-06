'use client';
import { useState, useCallback } from 'react';
import { brandAdminApi } from '../api/brandAdminApi';

export const useBrandAdmin = () => {
  const [brands, setBrands] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // ১. সব কোম্পানির লিস্ট লোড করা (Search & Pagination)
  const fetchBrands = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const data = await brandAdminApi.getBrands(token, params);
      setBrands(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ২. নতুন কোম্পানি তৈরি করা
  const createBrand = async data => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await brandAdminApi.createBrand(token, data);
      return true;
    } catch (err) {
      setError(err.detail || 'কোম্পানি যোগ করা সম্ভব হয়নি।');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // ৩. কোম্পানির তথ্য আপডেট করা
  const updateBrand = async (slug, data) => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await brandAdminApi.updateBrand(token, slug, data);
      return true;
    } catch (err) {
      setError(err.detail || 'তথ্য আপডেট করা সম্ভব হয়নি।');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // ৪. কোম্পানি ডিলিট করা
  const deleteBrand = async slug => {
    try {
      const token = localStorage.getItem('access_token');
      await brandAdminApi.deleteBrand(token, slug);
      setBrands(prev => ({
        ...prev,
        results: prev.results.filter(b => b.slug !== slug),
        count: prev.count - 1,
      }));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return {
    brands,
    loading,
    isUpdating,
    error,
    fetchBrands,
    createBrand,
    updateBrand,
    deleteBrand,
  };
};
