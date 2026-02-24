import { AUTH_ENDPOINTS } from '../lib/apiConfig';

/**
 * Updates the single address field in the user profile
 */
export const updateAddressApi = async (token, addressValue) => {
  const response = await fetch(AUTH_ENDPOINTS.ME, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ address: addressValue }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to update address');
  return data;
};
