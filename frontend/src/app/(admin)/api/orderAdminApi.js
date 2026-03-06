import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

export const orderAdminApi = {
  // ১. সব অর্ডারের লিস্ট দেখা (Pagination সহ)
  getOrders: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/orders/?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('অর্ডারের লিস্ট পাওয়া যায়নি।');
    return res.json();
  },

  // ২. নির্দিষ্ট একটি অর্ডারের বিস্তারিত দেখা
  getOrderDetails: async (token, id) => {
    const res = await fetch(`${API_BASE_URL}/orders/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('অর্ডারের বিস্তারিত তথ্য পাওয়া যায়নি।');
    return res.json();
  },

  // ৩. অর্ডারের স্ট্যাটাস পরিবর্তন করা (যেমন: Pending থেকে Delivered)
  updateOrderStatus: async (token, id, status) => {
    const res = await fetch(`${API_BASE_URL}/orders/${id}/`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('স্ট্যাটাস আপডেট করা সম্ভব হয়নি।');
    return res.json();
  },
};
