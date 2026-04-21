import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

/**
 * My Pharma - Order Management API
 * Updated: Switched to dedicated prescription-orders endpoint.
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
   * Endpoint: /api/prescription-orders/
   * @param {FormData} formData - { images, address, duration, note }
   */
  createPrescriptionOrder: async (token, formData) => {
    const response = await fetch(`${API_BASE_URL}/prescription-orders/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
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

  /**
   * Initiate payment for an unpaid online order.
   * Endpoint: POST /api/orders/<id>/pay/
   * @returns {{ gateway_url: string, tran_id: string }}
   */
  payOrder: async (token, orderId, paymentMethod = 'ONLINE') => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/pay/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ payment_method: paymentMethod }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to initiate payment');
    }
    return data;
  },
};
