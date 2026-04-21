/**
 * API utility with automatic token refresh
 * Handles 401 responses by attempting to refresh tokens
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    // Refresh failed, clear tokens and throw error
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    throw new Error('Token refresh failed');
  }

  const data = await response.json();

  // Store new tokens
  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data.access;
};

/**
 * Make authenticated API call with automatic token refresh
 */
export const authenticatedFetch = async (url, options = {}) => {
  const makeRequest = async token => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(url, {
      ...options,
      headers,
    });
  };

  let token = localStorage.getItem('access_token');

  // First attempt
  let response = await makeRequest(token);

  // If 401 and we have a token, try to refresh
  if (response.status === 401 && token) {
    try {
      token = await refreshAccessToken();
      response = await makeRequest(token);
    } catch (refreshError) {
      // Refresh failed, rethrow the original 401
      throw new Error('Authentication failed');
    }
  }

  return response;
};

/**
 * Parse JSON response safely
 */
export const parseJsonResponse = async (
  response,
  fallback = { detail: 'Something went wrong. Please try again.' },
) => {
  const text = await response.text();
  if (!text || text.trim().startsWith('<')) {
    return fallback;
  }
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
};
