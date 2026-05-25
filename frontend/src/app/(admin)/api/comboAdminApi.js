import { API_BASE_URL, fetchWithAuth, parseJsonResponse } from '@/app/(shared)/lib/apiConfig';

/**
 * My Pharma - Super Admin Combo Management API
 * Handles CRUD operations for product bundles/combos.
 * Uses fetchWithAuth interceptor for session persistence.
 */
export const comboAdminApi = {
  /**
   * List all combos with optional filtering
   */
  getCombos: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetchWithAuth(`${API_BASE_URL}/combos/?${query}`, {
      method: 'GET',
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) throw new Error(data.detail || 'Failed to fetch combos list');
    return data;
  },

  /**
   * Get a single combo by ID
   */
  getComboById: async (token, id) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/combos/${id}/`, {
      method: 'GET',
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) throw new Error(data.detail || 'Failed to fetch combo details');
    return data;
  },

  /**
   * Create a new combo
   */
  createCombo: async (token, formData) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/combos/`, {
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
   * Update an existing combo (Partial Update)
   */
  updateCombo: async (token, id, formData) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/combos/${id}/`, {
      method: 'PATCH',
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
   * Delete a combo
   */
  deleteCombo: async (token, id) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/combos/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) {
      const data = await parseJsonResponse(res);
      throw new Error(data.detail || 'Failed to delete combo');
    }
    return true;
  },
};
