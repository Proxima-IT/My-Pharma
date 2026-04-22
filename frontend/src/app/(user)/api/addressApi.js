import {
  USER_ENDPOINTS,
  fetchWithAuth,
  parseJsonResponse,
} from '@/app/(shared)/lib/apiConfig';

/**
 * Pure API functions for User Address Management
 * Refactored: Uses fetchWithAuth interceptor for automatic token injection and silent refresh.
 */
export const addressApi = {
  // List all addresses (Paginated)
  getAddresses: async token => {
    const response = await fetchWithAuth(USER_ENDPOINTS.ADDRESSES, {
      method: 'GET',
    });
    const data = await parseJsonResponse(response);
    if (!response.ok)
      throw new Error(data.detail || 'Failed to fetch addresses');
    return data;
  },

  // Get list of BD districts
  getDistricts: async token => {
    const response = await fetchWithAuth(
      `${USER_ENDPOINTS.ADDRESSES}districts/`,
      {
        method: 'GET',
      },
    );
    const data = await parseJsonResponse(response);
    if (!response.ok)
      throw new Error(data.detail || 'Failed to fetch districts');
    return data;
  },

  // Add new address
  createAddress: async (token, addressData) => {
    const response = await fetchWithAuth(USER_ENDPOINTS.ADDRESSES, {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
    const data = await parseJsonResponse(response);
    if (!response.ok)
      throw new Error(JSON.stringify(data) || 'Failed to add address');
    return data;
  },

  // Update address (Partial)
  updateAddress: async (token, id, addressData) => {
    const response = await fetchWithAuth(`${USER_ENDPOINTS.ADDRESSES}${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(addressData),
    });
    const data = await parseJsonResponse(response);
    if (!response.ok)
      throw new Error(data.detail || 'Failed to update address');
    return data;
  },

  // Delete address
  deleteAddress: async (token, id) => {
    const response = await fetchWithAuth(`${USER_ENDPOINTS.ADDRESSES}${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const data = await parseJsonResponse(response, {});
      throw new Error(data.detail || 'Failed to delete address');
    }
    return true;
  },
};
