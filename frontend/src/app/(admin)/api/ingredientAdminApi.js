import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

export const ingredientAdminApi = {
  // ১. সব জেনেরিক নামের লিস্ট দেখা (Search এবং Pagination সহ)
  getIngredients: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/ingredients/?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('জেনেরিক নামের লিস্ট পাওয়া যায়নি।');
    return res.json();
  },

  // ২. একটি নির্দিষ্ট জেনেরিক নামের বিস্তারিত তথ্য দেখা
  getIngredientBySlug: async (token, slug) => {
    const res = await fetch(`${API_BASE_URL}/ingredients/${slug}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('তথ্য পাওয়া যায়নি।');
    return res.json();
  },

  // ৩. নতুন জেনেরিক নাম যোগ করা
  createIngredient: async (token, data) => {
    const res = await fetch(`${API_BASE_URL}/ingredients/`, {
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

  // ৪. জেনেরিক নাম আপডেট করা
  updateIngredient: async (token, slug, data) => {
    const res = await fetch(`${API_BASE_URL}/ingredients/${slug}/`, {
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

  // ৫. জেনেরিক নাম ডিলিট করা
  deleteIngredient: async (token, slug) => {
    const res = await fetch(`${API_BASE_URL}/ingredients/${slug}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('ডিলিট করা সম্ভব হয়নি।');
    return true;
  },
};
