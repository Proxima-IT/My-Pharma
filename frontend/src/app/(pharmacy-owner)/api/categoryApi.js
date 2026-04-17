import { CATEGORY_ENDPOINTS } from '@/app/(shared)/lib/apiConfig';

/**
 * Pure API functions for Category Management
 */

export const fetchCategoriesApi = async (token, params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null && v !== ''),
  );
  const queryString = new URLSearchParams(cleanParams).toString();
  const url = `${CATEGORY_ENDPOINTS.BASE}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok)
    throw new Error(data.detail || 'Failed to fetch categories');
  return data;
};

export const fetchCategoryDetailsApi = async (token, slug) => {
  const response = await fetch(`${CATEGORY_ENDPOINTS.BASE}${slug}/`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok)
    throw new Error(data.detail || 'Failed to fetch category details');
  return data;
};

export const createCategoryApi = async (token, payload) => {
  // Check if payload contains a File object (for image uploads)
  const hasFile = Object.values(payload).some(value => value instanceof File);

  let headers = {
    Authorization: `Bearer ${token}`,
  };

  let body;
  if (hasFile) {
    // Use FormData for file uploads
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value);
      }
    });
    body = formData;
  } else {
    // Use JSON for regular data
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(payload);
  }

  const response = await fetch(CATEGORY_ENDPOINTS.BASE, {
    method: 'POST',
    headers,
    body,
  });

  const data = await response.json();
  if (!response.ok)
    throw new Error(JSON.stringify(data) || 'Failed to create category');
  return data;
};

export const updateCategoryApi = async (token, slug, payload) => {
  // Check if payload contains a File object (for image uploads)
  const hasFile = Object.values(payload).some(value => value instanceof File);

  let headers = {
    Authorization: `Bearer ${token}`,
  };

  let body;
  if (hasFile) {
    // Use FormData for file uploads
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value);
      }
    });
    body = formData;
  } else {
    // Use JSON for regular data
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(payload);
  }

  const response = await fetch(`${CATEGORY_ENDPOINTS.BASE}${slug}/`, {
    method: 'PATCH',
    headers,
    body,
  });

  const data = await response.json();
  if (!response.ok)
    throw new Error(JSON.stringify(data) || 'Failed to update category');
  return data;
};

export const deleteCategoryApi = async (token, slug) => {
  const response = await fetch(`${CATEGORY_ENDPOINTS.BASE}${slug}/`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to delete category');
  }
  return true;
};

/**
 * Fetches hierarchical category tree
 * Useful for selecting parent categories in the form
 */
export const fetchCategoryTreeApi = async token => {
  const response = await fetch(`${CATEGORY_ENDPOINTS.BASE}tree/`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error('Failed to fetch category tree');
  return data;
};
