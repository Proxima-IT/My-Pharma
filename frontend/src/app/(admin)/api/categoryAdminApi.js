import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

/**
 * My Pharma - Super Admin Category Management API
 * Updated: Included bulk selection endpoints for Sidebar and Featured categories.
 */
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

  // ৪. নতুন গ্রুপ তৈরি করা (Multipart for images)
  createCategory: async (token, formData) => {
    const res = await fetch(`${API_BASE_URL}/categories/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // Content-Type omitted to let browser set boundary for multipart
      },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw err;
    }
    return res.json();
  },

  // ৫. গ্রুপের তথ্য আপডেট করা (Multipart for images)
  updateCategory: async (token, slug, formData) => {
    const res = await fetch(`${API_BASE_URL}/categories/${slug}/`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
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

  // --- NEW BULK SIDEBAR & FEATURED MANAGEMENT ---

  // ৭. বর্তমানে সাইডবারে থাকা ক্যাটাগরিগুলোর লিস্ট
  getSelectedSidebarCategories: async token => {
    const res = await fetch(`${API_BASE_URL}/categories/sidebar-category/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('সাইডবার ক্যাটাগরি লিস্ট পাওয়া যায়নি।');
    return res.json();
  },

  // ৮. সাইডবার ক্যাটাগরি সিলেকশন ও সিরিয়াল আপডেট করা
  updateSidebarSelection: async (token, categoryIds) => {
    const res = await fetch(`${API_BASE_URL}/categories/sidebar-category/`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category_ids: categoryIds }),
    });
    if (!res.ok) throw new Error('সাইডবার আপডেট করা সম্ভব হয়নি।');
    return res.json();
  },

  // ৯. বর্তমানে ফিচারড (হোমপেজ) থাকা ক্যাটাগরিগুলোর লিস্ট
  getFeaturedHomeCategories: async token => {
    const res = await fetch(`${API_BASE_URL}/categories/featured-category/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('ফিচারড ক্যাটাগরি লিস্ট পাওয়া যায়নি।');
    return res.json();
  },

  // ১০. ফিচারড ক্যাটাগরি সিলেকশন ও সিরিয়াল আপডেট করা
  updateFeaturedHomeSelection: async (token, categoryIds) => {
    const res = await fetch(`${API_BASE_URL}/categories/featured-category/`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category_ids: categoryIds }),
    });
    if (!res.ok) throw new Error('ফিচারড লিস্ট আপডেট করা সম্ভব হয়নি।');
    return res.json();
  },
};
