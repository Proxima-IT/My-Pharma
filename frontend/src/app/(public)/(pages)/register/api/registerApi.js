import { API_BASE_URL, parseJsonResponse } from '@/app/(shared)/lib/apiConfig';

const AUTH_BASE = `${API_BASE_URL}/auth`;

export const requestOtpApi = async (email) => {
  const response = await fetch(`${AUTH_BASE}/request-otp/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await parseJsonResponse(response);
  if (!response.ok) throw new Error(data.detail || 'Failed to send OTP');
  return data;
};

export const verifyOtpApi = async (email, otp) => {
  const response = await fetch(`${AUTH_BASE}/verify-otp/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  const data = await parseJsonResponse(response);
  if (!response.ok) throw new Error(data.detail || 'Invalid OTP');
  return data;
};

export const completeRegistrationApi = async (payload) => {
  const response = await fetch(`${AUTH_BASE}/register/complete/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonResponse(response);
  if (!response.ok) throw new Error(data.detail || 'Registration failed');
  return data;
};