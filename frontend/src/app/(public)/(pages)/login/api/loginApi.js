import { API_BASE_URL } from '@/app/(user)/lib/apiConfig';

export const loginApi = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Invalid email or password.');
  }
  return data;
};