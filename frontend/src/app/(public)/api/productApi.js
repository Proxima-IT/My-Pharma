import { PRODUCT_ENDPOINTS } from '@/app/(shared)/lib/apiConfig';

/**
 * My Pharma - Public Product API
 * Handles product listing, searching, filtering, and detailed retrieval.
 */

const getAuthHeader = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {};
};

export const productApi = {
  /**
   * GET /api/products/
   * Fetches a paginated list of products.
   *
   * Supported Params based on Backend Update:
   * @param {boolean} available - quantity_in_stock > 0
   * @param {number} brand_id - filter by brand
   * @param {string} category - ID, slug, or name
   * @param {boolean} discounted - original_price > price
   * @param {number} ingredient_id - Match products by chemical DNA (Generic Sugggestions)
   * @param {boolean} is_generic - filter for unbranded/generic products
   * @param {number} min_price/max_price - price range filtering
   * @param {string} ordering - price, -price, name, -name, created_at, -created_at
   * @param {string} search - text search
   */
  getProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${PRODUCT_ENDPOINTS.BASE}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    const data = await response.json();
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
    const response = await fetch(`${PRODUCT_ENDPOINTS.BASE}${slug}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    const data = await response.json();
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
    const response = await fetch(`${PRODUCT_ENDPOINTS.BASE}${slug}/dosages/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    const data = await response.json();
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
    const response = await fetch(`${PRODUCT_ENDPOINTS.BASE}${slug}/images/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to fetch images');
    }
    return data;
  },
};

// Backwards compatibility for existing hook references
export const fetchProductsApi = productApi.getProducts;
export const fetchProductDetailsApi = productApi.getProductBySlug;