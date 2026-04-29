import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

export const unitAdminApi = {
  // List all units (search + pagination)
  getUnits: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/units/?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to load units.');
    return res.json();
  },

  // Get a single unit by slug
  getUnitBySlug: async (token, slug) => {
    const res = await fetch(`${API_BASE_URL}/units/${slug}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Unit not found.');
    return res.json();
  },

  // Create a new unit
  createUnit: async (token, data) => {
    const res = await fetch(`${API_BASE_URL}/units/`, {
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

  // Update an existing unit
  updateUnit: async (token, slug, data) => {
    const res = await fetch(`${API_BASE_URL}/units/${slug}/`, {
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

  // Delete a unit
  deleteUnit: async (token, slug) => {
    const res = await fetch(`${API_BASE_URL}/units/${slug}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete unit.');
    return true;
  },
};
