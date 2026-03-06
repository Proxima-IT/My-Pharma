import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

export const productAdminApi = {
  getProducts: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/products/?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('প্রোডাক্ট লিস্ট পাওয়া যায়নি।');
    return res.json();
  },

  getProductBySlug: async (token, slug) => {
    const res = await fetch(`${API_BASE_URL}/products/${slug}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('প্রোডাক্টের তথ্য পাওয়া যায়নি।');
    return res.json();
  },

  createProduct: async (token, formData) => {
    const res = await fetch(`${API_BASE_URL}/products/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw err;
    }
    return res.json();
  },

  uploadGalleryImage: async (token, slug, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const res = await fetch(`${API_BASE_URL}/products/${slug}/images/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return res.json();
  },

  // গ্যালারি ইমেজ ডিলিট করার ফাংশন
  deleteGalleryImage: async (token, slug, imagePk) => {
    const res = await fetch(
      `${API_BASE_URL}/products/${slug}/images/${imagePk}/`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return res.ok;
  },

  updateProduct: async (token, slug, formData) => {
    const res = await fetch(`${API_BASE_URL}/products/${slug}/`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw err;
    }
    return res.json();
  },

  deleteProduct: async (token, slug) => {
    const res = await fetch(`${API_BASE_URL}/products/${slug}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  },
};
