import { API_BASE_URL } from '@/app/(user)/lib/apiConfig';

export const confirmPasswordResetApi = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/auth/password-reset/confirm/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to reset password. Link may be expired.');
  }
  return data;
};