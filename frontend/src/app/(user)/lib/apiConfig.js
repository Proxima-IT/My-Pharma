export const API_BASE_URL = 'http://localhost:8000/api';

export const AUTH_ENDPOINTS = {
  ME: `${API_BASE_URL}/auth/me/`,
  REQUEST_OTP: `${API_BASE_URL}/auth/request-otp/`,
  VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp/`,
};

export const USER_ENDPOINTS = {
  ORDERS: `${API_BASE_URL}/orders/`,
  PRESCRIPTIONS: `${API_BASE_URL}/prescriptions/`,
};
