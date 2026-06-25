import { API_BASE_URL, parseJsonResponse } from '@/app/(shared)/lib/apiConfig';

const AUTH_BASE = `${API_BASE_URL}/auth`;

export const requestOtpApi = async (identifier, purpose) => {
  const isEmail = identifier.includes('@');
  const payload = isEmail ? { email: identifier.toLowerCase() } : { phone: identifier };
  if (purpose) payload.purpose = purpose;

  const response = await fetch(`${AUTH_BASE}/request-otp/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonResponse(response);
  if (!response.ok) throw new Error(data.detail || 'Failed to send OTP');
  return data;
};

export const verifyOtpApi = async (identifier, otp, purpose) => {
  const isEmail = identifier.includes('@');
  const payload = {
    [isEmail ? 'email' : 'phone']: isEmail ? identifier.toLowerCase() : identifier,
    otp,
  };
  if (purpose) payload.purpose = purpose;

  const response = await fetch(`${AUTH_BASE}/verify-otp/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
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