'use client';
import { useState, useCallback } from 'react';
import { productAdminApi } from '../api/productAdminApi';

/**
 * useProductAdmin Hook
 * Manages state and logic for product catalog management in the Admin panel.
 * Updated to support extended medical metadata and multipart product creation.
 */
export const useProductAdmin = () => {
  const [products, setProducts] = useState({ results: [], count: 0 });
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetches a paginated list of products based on filters.
   */
  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const data = await productAdminApi.getProducts(token, params);
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetches full details for a single product by its slug.
   */
  const fetchProductBySlug = useCallback(async slug => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const data = await productAdminApi.getProductBySlug(token, slug);
      setProductDetails(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch product details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Creates a new product and subsequently uploads gallery images.
   * Handles multipart/form-data for the main image and medical metadata.
   */
  const createProductWithImages = async (mainFormData, galleryFiles) => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');

      // 1. Create the primary product record
      const newProduct = await productAdminApi.createProduct(
        token,
        mainFormData,
      );

      // 2. Upload additional gallery images if present
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
      // Extract specific field errors if available from DRF
      const msg =
        err.detail || (typeof err === 'object' ? JSON.stringify(err) : err);
      setError(msg || 'Save failed. Please check field validation.');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Updates an existing product using partial update (PATCH).
   */
  const updateProduct = async (slug, formData) => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await productAdminApi.updateProduct(token, slug, formData);
      return true;
    } catch (err) {
      setError(err.message || 'Update failed');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Deletes a product or deactivates it if protected by orders.
   */
  const deleteProduct = async slug => {
    setError(null);
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
      setError(err.message || 'Deletion failed');
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
