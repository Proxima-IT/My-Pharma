import { USER_ENDPOINTS } from '../lib/apiConfig';

/**
 * Pure API functions for Order management
 */
export const fetchOrdersApi = async (token, filter = 'All') => {
  const statusParam = filter !== 'All' ? `?status=${filter.toUpperCase()}` : '';

  const response = await fetch(`${USER_ENDPOINTS.ORDERS}${statusParam}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch orders');
  }
  return data;
};
