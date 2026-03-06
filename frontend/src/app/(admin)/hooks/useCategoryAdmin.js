'use client';
import { useState, useCallback } from 'react';
import { categoryAdminApi } from '../api/categoryAdminApi';

export const useCategoryAdmin = () => {
  const [categories, setCategories] = useState({ results: [], count: 0 });
  const [categoryTree, setCategoryTree] = useState([]);
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // ১. সব গ্রুপের লিস্ট লোড করা (Pagination সহ)
  const fetchCategories = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const data = await categoryAdminApi.getCategories(token, params);
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ২. গ্রুপের হায়ারার্কি বা ট্রি লোড করা (ড্রপডাউনের জন্য)
  const fetchCategoryTree = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const data = await categoryAdminApi.getCategoryTree(token);
      setCategoryTree(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ৩. একটি নির্দিষ্ট গ্রুপের তথ্য লোড করা
  const fetchCategoryBySlug = useCallback(async slug => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const data = await categoryAdminApi.getCategoryBySlug(token, slug);
      setCategoryDetails(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ৪. নতুন গ্রুপ তৈরি করা
  const createCategory = async data => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await categoryAdminApi.createCategory(token, data);
      return true;
    } catch (err) {
      setError(err.detail || 'গ্রুপ তৈরি করা সম্ভব হয়নি।');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // ৫. গ্রুপের তথ্য আপডেট করা
  const updateCategory = async (slug, data) => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await categoryAdminApi.updateCategory(token, slug, data);
      return true;
    } catch (err) {
      setError(err.detail || 'তথ্য আপডেট করা সম্ভব হয়নি।');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // ৬. গ্রুপ ডিলিট করা
  const deleteCategory = async slug => {
    try {
      const token = localStorage.getItem('access_token');
      await categoryAdminApi.deleteCategory(token, slug);
      setCategories(prev => ({
        ...prev,
        results: prev.results.filter(c => c.slug !== slug),
        count: prev.count - 1,
      }));
      return true;
    } catch (err) {
      return false;
    }
  };

  return {
    categories,
    categoryTree,
    categoryDetails,
    loading,
    isUpdating,
    error,
    fetchCategories,
    fetchCategoryTree,
    fetchCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
