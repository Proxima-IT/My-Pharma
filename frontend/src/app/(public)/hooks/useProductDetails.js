'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchProductDetailsApi } from '../api/productApi';

/**
 * Hook to manage single product details state and fetching
 * @param {string} slug - The unique product slug from the URL
 */
export const useProductDetails = slug => {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProduct = useCallback(async () => {
    if (!slug) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchProductDetailsApi(slug);
      setProduct(data);
    } catch (err) {
      setError(err.message);
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  // Fetch data whenever the slug changes
  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  return {
    product,
    isLoading,
    error,
    refresh: loadProduct,
  };
};
