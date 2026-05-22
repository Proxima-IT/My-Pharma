'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  API_BASE_URL,
  fetchWithAuth,
  parseJsonResponse,
} from '@/app/(shared)/lib/apiConfig';

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

      // Map legacy/frontend keys to backend search parameter names
      if (params.has_discount) {
        params.discounted = params.has_discount;
        delete params.has_discount;
      }

      // Determine endpoint based on whether we are performing a search or just listing
      // Search endpoint supports relevance ranking and fuzzy matching
      let url = `${API_BASE_URL}/products/`;
      if (params.search) {
        url = `${API_BASE_URL}/products/search/`;
        params.q = params.search; // Backend search endpoint expects 'q' or 'query'
        delete params.search;
      }

      const queryString = new URLSearchParams(params).toString();
      const finalUrl = `${url}${queryString ? `?${queryString}` : ''}`;

      const response = await fetchWithAuth(finalUrl);
      const data = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch products');
      }

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
