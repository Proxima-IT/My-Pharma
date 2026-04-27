/**
 * Dynamic API Configuration & Authenticated Client (Interceptor)
 * Automatically switches between production server and local development.
 * Handles automatic token refreshing and session persistence.
 */

// Check if we are in a browser environment
const isBrowser = typeof window !== 'undefined';

// Determine if we are running on localhost
const isLocalhost =
  isBrowser &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');

const browserApiBase = isBrowser ? `${window.location.origin}/api` : '';
const serverApiBase = process.env.BACKEND_URL_INTERNAL
  ? `${process.env.BACKEND_URL_INTERNAL.replace(/\/$/, '')}/api`
  : '';

const normalizeApiBase = value => {
  const base = (value || '').replace(/\/$/, '');
  if (!base) return '';
  return base.endsWith('/api') ? base : `${base}/api`;
};

const envApiBase = normalizeApiBase(process.env.NEXT_PUBLIC_API_URL);
const envBackendApiBase = normalizeApiBase(process.env.NEXT_PUBLIC_BACKEND_URL);
const publicEnvApiBase = envApiBase || envBackendApiBase;
const envPointsToLocalhost =
  publicEnvApiBase &&
  /(^https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(publicEnvApiBase);
const localhostDefaultApiBase = 'http://localhost:8000/api';
const safeLocalhostApiBase = envPointsToLocalhost
  ? publicEnvApiBase
  : localhostDefaultApiBase;

/**
 * API_BASE_URL Logic:
 * - Browser on localhost => talk to local backend directly.
 * - Browser on non-localhost => prefer public env API host.
 * - Server-side => prefer internal Docker backend URL.
 */
export const API_BASE_URL = isBrowser
  ? isLocalhost
    ? safeLocalhostApiBase
    : !envPointsToLocalhost && publicEnvApiBase
      ? publicEnvApiBase
      : browserApiBase
  : serverApiBase || publicEnvApiBase || localhostDefaultApiBase;

// --- ENDPOINT DEFINITIONS ---

export const AUTH_ENDPOINTS = {
  ME: `${API_BASE_URL}/auth/me/`,
  LOGIN: `${API_BASE_URL}/auth/login/`,
  REFRESH: `${API_BASE_URL}/auth/token/refresh/`,
  LOGOUT: `${API_BASE_URL}/auth/logout/`,
  REGISTER: `${API_BASE_URL}/auth/register/`,
  REQUEST_OTP: `${API_BASE_URL}/auth/request-otp/`,
  VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp/`,
};

export const USER_ENDPOINTS = {
  ORDERS: `${API_BASE_URL}/orders/`,
  PRESCRIPTIONS: `${API_BASE_URL}/prescriptions/`,
  ADDRESSES: `${API_BASE_URL}/auth/addresses/`,
};

export const CART_ENDPOINTS = {
  BASE: `${API_BASE_URL}/cart/`,
  ADD: `${API_BASE_URL}/cart/add/`,
  ITEMS: `${API_BASE_URL}/cart/items/`,
  PLACE_ORDER: `${API_BASE_URL}/cart/place-order/`,
  SUMMARY: `${API_BASE_URL}/cart/`,
};

export const PRODUCT_ENDPOINTS = {
  BASE: `${API_BASE_URL}/products/`,
};

export const BRAND_ENDPOINTS = {
  BASE: `${API_BASE_URL}/brands/`,
};

export const CATEGORY_ENDPOINTS = {
  BASE: `${API_BASE_URL}/categories/`,
};

export const INGREDIENT_ENDPOINTS = {
  BASE: `${API_BASE_URL}/ingredients/`,
};

export const BLOG_ENDPOINTS = {
  BASE: `${API_BASE_URL}/blog-posts/`,
  CATEGORIES: `${API_BASE_URL}/blog-categories/`,
};

export const NOTIFICATION_ENDPOINTS = {
  BASE: `${API_BASE_URL}/notifications/`,
  PERMISSION: `${API_BASE_URL}/notifications/permission/`,
  SUBSCRIPTIONS: `${API_BASE_URL}/notifications/subscriptions/`,
  BROADCAST: `${API_BASE_URL}/notifications/broadcast/`,
};

export const SETTLEMENT_ENDPOINTS = {
  BASE: `${API_BASE_URL}/settlements/`,
};

export const B2B_ENDPOINTS = {
  COMMISSIONS: `${API_BASE_URL}/b2b/commissions/`,
  CUSTOMERS: `${API_BASE_URL}/b2b/customers/`,
};

export const WEB_PUSH_VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ||
  process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY ||
  '';

// --- AUTHENTICATED FETCH (INTERCEPTOR) ---

/**
 * fetchWithAuth
 * A professional wrapper around native fetch that handles:
 * 1. Automatic Access Token injection.
 * 2. 401 Error interception for Expired Tokens.
 * 3. Silent Refresh using refresh_token.
 * 4. Automatic retry of the original failed request.
 */
export const fetchWithAuth = async (url, options = {}) => {
  if (!isBrowser) return fetch(url, options);

  const accessToken = localStorage.getItem('access_token');

  const authOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  };

  // If Content-Type is explicitly set to null (for FormData), remove it
  if (authOptions.headers['Content-Type'] === null) {
    delete authOptions.headers['Content-Type'];
  }

  let response = await fetch(url, authOptions);

  // INTERCEPTOR: Handle Token Expiration
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token');

    if (refreshToken) {
      try {
        const refreshResponse = await fetch(AUTH_ENDPOINTS.REFRESH, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (refreshResponse.ok) {
          const newData = await refreshResponse.json();
          // Save new valid access token
          localStorage.setItem('access_token', newData.access);

          // RETRY: Re-execute the original request with the NEW token
          authOptions.headers['Authorization'] = `Bearer ${newData.access}`;
          return fetch(url, authOptions);
        }
      } catch (err) {
        console.error('Critical: Token refresh failed', err);
      }
    }

    // Fallback: Clear session if refresh fails or no token exists
    // This will cause AuthGuard to redirect to login on next check
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  return response;
};

// --- HELPER UTILITIES ---

/**
 * Safely parse a fetch response as JSON.
 */
export async function parseJsonResponse(
  response,
  fallback = { detail: 'Something went wrong. Please try again.' },
) {
  const text = await response.text();
  if (!text || text.trim().startsWith('<')) {
    return fallback;
  }
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

/**
 * Normalize any backend media URL to the frontend proxy path.
 */
export function getMediaUrl(url) {
  if (!url || typeof url !== 'string') return url;
  const s = url.trim();
  if (!s || s.startsWith('blob:') || s.startsWith('data:')) return url;
  if (s.startsWith('/media/')) return s;
  if (s.includes('/media/')) {
    return s.slice(s.indexOf('/media/'));
  }
  if (
    s.startsWith('profile_pics/') ||
    s.startsWith('products/') ||
    s.startsWith('media/')
  ) {
    const path = s.startsWith('media/') ? s : `media/${s}`;
    return path.startsWith('/') ? path : `/${path}`;
  }
  return url;
}

/**
 * Resolve the best available image URL for a product object.
 */
export function getProductImageUrl(product) {
  if (!product) return null;
  if (product.image) return getMediaUrl(product.image);
  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = product.images[0];
    const raw =
      typeof first === 'string'
        ? first
        : first?.image_url || first?.image || null;
    return raw ? getMediaUrl(raw) : null;
  }
  return null;
}
