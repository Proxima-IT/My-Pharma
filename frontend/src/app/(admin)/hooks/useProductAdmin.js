'use client';
import { useState, useCallback } from 'react';
import { productAdminApi } from '../api/productAdminApi';

export const useProductAdmin = () => {
  const [products, setProducts] = useState({ results: [], count: 0 });
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const data = await productAdminApi.getProducts(token, params);
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductBySlug = useCallback(async slug => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const data = await productAdminApi.getProductBySlug(token, slug);
      setProductDetails(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // নতুন প্রোডাক্ট এবং মাল্টিপল ইমেজ আপলোড
  const createProductWithImages = async (mainFormData, galleryFiles) => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      // ১. প্রথমে মেইন প্রোডাক্ট তৈরি
      const newProduct = await productAdminApi.createProduct(
        token,
        mainFormData,
      );

      // ২. যদি গ্যালারি ইমেজ থাকে, সেগুলো একে একে আপলোড করা
      if (galleryFiles && galleryFiles.length > 0) {
        for (const file of galleryFiles) {
          await productAdminApi.uploadGalleryImage(
            token,
            newProduct.slug,
            file,
          );
        }
      }
      return true;
    } catch (err) {
      setError(err.detail || 'সেভ করা সম্ভব হয়নি।');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateProduct = async (slug, formData) => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('access_token');
      await productAdminApi.updateProduct(token, slug, formData);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteProduct = async slug => {
    try {
      const token = localStorage.getItem('access_token');
      await productAdminApi.deleteProduct(token, slug);
      setProducts(prev => ({
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
    products,
    productDetails,
    loading,
    isUpdating,
    error,
    fetchProducts,
    fetchProductBySlug,
    createProductWithImages,
    updateProduct,
    deleteProduct,
  };
};
