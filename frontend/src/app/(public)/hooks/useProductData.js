'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchProductsApi } from '../api/productApi';

export const useProductData = (initialFilters = {}) => {
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination and Filter State
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    ordering: '',
    brand_id: '', // Added brand_id to filters
    ...initialFilters,
  });

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Prepare query parameters for the API
      const params = {
        page,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== ''),
        ),
      };

      const data = await fetchProductsApi(params);

      // Handle Django Rest Framework Paginated Response
      setProducts(data.results || []);
      setTotalCount(data.count || 0);
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, filters]);

  // Trigger fetch when page or filters change
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Helper to update filters and reset to page 1
  const updateFilters = newFilters => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  return {
    products,
    totalCount,
    isLoading,
    error,
    page,
    setPage,
    filters,
    updateFilters,
    refresh: loadProducts,
  };
};
