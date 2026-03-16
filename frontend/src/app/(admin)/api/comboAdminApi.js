import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

/**
 * My Pharma - Super Admin Combo Management API
 * Handles CRUD operations for product bundles/combos.
 * Uses FormData to support image uploads.
 */

export const comboAdminApi = {
  /**
   * List all combos with optional filtering
   * @param {string} token - Admin access token
   * @param {Object} params - { page, is_active }
   */
  getCombos: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/combos/?${query}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch combos list');
    return response.json();
  },

  /**
   * Get a single combo by ID
   * @param {string} token
   * @param {number} id
   */
  getComboById: async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/combos/${id}/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch combo details');
    return response.json();
  },

  /**
   * Create a new combo
   * @param {string} token
   * @param {FormData} formData - Includes title, description, image, link, price, original_price, order, is_active
   */
  createCombo: async (token, formData) => {
    const response = await fetch(`${API_BASE_URL}/combos/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // Content-Type is automatically set by the browser for FormData
      },
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json();
      throw err;
    }
    return response.json();
  },

  /**
   * Update an existing combo (Partial Update)
   * @param {string} token
   * @param {number} id
   * @param {FormData} formData
   */
  updateCombo: async (token, id, formData) => {
    const response = await fetch(`${API_BASE_URL}/combos/${id}/`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json();
      throw err;
    }
    return response.json();
  },

  /**
   * Delete a combo
   * @param {string} token
   * @param {number} id
   */
  deleteCombo: async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/combos/${id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to delete combo');
    }
    return true;
  },
};
