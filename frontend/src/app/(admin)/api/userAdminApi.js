import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

export const userAdminApi = {
  // List all users with pagination and search
  getUsers: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/auth/admin/users/?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  // Get single user details
  getUserDetails: async (token, id) => {
    const res = await fetch(`${API_BASE_URL}/auth/admin/users/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch user details');
    return res.json();
  },

  // Create new user
  createUser: async (token, data) => {
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

  // Update user (Partial update using PATCH)
  updateUser: async (token, id, data) => {
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

  // Delete user
  deleteUser: async (token, id) => {
    const res = await fetch(`${API_BASE_URL}/auth/admin/users/${id}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete user');
    return true;
  },
};
