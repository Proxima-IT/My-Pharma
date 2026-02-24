const API_ORIGIN =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) ||
  'http://46.202.194.251:8000';
export const API_BASE_URL = `${API_ORIGIN}/api`;

export const AUTH_ENDPOINTS = {
  ME: `${API_BASE_URL}/auth/me/`,
  LOGIN: `${API_BASE_URL}/auth/login/`,
  LOGOUT: `${API_BASE_URL}/auth/logout/`,
  REQUEST_OTP: `${API_BASE_URL}/auth/request-otp/`,
  VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp/`,
  REGISTER_COMPLETE: `${API_BASE_URL}/auth/register/complete/`,
  PASSWORD_RESET: `${API_BASE_URL}/auth/password-reset/`,
};

export const USER_ENDPOINTS = {
  ORDERS: `${API_BASE_URL}/orders/`,
  PRESCRIPTIONS: `${API_BASE_URL}/prescriptions/`,
};
