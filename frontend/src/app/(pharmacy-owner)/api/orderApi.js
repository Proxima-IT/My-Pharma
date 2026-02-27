import { USER_ENDPOINTS } from '@/app/(shared)/lib/apiConfig';

/**
 * Pure API functions for Pharmacy Order Management
 */

/**
 * GET /api/orders/
 * Fetches a paginated list of all orders for the pharmacy.
 */
export const fetchPharmacyOrdersApi = async (token, page = 1) => {
  const response = await fetch(`${USER_ENDPOINTS.ORDERS}?page=${page}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch pharmacy orders');
  }
  return data;
};

/**
 * GET /api/orders/{id}/
 * Fetches full details of a specific order.
 */
export const fetchPharmacyOrderDetailsApi = async (token, id) => {
  const response = await fetch(`${USER_ENDPOINTS.ORDERS}${id}/`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch order details');
  }
  return data;
};

/**
 * PATCH /api/orders/{id}/
 * Updates the status of an order (e.g., PENDING, SHIPPED, DELIVERED).
 */
export const updateOrderStatusApi = async (token, id, status) => {
  const response = await fetch(`${USER_ENDPOINTS.ORDERS}${id}/`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to update order status');
  }
  return data;
};
