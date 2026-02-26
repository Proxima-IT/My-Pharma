export const API_BASE_URL = 'http://localhost:8000/api';

export const AUTH_ENDPOINTS = {
  ME: `${API_BASE_URL}/auth/me/`,
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
