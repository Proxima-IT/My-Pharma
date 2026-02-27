'use client';
import { useState, useCallback } from 'react';
import {
  fetchBrandsApi,
  createBrandApi,
  updateBrandApi,
  deleteBrandApi,
  fetchBrandDetailsApi,
} from '../api/brandApi';

export const useBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoized to prevent infinite loops in useEffect
  const getBrands = useCallback(async (token, params) => {
    setLoading(true);
    try {
      const data = await fetchBrandsApi(token, params);
      setBrands(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized to prevent infinite loops in Edit Pages
  const getBrandDetails = useCallback(async (token, slug) => {
    setLoading(true);
    try {
      const data = await fetchBrandDetailsApi(token, slug);
      setError(null);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBrand = useCallback(async (token, payload) => {
    setLoading(true);
    try {
      const data = await createBrandApi(token, payload);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBrand = useCallback(async (token, slug, payload) => {
    setLoading(true);
    try {
      const data = await updateBrandApi(token, slug, payload);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBrand = useCallback(async (token, slug) => {
    try {
      await deleteBrandApi(token, slug);
      setBrands(prev => {
        const list = Array.isArray(prev) ? prev : prev?.results || [];
        return list.filter(b => b.slug !== slug);
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    brands,
    loading,
    error,
    getBrands,
    getBrandDetails,
    createBrand,
    updateBrand,
    deleteBrand,
  };
};
