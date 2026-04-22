import {
  AUTH_ENDPOINTS,
  fetchWithAuth,
  parseJsonResponse,
} from '@/app/(shared)/lib/apiConfig';

/**
 * My Pharma - Profile and Identity Management API
 * Refactored: Uses fetchWithAuth interceptor for session persistence and automatic retries.
 */

export const fetchProfileApi = async token => {
  const response = await fetchWithAuth(AUTH_ENDPOINTS.ME, {
    method: 'GET',
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) throw new Error(data.detail || 'Failed to fetch profile');
  return data;
};

export const updateProfileApi = async (token, formData) => {
  // Note: When sending FormData, we must ensure the 'Content-Type' is not
  // forced to 'application/json' so the browser can set the multipart boundary.
  const response = await fetchWithAuth(AUTH_ENDPOINTS.ME, {
    method: 'PUT',
    body: formData,
    headers: {
      'Content-Type': null, // This tells our interceptor not to force JSON headers
    },
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) throw new Error(data.detail || 'Failed to update profile');
  return data;
};

export const requestVerificationOtpApi = async (token, payload) => {
  const response = await fetchWithAuth(AUTH_ENDPOINTS.ME, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) throw new Error(data.detail || 'Failed to send code');
  return data;
};

export const verifyIdentityOtpApi = async (token, payload) => {
  const response = await fetchWithAuth(AUTH_ENDPOINTS.ME, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) throw new Error(data.detail || 'Invalid code');
  return data;
};
