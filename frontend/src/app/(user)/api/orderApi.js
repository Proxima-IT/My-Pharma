import { USER_ENDPOINTS } from '../lib/apiConfig';

/**
 * Pure API functions for Order management
 */
export const fetchOrdersApi = async (token, filter = 'All', page = 1) => {
  const params = new URLSearchParams();
  if (filter !== 'All') params.append('status', filter.toUpperCase());
  params.append('page', page);

  const response = await fetch(
    `${USER_ENDPOINTS.ORDERS}?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch orders');
  }
  return data;
};

export const fetchOrderDetailsApi = async (token, id) => {
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
