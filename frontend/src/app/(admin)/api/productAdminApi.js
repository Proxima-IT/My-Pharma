import {
  API_BASE_URL,
  fetchWithAuth,
  parseJsonResponse,
} from '@/app/(shared)/lib/apiConfig';

/**
 * My Pharma - Super Admin Product Management API
 * Refactored: Uses fetchWithAuth interceptor for session persistence.
 * Supports extended medical metadata including Indications, Pharmacology, Side Effects, etc.
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
   * Fields: indications, therapeutic_class, pharmacology, dosage_administration,
   * interaction, contraindications, side_effects, pregnancy_lactation,
   * precautions_warnings, overdose_effects, storage_conditions, mode_of_action,
   * drug_classes, pregnancy, alternative_products, faq.
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
   * Partial update for all product fields including medical metadata.
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
