import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

export const sidebarAdminApi = {
  // 1. Get all sidebar categories
  getList: async token => {
    const res = await fetch(`${API_BASE_URL}/sidebar-categories/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch sidebar list');
    return res.json();
  },

  // 2. Get single item details
  getDetail: async (token, id) => {
    const res = await fetch(`${API_BASE_URL}/sidebar-categories/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch item details');
    return res.json();
  },

  // 3. Create new sidebar item (using FormData for image upload)
  create: async (token, formData) => {
    const res = await fetch(`${API_BASE_URL}/sidebar-categories/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData, // Browser sets Content-Type to multipart/form-data automatically
    });
    if (!res.ok) {
      const err = await res.json();
      throw err;
    }
    return res.json();
  },

  // 4. Update sidebar item
  update: async (token, id, formData) => {
    const res = await fetch(`${API_BASE_URL}/sidebar-categories/${id}/`, {
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

  // 5. Delete sidebar item
  delete: async (token, id) => {
    const res = await fetch(`${API_BASE_URL}/sidebar-categories/${id}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete item');
    return true;
  },
};
