import { API_BASE_URL, parseJsonResponse } from '@/app/(shared)/lib/apiConfig';

export const loginApi = async credentials => {
  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Invalid email or password.');
  }
  return data;
};
