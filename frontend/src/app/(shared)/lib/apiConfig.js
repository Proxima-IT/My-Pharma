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

/**
 * API_BASE_URL Logic:
 * 1. Uses NEXT_PUBLIC_API_URL if defined in .env
 * 2. Falls back to localhost:8000 if on a local machine
 * 3. Falls back to the VPS IP if running in production
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (isLocalhost
    ? 'http://localhost:8000/api'
    : 'http://46.202.194.251:8000/api');

export const AUTH_ENDPOINTS = {
  ME: `${API_BASE_URL}/auth/me/`,
  LOGIN: `${API_BASE_URL}/auth/login/`,
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