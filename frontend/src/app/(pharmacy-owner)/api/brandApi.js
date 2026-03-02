import { BRAND_ENDPOINTS } from '@/app/(shared)/lib/apiConfig';

/**
 * Pure API functions for Brand Management
 */

export const fetchBrandsApi = async (token, params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null && v !== ''),
  );
  const queryString = new URLSearchParams(cleanParams).toString();
  const url = `${BRAND_ENDPOINTS.BASE}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to fetch brands');
  return data;
};

export const fetchBrandDetailsApi = async (token, slug) => {
  const response = await fetch(`${BRAND_ENDPOINTS.BASE}${slug}/`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok)
    throw new Error(data.detail || 'Failed to fetch brand details');
  return data;
};

export const createBrandApi = async (token, payload) => {
  const response = await fetch(BRAND_ENDPOINTS.BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok)
    throw new Error(JSON.stringify(data) || 'Failed to create brand');
  return data;
};

export const updateBrandApi = async (token, slug, payload) => {
  const response = await fetch(`${BRAND_ENDPOINTS.BASE}${slug}/`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok)
    throw new Error(JSON.stringify(data) || 'Failed to update brand');
  return data;
};

export const deleteBrandApi = async (token, slug) => {
  const response = await fetch(`${BRAND_ENDPOINTS.BASE}${slug}/`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to delete brand');
  }
  return true;
};
