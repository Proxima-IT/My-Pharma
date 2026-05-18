import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

export const deliveryMethodAdminApi = {
  // List all delivery methods (search + pagination)
  getMethods: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/delivery-methods/?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to load delivery methods.');
    return res.json();
  },

  // Get a single delivery method by ID
  getMethodById: async (token, id) => {
    const res = await fetch(`${API_BASE_URL}/delivery-methods/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Delivery method not found.');
    return res.json();
  },

  // Create a new delivery method
  createMethod: async (token, data) => {
    const res = await fetch(`${API_BASE_URL}/delivery-methods/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw err;
    }
    return res.json();
  },

  // Update an existing delivery method
  updateMethod: async (token, id, data) => {
    const res = await fetch(`${API_BASE_URL}/delivery-methods/${id}/`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw err;
    }
    return res.json();
  },

  // Delete a delivery method
  deleteMethod: async (token, id) => {
    const res = await fetch(`${API_BASE_URL}/delivery-methods/${id}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete delivery method.');
    return true;
  },
};
