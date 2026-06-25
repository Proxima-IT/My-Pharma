import { API_BASE_URL, parseJsonResponse } from '@/app/(shared)/lib/apiConfig';

export const requestPasswordResetApi = async payload => {
  const response = await fetch(`${API_BASE_URL}/auth/password-reset/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to process request.');
  }
  return data;
};

export const verifyPasswordResetOtpApi = async (phone, otp) => {
  const response = await fetch(`${API_BASE_URL}/auth/password-reset/verify-otp/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, otp }),
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Invalid or expired OTP.');
  }
  return data;
};

