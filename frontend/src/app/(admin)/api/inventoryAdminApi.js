import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

/**
 * My Pharma - Inventory Management API
 * Dedicated endpoints for stock control and low-stock threshold management.
 */
export const inventoryAdminApi = {
  /**
   * GET /api/products/inventory-list/
   * Fetches a paginated list of products optimized for inventory management.
   * Includes fields: quantity_in_stock, low_stock_threshold, is_low_stock.
   * @param {string} token - Admin access token.
   * @param {Object} params - Search and pagination filters.
   */
  getInventoryList: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(
      `${API_BASE_URL}/products/inventory-list/?${query}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    if (!res.ok) throw new Error('Failed to fetch inventory records.');
    return res.json();
  },

  /**
   * PATCH /api/products/{slug}/inventory/
   * Focused update for inventory-specific parameters.
   * @param {string} token - Admin access token.
   * @param {string} slug - Unique product identifier.
   * @param {Object} data - { quantity_in_stock?, low_stock_threshold? }
   */
  patchStock: async (token, slug, data) => {
    const res = await fetch(`${API_BASE_URL}/products/${slug}/inventory/`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      // Throwing the specific detail from backend if available
      throw new Error(
        err.detail || JSON.stringify(err) || 'Failed to update stock levels.',
      );
    }
    return res.json();
  },
};
