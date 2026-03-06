'use client';
import { useState, useCallback } from 'react';
import { ingredientAdminApi } from '../api/ingredientAdminApi';

export const useIngredientAdmin = () => {
  const [ingredients, setIngredients] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // ১. সব জেনেরিক নামের লিস্ট লোড করা (Search & Pagination)
  const fetchIngredients = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const data = await ingredientAdminApi.getIngredients(token, params);
      setIngredients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ২. নতুন জেনেরিক নাম তৈরি করা
  const createIngredient = async data => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await ingredientAdminApi.createIngredient(token, data);
      return true;
    } catch (err) {
      setError(err.detail || 'নতুন নাম যোগ করা সম্ভব হয়নি।');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // ৩. জেনেরিক নাম আপডেট করা
  const updateIngredient = async (slug, data) => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await ingredientAdminApi.updateIngredient(token, slug, data);
      return true;
    } catch (err) {
      setError(err.detail || 'তথ্য আপডেট করা সম্ভব হয়নি।');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // ৪. জেনেরিক নাম ডিলিট করা
  const deleteIngredient = async slug => {
    try {
      const token = localStorage.getItem('access_token');
      await ingredientAdminApi.deleteIngredient(token, slug);
      setIngredients(prev => ({
        ...prev,
        results: prev.results.filter(i => i.slug !== slug),
        count: prev.count - 1,
      }));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return {
    ingredients,
    loading,
    isUpdating,
    error,
    fetchIngredients,
    createIngredient,
    updateIngredient,
    deleteIngredient,
  };
};
