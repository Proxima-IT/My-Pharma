import { USER_ENDPOINTS } from '../../(shared)/lib/apiConfig';

/**
 * Pure API functions for User Address Management
 * Aligned with /api/auth/addresses/ documentation
 */
export const addressApi = {
  // List all addresses (Paginated)
  getAddresses: async token => {
    const response = await fetch(USER_ENDPOINTS.ADDRESSES, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.detail || 'Failed to fetch addresses');
    return data;
  },

  // Get list of BD districts
  getDistricts: async token => {
    const response = await fetch(`${USER_ENDPOINTS.ADDRESSES}districts/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.detail || 'Failed to fetch districts');
    return data;
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
    if (!response.ok)
      throw new Error(JSON.stringify(data) || 'Failed to add address');
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
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.detail || 'Failed to update address');
    return data;
  },

  // Delete address
  deleteAddress: async (token, id) => {
    const response = await fetch(`${USER_ENDPOINTS.ADDRESSES}${id}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail || 'Failed to delete address');
    }
    return true;
  },
};
