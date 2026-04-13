import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

/**
 * My Pharma - Super Admin Notification Management API
 * Handles global broadcasts and system-wide notification tracking.
 */
export const notificationAdminApi = {
  /**
   * POST /api/notifications/broadcast/
   * Dispatches a notification to all users or opted-in segments.
   * @param {string} token - Admin access token
   * @param {Object} data - { title, message, target_url, send_to_opted_in_only }
   */
  broadcastNotification: async (token, data) => {
    const res = await fetch(`${API_BASE_URL}/notifications/broadcast/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.detail || 'Failed to execute system broadcast');
    }
    return result;
  },

  /**
   * GET /api/notifications/
   * Admin view of sent notifications (if needed for logs).
   */
  getBroadcastLogs: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/notifications/?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Failed to fetch notification logs');
    return res.json();
  },

  /**
   * GET /api/notifications/permission/
   * Insights into how many users have granted permissions.
   */
  getPermissionAnalytics: async token => {
    const res = await fetch(`${API_BASE_URL}/notifications/permission/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Failed to fetch permission statistics');
    return res.json();
  },
};
