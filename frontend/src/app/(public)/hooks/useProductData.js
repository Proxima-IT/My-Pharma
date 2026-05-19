'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchProductsApi } from '../api/productApi';

export const useProductData = (initialFilters = {}) => {
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    ordering: '',
    brand_id: '',
    ingredient_id: '',
    has_discount: '',
    discounted: '',
    available: '',
    min_price: '',
    max_price: '',
    ...initialFilters,
  });

  // Sync internal filters whenever the URL parameters (initialFilters) change
  const initialFiltersString = useMemo(
    () => JSON.stringify(initialFilters),
    [initialFilters],
  );

  useEffect(() => {
    setFilters(prev => ({ ...prev, ...initialFilters }));
    setPage(1); // Reset to first page on filter change
  }, [initialFiltersString, setFilters]);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page,
        ...Object.fromEntries(
          Object.entries(filters).filter(
            ([_, value]) =>
              value !== '' && value !== undefined && value !== null,
          ),
        ),
      };

      const data = await fetchProductsApi(params);
      setProducts(data.results || []);
      setTotalCount(data.count || 0);
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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
