import {
  PRODUCT_ENDPOINTS,
  fetchWithAuth,
  parseJsonResponse,
} from '@/app/(shared)/lib/apiConfig';

/**
 * My Pharma - Public Product API
 * Refactored: Uses fetchWithAuth interceptor for automatic token injection and silent refresh.
 */

export const productApi = {
  /**
   * GET /api/products/
   * Fetches a paginated list of products.
   */
  getProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${PRODUCT_ENDPOINTS.BASE}${queryString ? `?${queryString}` : ''}`;

    const response = await fetchWithAuth(url, {
      method: 'GET',
    });

    const data = await parseJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to fetch products');
    }
    return data;
  },

  /**
   * GET /api/products/{slug}/
   * Fetches full details for a single product, including generic alternatives.
   */
  getProductBySlug: async slug => {
    const response = await fetchWithAuth(`${PRODUCT_ENDPOINTS.BASE}${slug}/`, {
      method: 'GET',
    });

    const data = await parseJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to fetch product details');
    }
    return data;
  },

  /**
   * GET /api/products/{slug}/dosages/
   * List dosage options for a specific product.
   */
  getProductDosages: async slug => {
    const response = await fetchWithAuth(
      `${PRODUCT_ENDPOINTS.BASE}${slug}/dosages/`,
      {
        method: 'GET',
      },
    );

    const data = await parseJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to fetch dosages');
    }
    return data;
  },

  /**
   * GET /api/products/{slug}/images/
   * List gallery images for a specific product.
   */
  getProductImages: async slug => {
    const response = await fetchWithAuth(
      `${PRODUCT_ENDPOINTS.BASE}${slug}/images/`,
      {
        method: 'GET',
      },
    );

    const data = await parseJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to fetch images');
    }
    return data;
  },
};

// Backwards compatibility for existing hook references
export const fetchProductsApi = productApi.getProducts;
export const fetchProductDetailsApi = productApi.getProductBySlug;
