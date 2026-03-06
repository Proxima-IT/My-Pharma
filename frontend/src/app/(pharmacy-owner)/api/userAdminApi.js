import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

export const userAdminApi = {
  getUsers: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    // Removed the extra /api here
    const res = await fetch(`${API_BASE_URL}/auth/admin/users/?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  getUserDetails: async (token, id) => {
    // Removed the extra /api here
    const res = await fetch(`${API_BASE_URL}/auth/admin/users/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch user details');
    return res.json();
  },

  createUser: async (token, data) => {
    // Removed the extra /api here
    const res = await fetch(`${API_BASE_URL}/auth/admin/users/`, {
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

  updateUser: async (token, id, data) => {
    // Removed the extra /api here
    const res = await fetch(`${API_BASE_URL}/auth/admin/users/${id}/`, {
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

  deleteUser: async (token, id) => {
    // Removed the extra /api here
    const res = await fetch(`${API_BASE_URL}/auth/admin/users/${id}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete user');
    return true;
  },
};
