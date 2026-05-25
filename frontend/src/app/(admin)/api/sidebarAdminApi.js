import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

/**
 * My Pharma - Super Admin Sidebar Management API (Method B: Custom Sidebar Items)
 * Handles CRUD for custom sidebar entries that are independent of product categories.
 */
export const sidebarAdminApi = {
  /**
   * GET /api/sidebar-categories/
   * List all custom sidebar categories.
   */
  getCustomSidebarCategories: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/sidebar-categories/?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch custom sidebar list');
    return res.json();
  },

  /**
   * GET /api/sidebar-categories/{id}/
   * Retrieve details for a specific custom sidebar item.
   */
  getCustomSidebarCategoryById: async (token, id) => {
    const res = await fetch(`${API_BASE_URL}/sidebar-categories/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch custom sidebar item details');
    return res.json();
  },

  /**
   * POST /api/sidebar-categories/
   * Create a new custom sidebar item.
   * @param {FormData} formData - Contains 'title' and 'image' (file).
   */
  createCustomSidebarCategory: async (token, formData) => {
    const res = await fetch(`${API_BASE_URL}/sidebar-categories/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      // Content-Type is omitted to let the browser set boundary for multipart/form-data
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw err;
    }
    return res.json();
  },

  /**
   * PATCH /api/sidebar-categories/{id}/
   * Update an existing custom sidebar item.
   * @param {FormData} formData - Contains 'title' and/or 'image' (file).
   */
  updateCustomSidebarCategory: async (token, id, formData) => {
    const res = await fetch(`${API_BASE_URL}/sidebar-categories/${id}/`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw err;
    }
    return res.json();
  },

  /**
   * DELETE /api/sidebar-categories/{id}/
   * Remove a custom sidebar item from the system.
   */
  deleteCustomSidebarCategory: async (token, id) => {
    const res = await fetch(`${API_BASE_URL}/sidebar-categories/${id}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete custom sidebar item');
    return true;
  },
};
