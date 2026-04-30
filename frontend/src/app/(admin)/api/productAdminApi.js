import {
  API_BASE_URL,
  fetchWithAuth,
  parseJsonResponse,
} from '@/app/(shared)/lib/apiConfig';

/**
 * My Pharma - Super Admin Product Management API
 * Refactored: Uses fetchWithAuth interceptor for session persistence.
 * Supports extended medical metadata and specialized linking endpoints.
 */
export const productAdminApi = {
  /**
   * GET /api/products/
   */
  getProducts: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetchWithAuth(`${API_BASE_URL}/products/?${query}`, {
      method: 'GET',
    });
    const data = await parseJsonResponse(res);
    if (!res.ok)
      throw new Error(data.detail || 'Failed to fetch product list.');
    return data;
  },

  /**
   * GET /api/products/{slug}/
   */
  getProductBySlug: async (token, slug) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/products/${slug}/`, {
      method: 'GET',
    });
    const data = await parseJsonResponse(res);
    if (!res.ok)
      throw new Error(data.detail || 'Failed to fetch product details.');
    return data;
  },

  /**
   * POST /api/products/
   * Supports full medical metadata via FormData.
   */
  createProduct: async (token, formData) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/products/`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': null, // Let browser set boundary for multipart
      },
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) {
      throw data;
    }
    return data;
  },

  /**
   * POST /api/products/{slug}/link-category/
   * Links a product to a specific category for homepage sectioning.
   * @param {string} token - Admin token
   * @param {string} slug - Product slug
   * @param {Object} data - { category_id: number }
   */
  linkProductToCategory: async (token, slug, data) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/products/${slug}/link-category/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
    const result = await parseJsonResponse(res);
    if (!res.ok) {
      throw result;
    }
    return result;
  },

  /**
   * POST /api/products/{slug}/images/
   */
  uploadGalleryImage: async (token, slug, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const res = await fetchWithAuth(
      `${API_BASE_URL}/products/${slug}/images/`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': null,
        },
      },
    );
    return parseJsonResponse(res);
  },

  /**
   * DELETE /api/products/{slug}/images/{imagePk}/
   */
  deleteGalleryImage: async (token, slug, imagePk) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/products/${slug}/images/${imagePk}/`,
      {
        method: 'DELETE',
      },
    );
    return res.ok;
  },

  /**
   * PATCH /api/products/{slug}/
   * Partial update for all product fields.
   */
  updateProduct: async (token, slug, formData) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/products/${slug}/`, {
      method: 'PATCH',
      body: formData,
      headers: {
        'Content-Type': null,
      },
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) {
      throw data;
    }
    return data;
  },

  /**
   * DELETE /api/products/{slug}/
   */
  deleteProduct: async (token, slug) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/products/${slug}/`, {
      method: 'DELETE',
    });
    return res.ok;
  },
};
