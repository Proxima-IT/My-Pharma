import { PRODUCT_ENDPOINTS } from '@/app/(shared)/lib/apiConfig';

/**
 * Pure API functions for Product management
 */

// Helper to get token (since this is a public API that might need auth)
const getAuthHeader = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {};
};

/**
 * GET /api/products/
 */
export const fetchProductsApi = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = `${PRODUCT_ENDPOINTS.BASE}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(), // Added Auth Header
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch products');
  }
  return data;
};

/**
 * GET /api/products/{slug}/
 */
export const fetchProductDetailsApi = async slug => {
  const response = await fetch(`${PRODUCT_ENDPOINTS.BASE}${slug}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(), // Added Auth Header
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch product details');
  }
  return data;
};
