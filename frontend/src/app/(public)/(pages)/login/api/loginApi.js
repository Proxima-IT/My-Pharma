import { API_BASE_URL, parseJsonResponse } from '@/app/(shared)/lib/apiConfig';

/**
 * My Pharma - User Login API
 * Updated: Fetches and returns both access and refresh tokens from the backend.
 */
export const loginApi = async credentials => {
  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.detail || 'Invalid email or password.');
  }

  // Expecting data to contain: { access: "...", refresh: "...", user: {...} }
  return data;
};
