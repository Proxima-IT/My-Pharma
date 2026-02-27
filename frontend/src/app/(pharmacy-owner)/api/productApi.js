import {
  PRODUCT_ENDPOINTS,
  BRAND_ENDPOINTS,
  CATEGORY_ENDPOINTS,
  INGREDIENT_ENDPOINTS,
} from '@/app/(shared)/lib/apiConfig';

/**
 * Pure API functions for Pharmacy Product Management
 */

// 1. Metadata Fetchers (For Dropdowns)

export const fetchBrandsApi = async token => {
  const response = await fetch(BRAND_ENDPOINTS.BASE, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error('Failed to fetch brands');
  return data;
};

export const fetchCategoriesApi = async token => {
  const response = await fetch(CATEGORY_ENDPOINTS.BASE, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error('Failed to fetch categories');
  return data;
};

export const fetchIngredientsApi = async token => {
  const response = await fetch(INGREDIENT_ENDPOINTS.BASE, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error('Failed to fetch ingredients');
  return data;
};

// 2. Product CRUD Operations

export const fetchPharmacyProductsApi = async (token, params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null && v !== ''),
  );

  const queryString = new URLSearchParams(cleanParams).toString();
  const url = `${PRODUCT_ENDPOINTS.BASE}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch products');
  }
  return data;
};

export const fetchPharmacyProductDetailsApi = async (token, slug) => {
  const response = await fetch(`${PRODUCT_ENDPOINTS.BASE}${slug}/`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch product details');
  }
  return data;
};

export const createPharmacyProductApi = async (token, formData) => {
  const response = await fetch(PRODUCT_ENDPOINTS.BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(JSON.stringify(data) || 'Failed to create product');
  }
  return data;
};

export const updatePharmacyProductApi = async (token, slug, formData) => {
  const response = await fetch(`${PRODUCT_ENDPOINTS.BASE}${slug}/`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(JSON.stringify(data) || 'Failed to update product');
  }
  return data;
};

export const deletePharmacyProductApi = async (token, slug) => {
  const response = await fetch(`${PRODUCT_ENDPOINTS.BASE}${slug}/`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to delete product');
  }
  return true;
};

export const updatePharmacyInventoryApi = async (token, slug, quantity) => {
  const response = await fetch(`${PRODUCT_ENDPOINTS.BASE}${slug}/inventory/`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quantity_in_stock: quantity }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to update inventory');
  }
  return data;
};
