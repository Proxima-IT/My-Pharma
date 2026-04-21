import { AUTH_ENDPOINTS } from '../../(shared)/lib/apiConfig';
import {
  authenticatedFetch,
  parseJsonResponse,
} from '../../(shared)/lib/authenticatedApi';

/**
 * Pure API functions for Profile and Identity management
 */

export const fetchProfileApi = async () => {
  const response = await authenticatedFetch(AUTH_ENDPOINTS.ME, {
    method: 'GET',
  });
  const data = await parseJsonResponse(response);
  if (!response.ok) throw new Error(data.detail || 'Failed to fetch profile');
  return data;
};

export const updateProfileApi = async formData => {
  const response = await authenticatedFetch(AUTH_ENDPOINTS.ME, {
    method: 'PUT',
    body: formData, // FormData handles its own boundaries
  });
  const data = await parseJsonResponse(response);
  if (!response.ok) throw new Error(data.detail || 'Failed to update profile');
  return data;
};

export const requestVerificationOtpApi = async payload => {
  const response = await authenticatedFetch(AUTH_ENDPOINTS.ME, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonResponse(response);
  if (!response.ok) throw new Error(data.detail || 'Failed to send code');
  return data;
};

export const verifyIdentityOtpApi = async payload => {
  const response = await authenticatedFetch(AUTH_ENDPOINTS.ME, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonResponse(response);
  if (!response.ok) throw new Error(data.detail || 'Invalid code');
  return data;
};
