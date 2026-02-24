import { API_BASE_URL } from '@/app/(user)/lib/apiConfig';

export const requestPasswordResetApi = async (email) => {
  const response = await fetch(`${API_BASE_URL}/auth/password-reset/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to process request.');
  }
  return data;
};