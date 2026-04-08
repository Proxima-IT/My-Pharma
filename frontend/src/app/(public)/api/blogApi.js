import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

/**
 * Pure API functions for Blog management
 * Handles Categories, Post Lists, and Detailed Article retrieval.
 */

// Helper to get token
const getAuthHeader = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {};
};

/**
 * GET /api/blog-categories/
 * List all active blog categories for filtering.
 */
export const fetchBlogCategoriesApi = async () => {
  const response = await fetch(
    `${API_BASE_URL}/blog-categories/?is_active=true`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    },
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch blog categories');
  }
  return data;
};

/**
 * GET /api/blog-posts/
 * Fetches paginated list of posts with optional search and category filters.
 */
export const fetchBlogPostsApi = async (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([_, v]) => v !== undefined && v !== null && v !== '',
    ),
  );

  const queryString = new URLSearchParams(cleanParams).toString();
  const url = `${API_BASE_URL}/blog-posts/${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch blog posts');
  }
  return data;
};

/**
 * GET /api/blog-posts/{slug}/
 * Retrieves a single detailed blog post by its slug.
 */
export const fetchBlogPostDetailsApi = async slug => {
  const response = await fetch(`${API_BASE_URL}/blog-posts/${slug}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch blog post details');
  }
  return data;
};
