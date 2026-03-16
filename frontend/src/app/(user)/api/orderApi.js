import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

/**
 * My Pharma - Order Management API
 * Updated: Improved error handling to return specific backend validation messages.
 */
export const orderApi = {
  getOrders: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/orders/?${query}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  getDeliveryDurations: async token => {
    const response = await fetch(`${API_BASE_URL}/delivery-durations/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch delivery durations');
    return response.json();
  },

  /**
   * Place an order using a prescription
   * @param {FormData} formData - { uploaded_images, duration, message, shipping_address }
   */
  createPrescriptionOrder: async (token, formData) => {
    const response = await fetch(`${API_BASE_URL}/orders/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      // Throw the actual backend error object (e.g., { uploaded_images: [...] })
      throw data;
    }
    return data;
  },

  getOrderDetails: async (token, orderId) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Order not found');
    return response.json();
  },
};