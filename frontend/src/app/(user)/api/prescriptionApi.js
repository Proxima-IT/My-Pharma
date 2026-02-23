import { USER_ENDPOINTS } from '../lib/apiConfig';

/**
 * Pure API functions for Prescription management
 */
export const fetchPrescriptionsApi = async (token, filter = 'All') => {
  const statusParam = filter !== 'All' ? `?status=${filter.toUpperCase()}` : '';

  const response = await fetch(
    `${USER_ENDPOINTS.PRESCRIPTIONS}${statusParam}`,
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
    throw new Error(data.detail || 'Failed to fetch prescriptions');
  }
  return data;
};
