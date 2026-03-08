import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

export const adsAdminApi = {
  getList: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/ads/?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch ads list');
    return res.json();
  },

  getDetail: async (token, id) => {
    const res = await fetch(`${API_BASE_URL}/ads/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch ad details');
    return res.json();
  },

  create: async (token, formData) => {
    const res = await fetch(`${API_BASE_URL}/ads/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw err;
    }
    return res.json();
  },

  update: async (token, id, formData) => {
    const res = await fetch(`${API_BASE_URL}/ads/${id}/`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw err;
    }
    return res.json();
  },

  delete: async (token, id) => {
    const res = await fetch(`${API_BASE_URL}/ads/${id}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete ad');
    return true;
  },
};
