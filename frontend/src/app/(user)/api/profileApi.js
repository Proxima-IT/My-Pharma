import { AUTH_ENDPOINTS } from '../lib/apiConfig';

/**
 * Pure API functions for Profile and Identity management
 */

export const fetchProfileApi = async token => {
  const response = await fetch(AUTH_ENDPOINTS.ME, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to fetch profile');
  return data;
};

export const updateProfileApi = async (token, formData) => {
  const response = await fetch(AUTH_ENDPOINTS.ME, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: formData, // FormData handles its own boundaries
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to update profile');
  return data;
};

export const requestVerificationOtpApi = async payload => {
  const response = await fetch(AUTH_ENDPOINTS.REQUEST_OTP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to send code');
  return data;
};

export const verifyIdentityOtpApi = async payload => {
  const response = await fetch(AUTH_ENDPOINTS.VERIFY_OTP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Invalid code');
  return data;
};
