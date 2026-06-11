'use client';
import { useState, useCallback } from 'react';
import { categoryAdminApi } from '../api/categoryAdminApi';

/**
 * useCategoryAdmin Hook
 * Manages product categories, hierarchy, and bulk selections for Sidebar/Featured views.
 */
export const useCategoryAdmin = () => {
  const [categories, setCategories] = useState({ results: [], count: 0 });
  const [categoryTree, setCategoryTree] = useState([]);
  const [categoryDetails, setCategoryDetails] = useState(null);

  // New States for Sidebar and Featured Selections
  const [sidebarSelection, setSidebarSelection] = useState([]);
  const [featuredSelection, setFeaturedSelection] = useState([]);
  const [forthSectionSelection, setForthSectionSelection] = useState([]);

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
  const createCategory = async formData => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');

      // Convert plain object to FormData if needed
      let dataToSend = formData;
      if (!(formData instanceof FormData)) {
        dataToSend = new FormData();
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined) {
            dataToSend.append(key, formData[key]);
          }
        });
      }

      await categoryAdminApi.createCategory(token, dataToSend);
      return true;
    } catch (err) {
      let msg = 'গ্রুপ তৈরি করা সম্ভব হয়নি।';
      if (err && typeof err === 'object') {
        if (err.detail) {
          msg = err.detail;
        } else {
          const firstKey = Object.keys(err)[0];
          if (firstKey && Array.isArray(err[firstKey]) && err[firstKey][0]) {
            msg = `${firstKey.toUpperCase()}: ${err[firstKey][0]}`;
          } else if (typeof err.message === 'string') {
            msg = err.message;
          }
        }
      }
      setError(msg);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // ৫. গ্রুপের তথ্য আপডেট করা
  const updateCategory = async (slug, formData) => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');

      // Convert plain object to FormData if needed
      let dataToSend = formData;
      if (!(formData instanceof FormData)) {
        dataToSend = new FormData();
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined) {
            dataToSend.append(key, formData[key]);
          }
        });
      }

      await categoryAdminApi.updateCategory(token, slug, dataToSend);
      return true;
    } catch (err) {
      let msg = 'তথ্য আপডেট করা সম্ভব হয়নি।';
      if (err && typeof err === 'object') {
        if (err.detail) {
          msg = err.detail;
        } else {
          const firstKey = Object.keys(err)[0];
          if (firstKey && Array.isArray(err[firstKey]) && err[firstKey][0]) {
            msg = `${firstKey.toUpperCase()}: ${err[firstKey][0]}`;
          } else if (typeof err.message === 'string') {
            msg = err.message;
          }
        }
      }
      setError(msg);
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

  // --- NEW BULK SELECTION ACTIONS ---

  // ৭. সাইডবার সিলেকশন লোড করা
  const fetchSidebarSelection = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const data = await categoryAdminApi.getSelectedSidebarCategories(token);
      setSidebarSelection(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ৮. সাইডবার সিলেকশন সেভ করা
  const saveSidebarSelection = async categoryIds => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('access_token');
      await categoryAdminApi.updateSidebarSelection(token, categoryIds);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // ৯. ফিচারড সিলেকশন লোড করা
  const fetchFeaturedSelection = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const data = await categoryAdminApi.getFeaturedHomeCategories(token);
      setFeaturedSelection(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ১০. ফিচারড সিলেকশন সেভ করা
  const saveFeaturedSelection = async categoryIds => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('access_token');
      await categoryAdminApi.updateFeaturedHomeSelection(token, categoryIds);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // ১১. ফোর্থ সেকশন সিলেকশন লোড করা
  const fetchForthSectionSelection = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const data = await categoryAdminApi.getForthSectionCategories(token);
      setForthSectionSelection(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ১২. ফোর্থ সেকশন সিলেকশন সেভ করা
  const saveForthSectionSelection = async categoryIds => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('access_token');
      await categoryAdminApi.updateForthSectionSelection(token, categoryIds);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    categories,
    categoryTree,
    categoryDetails,
    sidebarSelection,
    featuredSelection,
    loading,
    isUpdating,
    error,
    fetchCategories,
    fetchCategoryTree,
    fetchCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchSidebarSelection,
    saveSidebarSelection,
    fetchFeaturedSelection,
    saveFeaturedSelection,
    forthSectionSelection,
    fetchForthSectionSelection,
    saveForthSectionSelection,
  };
};
