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
  addProductGalleryImageApi,
  deleteProductGalleryImageApi,
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

  /**
   * Orchestrates multi-image upload for Choice B
   */
  const handleGalleryUploads = async (token, slug, galleryFiles) => {
    const uploadPromises = galleryFiles.map(file =>
      addProductGalleryImageApi(token, slug, file),
    );
    return Promise.all(uploadPromises);
  };

  const createProduct = async formData => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Please log in again.');
        return false;
      }

      // Choice B Logic: Split 'images' into primary 'image' and gallery 'images'
      const allImages = formData.getAll('images');
      formData.delete('images');

      if (allImages.length > 0) {
        formData.append('image', allImages[0]); // First image is primary
      }

      const galleryFiles = allImages.slice(1); // Rest are gallery

      // 1. Create the product
      const product = await createPharmacyProductApi(token, formData);

      // 2. Upload gallery images if any
      if (galleryFiles.length > 0) {
        await handleGalleryUploads(token, product.slug, galleryFiles);
      }

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

      // Choice B Logic: Handle new gallery images
      const allNewImages = formData.getAll('images');
      formData.delete('images');

      // If the user uploaded new images, the first one becomes the primary 'image'
      // only if the backend doesn't already have one, or if we want to override.
      // For simplicity, we treat the first 'new' image as the primary if provided.
      if (allNewImages.length > 0) {
        formData.append('image', allNewImages[0]);
      }

      const galleryFiles = allNewImages.slice(1);

      // Handle deletions of existing gallery images
      const deletedIdsStr = formData.get('deleted_image_ids');
      if (deletedIdsStr) {
        const deletedIds = JSON.parse(deletedIdsStr);
        await Promise.all(
          deletedIds.map(id => deleteProductGalleryImageApi(token, slug, id)),
        );
        formData.delete('deleted_image_ids');
      }

      // 1. Update basic product info
      const product = await updatePharmacyProductApi(token, slug, formData);

      // 2. Upload new gallery images
      if (galleryFiles.length > 0) {
        await handleGalleryUploads(token, product.slug, galleryFiles);
      }

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

  const deleteGalleryImage = async (slug, imageId) => {
    try {
      const token = localStorage.getItem('access_token');
      await deleteProductGalleryImageApi(token, slug, imageId);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
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
    loadProductDetails,
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
    deleteGalleryImage,
    updateStock,
    refresh: loadProducts,
  };
};
