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

/**
 * Uploads a new prescription file
 */
export const uploadPrescriptionApi = async (token, formData) => {
  const response = await fetch(USER_ENDPOINTS.PRESCRIPTIONS, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // Do NOT set Content-Type for FormData; browser handles it
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to upload prescription');
  }
  return data;
};
