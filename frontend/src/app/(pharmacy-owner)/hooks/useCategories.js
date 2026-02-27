'use client';
import { useState, useCallback } from 'react';
import {
  fetchCategoriesApi,
  fetchCategoryDetailsApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  fetchCategoryTreeApi,
} from '../api/categoryApi';

/**
 * Hook for Category Management logic
 * Handles state for both flat paginated lists and hierarchical trees
 */
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch flat list (paginated)
  const getCategories = useCallback(async (token, params) => {
    setLoading(true);
    try {
      const data = await fetchCategoriesApi(token, params);
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch hierarchical tree for parent selection
  const getCategoryTree = useCallback(async token => {
    setLoading(true);
    try {
      const data = await fetchCategoryTreeApi(token);
      setCategoryTree(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCategoryDetails = useCallback(async (token, slug) => {
    setLoading(true);
    try {
      const data = await fetchCategoryDetailsApi(token, slug);
      setError(null);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (token, payload) => {
    setLoading(true);
    try {
      const data = await createCategoryApi(token, payload);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (token, slug, payload) => {
    setLoading(true);
    try {
      const data = await updateCategoryApi(token, slug, payload);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (token, slug) => {
    try {
      await deleteCategoryApi(token, slug);
      setCategories(prev => {
        const list = Array.isArray(prev) ? prev : prev?.results || [];
        return {
          ...prev,
          results: list.filter(c => c.slug !== slug),
        };
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    categories,
    categoryTree,
    loading,
    error,
    getCategories,
    getCategoryTree,
    getCategoryDetails,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
