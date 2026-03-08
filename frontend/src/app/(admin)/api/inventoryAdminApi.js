import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

export const inventoryAdminApi = {
  /**
   * GET /api/products/inventory-list/
   * Fetches products with inventory-specific fields (stock, threshold, low_stock status)
   */
  getInventoryList: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(
      `${API_BASE_URL}/products/inventory-list/?${query}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!res.ok) throw new Error('Failed to fetch inventory records.');
    return res.json();
  },

  /**
   * PATCH /api/products/{slug}/inventory/
   * Updates quantity_in_stock and/or low_stock_threshold
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
      throw err;
    }
    return res.json();
  },
};
