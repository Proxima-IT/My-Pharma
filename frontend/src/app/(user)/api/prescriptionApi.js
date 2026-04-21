import { USER_ENDPOINTS } from '../../(shared)/lib/apiConfig';
import {
  authenticatedFetch,
  parseJsonResponse,
} from '../../(shared)/lib/authenticatedApi';

/**
 * Pure API functions for Prescription management
 */
export const fetchPrescriptionsApi = async (filter = 'All') => {
  const statusParam = filter !== 'All' ? `?status=${filter.toUpperCase()}` : '';

  const response = await authenticatedFetch(
    `${USER_ENDPOINTS.PRESCRIPTIONS}${statusParam}`,
    {
      method: 'GET',
    },
  );

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch prescriptions');
  }
  return data;
};

/**
 * Uploads a new prescription file
 */
export const uploadPrescriptionApi = async formData => {
  const response = await authenticatedFetch(USER_ENDPOINTS.PRESCRIPTIONS, {
    method: 'POST',
    body: formData,
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to upload prescription');
  }
  return data;
};
