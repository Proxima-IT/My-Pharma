import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

/**
 * My Pharma - Super Admin Logo Management API
 * Updated: GET requests are now public-friendly (token is optional).
 */

export const logoAdminApi = {
  getLogos: async (token, page = 1) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/logos/?page=${page}`, {
      method: 'GET',
      headers: headers,
    });
    if (!response.ok) throw new Error('Failed to fetch logos');
    return response.json();
  },

  createLogo: async (token, formData) => {
    const response = await fetch(`${API_BASE_URL}/logos/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json();
      throw err;
    }
    return response.json();
  },

  getLogoBySlug: async (token, slug) => {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/logos/${slug}/`, {
      method: 'GET',
      headers: headers,
    });
    if (!response.ok) throw new Error('Failed to fetch logo details');
    return response.json();
  },

  patchLogo: async (token, slug, formData) => {
    const response = await fetch(`${API_BASE_URL}/logos/${slug}/`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json();
      throw err;
    }
    return response.json();
  },

  deleteLogo: async (token, slug) => {
    const response = await fetch(`${API_BASE_URL}/logos/${slug}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to delete logo');
    }
    return true;
  },
};
