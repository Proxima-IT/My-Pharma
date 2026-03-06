import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

export const categoryAdminApi = {
  // ১. সব গ্রুপের লিস্ট দেখা (Pagination সহ)
  getCategories: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/categories/?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('গ্রুপ লিস্ট পাওয়া যায়নি।');
    return res.json();
  },

  // ২. গ্রুপের হায়ারার্কি বা ট্রি দেখা (ড্রপডাউনের জন্য)
  getCategoryTree: async token => {
    const res = await fetch(`${API_BASE_URL}/categories/tree/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('গ্রুপ ট্রি পাওয়া যায়নি।');
    return res.json();
  },

  // ৩. নির্দিষ্ট একটি গ্রুপের বিস্তারিত তথ্য দেখা
  getCategoryBySlug: async (token, slug) => {
    const res = await fetch(`${API_BASE_URL}/categories/${slug}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('গ্রুপের তথ্য পাওয়া যায়নি।');
    return res.json();
  },

  // ৪. নতুন গ্রুপ তৈরি করা
  createCategory: async (token, data) => {
    const res = await fetch(`${API_BASE_URL}/categories/`, {
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

  // ৫. গ্রুপের তথ্য আপডেট করা
  updateCategory: async (token, slug, data) => {
    const res = await fetch(`${API_BASE_URL}/categories/${slug}/`, {
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

  // ৬. গ্রুপ ডিলিট করা
  deleteCategory: async (token, slug) => {
    const res = await fetch(`${API_BASE_URL}/categories/${slug}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  },
};
