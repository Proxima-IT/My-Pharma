import { API_BASE_URL, fetchWithAuth } from '@/app/(shared)/lib/apiConfig';

/**
 * Pure API functions for Blog management
 * Handles Categories, Post Lists, and Detailed Article retrieval.
 * Uses fetchWithAuth interceptor for silent token refresh and session persistence.
 */

/**
 * GET /api/blog-categories/
 * List all active blog categories for filtering.
 */
export const fetchBlogCategoriesApi = async () => {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/blog-categories/?is_active=true`,
    {
      method: 'GET',
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

  const response = await fetchWithAuth(url, {
    method: 'GET',
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
  const response = await fetchWithAuth(`${API_BASE_URL}/blog-posts/${slug}/`, {
    method: 'GET',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch blog post details');
  }
  return data;
};

