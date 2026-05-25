import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

/**
 * My Pharma - Super Admin Blog Management API
 * Handles CRUD for Blog Categories and Blog Posts.
 */
export const blogAdminApi = {
  // --- CATEGORIES ---
  
  getCategories: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/blog-categories/?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch blog categories');
    return res.json();
  },

  createCategory: async (token, data) => {
    const res = await fetch(`${API_BASE_URL}/blog-categories/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  updateCategory: async (token, slug, data) => {
    const res = await fetch(`${API_BASE_URL}/blog-categories/${slug}/`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  deleteCategory: async (token, slug) => {
    const res = await fetch(`${API_BASE_URL}/blog-categories/${slug}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  },

  // --- POSTS ---

  getPosts: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/blog-posts/?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch blog posts');
    return res.json();
  },

  getPostBySlug: async (token, slug) => {
    const res = await fetch(`${API_BASE_URL}/blog-posts/${slug}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch blog post details');
    return res.json();
  },

  /**
   * Create Post (Multipart for article_image)
   */
  createPost: async (token, formData) => {
    const res = await fetch(`${API_BASE_URL}/blog-posts/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  /**
   * Update Post (Multipart for article_image)
   */
  updatePost: async (token, slug, formData) => {
    const res = await fetch(`${API_BASE_URL}/blog-posts/${slug}/`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  deletePost: async (token, slug) => {
    const res = await fetch(`${API_BASE_URL}/blog-posts/${slug}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  },
};