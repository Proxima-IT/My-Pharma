import {
  API_BASE_URL,
  fetchWithAuth,
  parseJsonResponse,
} from '@/app/(shared)/lib/apiConfig';

/**
 * My Pharma - Order Management API
 * Refactored: Uses fetchWithAuth interceptor for automatic token injection and silent refresh.
 */
export const orderApi = {
  /**
   * GET /api/orders/
   * List orders for the authenticated user.
   */
  getOrders: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetchWithAuth(`${API_BASE_URL}/orders/?${query}`, {
      method: 'GET',
    });

    const data = await parseJsonResponse(response);
    if (!response.ok) throw new Error(data.detail || 'Failed to fetch orders');
    return data;
  },

  /**
   * GET /api/delivery-durations/
   */
  getDeliveryDurations: async token => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/delivery-durations/`,
      {
        method: 'GET',
      },
    );

    const data = await parseJsonResponse(response);
    if (!response.ok)
      throw new Error(data.detail || 'Failed to fetch delivery durations');
    return data;
  },

  /**
   * POST /api/prescription-orders/
   * Place an order using a prescription (Multipart/FormData)
   */
  createPrescriptionOrder: async (token, formData) => {
    // Note: When sending FormData, we don't set Content-Type header manually
    // to allow the browser to set the correct boundary.
    // fetchWithAuth handles the Authorization token.
    const response = await fetchWithAuth(
      `${API_BASE_URL}/prescription-orders/`,
      {
        method: 'POST',
        body: formData,
        headers: {
          // Explicitly override to prevent automatic JSON content-type if needed
          'Content-Type': null,
        },
      },
    );

    const data = await parseJsonResponse(response);
    if (!response.ok) {
      throw data;
    }
    return data;
  },

  /**
   * GET /api/orders/{id}/
   */
  getOrderDetails: async (token, orderId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/orders/${orderId}/`, {
      method: 'GET',
    });

    const data = await parseJsonResponse(response);
    if (!response.ok) throw new Error(data.detail || 'Order not found');
    return data;
  },

  /**
   * POST /api/orders/<id>/pay/
   * Initiate payment for an unpaid online order.
   */
  payOrder: async (token, orderId, paymentMethod = 'ONLINE') => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/orders/${orderId}/pay/`,
      {
        method: 'POST',
        body: JSON.stringify({ payment_method: paymentMethod }),
      },
    );

    const data = await parseJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to initiate payment');
    }
    return data;
  },
};
