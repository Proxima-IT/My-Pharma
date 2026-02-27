'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  fetchPharmacyProductsApi,
  fetchPharmacyProductDetailsApi,
  createPharmacyProductApi,
  updatePharmacyProductApi,
  deletePharmacyProductApi,
  updatePharmacyInventoryApi,
  fetchBrandsApi,
  fetchCategoriesApi,
  fetchIngredientsApi,
} from '../api/productApi';

export const usePharmacyProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([]);
  const [productDetails, setProductDetails] = useState(null);

  // Metadata States for Dropdowns
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ingredients, setIngredients] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState(initialParams);

  // 1. Load Metadata (Brands, Categories, Ingredients)
  const loadMetadata = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const [brandsData, catsData, ingsData] = await Promise.all([
        fetchBrandsApi(token),
        fetchCategoriesApi(token),
        fetchIngredientsApi(token),
      ]);

      // Handle both direct arrays and DRF paginated { results: [] } formats
      setBrands(brandsData.results || brandsData);
      setCategories(catsData.results || catsData);
      setIngredients(ingsData.results || ingsData);
    } catch (err) {
      console.error('Failed to load product metadata:', err);
    }
  }, []);

  // 2. Load Paginated Products List
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const params = {
        page,
        ...filters,
      };

      const data = await fetchPharmacyProductsApi(token, params);

      setProducts(data.results || []);
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / 10));
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, filters]);

  const handleSearch = query => {
    setFilters(prev => ({ ...prev, search: query }));
    setPage(1);
  };

  const loadProductDetails = useCallback(async slug => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const data = await fetchPharmacyProductDetailsApi(token, slug);
      setProductDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProduct = async formData => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await createPharmacyProductApi(token, formData);
      await loadProducts();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateProduct = async (slug, formData) => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await updatePharmacyProductApi(token, slug, formData);
      await loadProducts();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteProduct = async slug => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('access_token');
      await deletePharmacyProductApi(token, slug);
      setProducts(prev => prev.filter(p => p.slug !== slug));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateStock = async (slug, quantity) => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('access_token');
      const updatedProduct = await updatePharmacyInventoryApi(
        token,
        slug,
        quantity,
      );
      setProducts(prev =>
        prev.map(p =>
          p.slug === slug
            ? { ...p, quantity_in_stock: updatedProduct.quantity_in_stock }
            : p,
        ),
      );
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Initial load of metadata and products
  useEffect(() => {
    loadMetadata();
    loadProducts();
  }, [loadMetadata, loadProducts]);

  return {
    products,
    productDetails,
    loadProductDetails, // FIXED: Added missing function to return object
    brands,
    categories,
    ingredients,
    isLoading,
    isUpdating,
    error,
    page,
    setPage,
    totalPages,
    totalCount,
    filters,
    handleSearch,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    refresh: loadProducts,
  };
};
