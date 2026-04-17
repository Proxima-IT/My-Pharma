/**
 * Dynamic API Configuration
 * Automatically switches between production server and local development
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

/**
 * API_BASE_URL Logic:
 * - Browser on localhost => talk to local backend directly.
 * - Browser on non-localhost => prefer public env API host
 *   (NEXT_PUBLIC_API_URL, then NEXT_PUBLIC_BACKEND_URL), fallback to same-origin
 *   /api proxy.
 * - Server-side => prefer internal Docker backend URL to avoid public TLS/domain
 *   certificate issues; fallback to env-configured public API URL.
 */
export const API_BASE_URL = isBrowser
  ? (
      isLocalhost
        ? (publicEnvApiBase || 'http://localhost:8080/api')
        : (!envPointsToLocalhost && publicEnvApiBase ? publicEnvApiBase : browserApiBase)
    )
  : (serverApiBase || publicEnvApiBase || 'http://localhost:8080/api');

export const AUTH_ENDPOINTS = {
  ME: `${API_BASE_URL}/auth/me/`,
  LOGIN: `${API_BASE_URL}/auth/login/`,
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

export const WEB_PUSH_VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY || '';

/**
 * Safely parse a fetch response as JSON. When the server returns HTML (e.g. 500
 * error page) instead of JSON, avoids "Unexpected token '<'" and returns a
 * fallback object so callers can show a friendly error.
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
 * Normalize any backend media URL to the frontend proxy path so images load
 * via Next.js rewrite (same-origin). Handles full URLs, /media/... paths, and
 * relative paths like profile_pics/... or products/...
 */
export function getMediaUrl(url) {
  if (!url || typeof url !== 'string') return url;
  const s = url.trim();
  if (!s) return url;
  // Blob or data URLs (e.g. file preview) - use as-is
  if (s.startsWith('blob:') || s.startsWith('data:')) return url;
  // Already a frontend-relative media path
  if (s.startsWith('/media/')) return s;
  // Full URL: strip origin to get /media/... path
  if (s.includes('/media/')) {
    const i = s.indexOf('/media/');
    return s.slice(i);
  }
  // Relative path without /media/ (e.g. profile_pics/2026/03/x.jpeg)
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
