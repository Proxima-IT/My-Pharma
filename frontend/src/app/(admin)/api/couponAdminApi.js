import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

/**
 * My Pharma - Super Admin Coupon Management API
 * Handles CRUD operations for promotional discount codes.
 * Note: Uses JSON payloads as coupons do not require binary/image data.
 */
export const couponAdminApi = {
  /**
   * List all coupons with optional filtering
   * @param {string} token - Admin access token
   * @param {Object} params - { page, discount_type, is_active }
   */
  getCoupons: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/coupons/?${query}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch coupons list');
    return response.json();
  },

  /**
   * Get a single coupon by ID
   * @param {string} token
   * @param {number} id
   */
  getCouponById: async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/coupons/${id}/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Coupon details not found');
    return response.json();
  },

  /**
   * Create a new coupon
   * @param {string} token
   * @param {Object} data - { code, discount_type, discount_value, min_order_amount, valid_from, valid_until, max_uses, is_active }
   */
  createCoupon: async (token, data) => {
    const response = await fetch(`${API_BASE_URL}/coupons/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw result;
    }
    return result;
  },

  /**
   * Update an existing coupon (Partial Update)
   * @param {string} token
   * @param {number} id
   * @param {Object} data
   */
  updateCoupon: async (token, id, data) => {
    const response = await fetch(`${API_BASE_URL}/coupons/${id}/`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw result;
    }
    return result;
  },

  /**
   * Delete a coupon
   * @param {string} token
   * @param {number} id
   */
  deleteCoupon: async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/coupons/${id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to delete coupon');
    }
    return true;
  },
};
