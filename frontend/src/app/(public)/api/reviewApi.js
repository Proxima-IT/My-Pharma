import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

/**
 * My Pharma - Product Review & Rating API
 * Updated to support FormData for binary image uploads and flat API structure.
 */

export const reviewApi = {
  /**
   * Fetch all reviews for a specific product using query parameters
   * @param {number} productId - The unique integer ID of the product
   * @param {number} page - Pagination support
   */
  getProductReviews: async (productId, page = 1) => {
    const response = await fetch(
      `${API_BASE_URL}/reviews/?product=${productId}&page=${page}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (!response.ok) throw new Error('Failed to load reviews');
    return response.json();
  },

  /**
   * Submit a new review
   * @param {string} token - User access token
   * @param {FormData} formData - Multi-part form containing product, rating, title, comment, and images
   */
  postReview: async (token, formData) => {
    const response = await fetch(`${API_BASE_URL}/reviews/`, {
      method: 'POST',
      headers: {
        // Important: Content-Type is NOT set manually for FormData to allow the browser
        // to automatically define the boundary string.
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Throw the full error object so the hook can extract 'detail' or specific field errors
      throw errorData;
    }

    return response.json();
  },
};
