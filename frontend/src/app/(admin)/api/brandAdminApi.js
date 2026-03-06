import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

export const brandAdminApi = {
  // ১. সব কোম্পানির লিস্ট দেখা (Search এবং Pagination সহ)
  getBrands: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/brands/?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('কোম্পানির লিস্ট পাওয়া যায়নি।');
    return res.json();
  },

  // ২. একটি নির্দিষ্ট কোম্পানির বিস্তারিত তথ্য দেখা
  getBrandBySlug: async (token, slug) => {
    const res = await fetch(`${API_BASE_URL}/brands/${slug}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('কোম্পানির তথ্য পাওয়া যায়নি।');
    return res.json();
  },

  // ৩. নতুন কোম্পানি যোগ করা
  createBrand: async (token, data) => {
    const res = await fetch(`${API_BASE_URL}/brands/`, {
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

  // ৪. কোম্পানির তথ্য আপডেট করা
  updateBrand: async (token, slug, data) => {
    const res = await fetch(`${API_BASE_URL}/brands/${slug}/`, {
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

  // ৫. কোম্পানি ডিলিট করা
  deleteBrand: async (token, slug) => {
    const res = await fetch(`${API_BASE_URL}/brands/${slug}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('কোম্পানি ডিলিট করা সম্ভব হয়নি।');
    return true;
  },
};
