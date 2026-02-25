import { USER_ENDPOINTS } from '../lib/apiConfig';

export const addressApi = {
  // List all addresses
  getAddresses: async token => {
    const response = await fetch(USER_ENDPOINTS.ADDRESSES, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch addresses');
    return response.json();
  },

  // Get list of districts
  getDistricts: async token => {
    const response = await fetch(`${USER_ENDPOINTS.ADDRESSES}districts/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch districts');
    return response.json();
  },

  // Add new address
  createAddress: async (token, addressData) => {
    const response = await fetch(USER_ENDPOINTS.ADDRESSES, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addressData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to add address');
    return data;
  },

  // Update address (Partial)
  updateAddress: async (token, id, addressData) => {
    const response = await fetch(`${USER_ENDPOINTS.ADDRESSES}${id}/`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addressData),
    });
    if (!response.ok) throw new Error('Failed to update address');
    return response.json();
  },

  // Delete address
  deleteAddress: async (token, id) => {
    const response = await fetch(`${USER_ENDPOINTS.ADDRESSES}${id}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete address');
    return true;
  },
};
