import {
  fetchWithAuth,
  parseJsonResponse,
  API_BASE_URL,
} from '@/app/(shared)/lib/apiConfig';

/**
 * Akkhar-Labs :: Wishlist API Service
 * =====================================
 * Implements the Wishlist CRUD API specification.
 * Handles item listing, addition, and dual-mode removal.
 */

export const wishlistApi = {
  /**
   * GET /api/wishlist/
   * Fetches paginated wishlist items for the authenticated user.
   */
  getWishlist: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/wishlist/${queryString ? `?${queryString}` : ''}`;

    const response = await fetchWithAuth(url, {
      method: 'GET',
    });

    const data = await parseJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to fetch wishlist items');
    }
    return data;
  },

  /**
   * POST /api/wishlist/
   * Adds a product to the user's wishlist.
   * @param {number} productId - The ID of the product to add.
   */
  addToWishlist: async productId => {
    const response = await fetchWithAuth(`${API_BASE_URL}/wishlist/`, {
      method: 'POST',
      body: JSON.stringify({ product: productId }),
    });

    const data = await parseJsonResponse(response);
    if (!response.ok) {
      // Handle array-based validation errors from backend
      const errorMessage = data.product
        ? data.product[0]
        : data.detail || 'Failed to add to wishlist';
      throw new Error(errorMessage);
    }
    return data;
  },

  /**
   * DELETE /api/wishlist/{id}/
   * Removes an entry using the Wishlist Item ID.
   */
  removeFromWishlistById: async wishlistItemId => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/wishlist/${wishlistItemId}/`,
      {
        method: 'DELETE',
      },
    );

    if (!response.ok) {
      const data = await parseJsonResponse(response, {});
      throw new Error(data.detail || 'Failed to remove from wishlist');
    }
    return true;
  },

  /**
   * POST /api/wishlist/remove/
   * Custom Toggle Action: Removes a product directly using the Product ID.
   * @param {number} productId - The ID of the product to remove.
   */
  removeFromWishlistByProductId: async productId => {
    const response = await fetchWithAuth(`${API_BASE_URL}/wishlist/remove/`, {
      method: 'POST',
      body: JSON.stringify({ product: productId }),
    });

    const data = await parseJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to remove product from wishlist');
    }
    return data;
  },
};
