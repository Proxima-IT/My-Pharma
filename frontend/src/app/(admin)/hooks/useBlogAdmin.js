'use client';

import { useState, useCallback } from 'react';
import { blogAdminApi } from '../api/blogAdminApi';

/**
 * My Pharma - Super Admin Blog Management Hook
 * Manages state and operations for Blog Categories and Posts.
 * Follows the Domain-Driven logic separation pattern.
 */
export const useBlogAdmin = () => {
  const [posts, setPosts] = useState({ results: [], count: 0 });
  const [categories, setCategories] = useState({ results: [], count: 0 });
  const [postDetails, setPostDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // --- CATEGORY OPERATIONS ---

  const fetchCategories = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const data = await blogAdminApi.getCategories(token, params);
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = async data => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const newCat = await blogAdminApi.createCategory(token, data);
      await fetchCategories(); // Refresh list
      return newCat;
    } catch (err) {
      setError(err.detail || 'Failed to create category');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateCategory = async (slug, data) => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await blogAdminApi.updateCategory(token, slug, data);
      await fetchCategories();
      return true;
    } catch (err) {
      setError(err.detail || 'Failed to update category');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteCategory = async slug => {
    try {
      const token = localStorage.getItem('access_token');
      await blogAdminApi.deleteCategory(token, slug);
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

  // --- POST OPERATIONS ---

  const fetchPosts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const data = await blogAdminApi.getPosts(token, params);
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPostBySlug = useCallback(async slug => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const data = await blogAdminApi.getPostBySlug(token, slug);
      setPostDetails(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = async formData => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await blogAdminApi.createPost(token, formData);
      return true;
    } catch (err) {
      setError(err.detail || 'Failed to create post');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const updatePost = async (slug, formData) => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await blogAdminApi.updatePost(token, slug, formData);
      return true;
    } catch (err) {
      setError(err.detail || 'Failed to update post');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const deletePost = async slug => {
    try {
      const token = localStorage.getItem('access_token');
      await blogAdminApi.deletePost(token, slug);
      setPosts(prev => ({
        ...prev,
        results: prev.results.filter(p => p.slug !== slug),
        count: prev.count - 1,
      }));
      return true;
    } catch (err) {
      return false;
    }
  };

  return {
    posts,
    categories,
    postDetails,
    loading,
    isUpdating,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchPosts,
    fetchPostBySlug,
    createPost,
    updatePost,
    deletePost,
  };
};
