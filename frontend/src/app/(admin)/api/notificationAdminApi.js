import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';
import {
  notificationDebug,
  notificationError,
} from '@/app/(shared)/lib/notificationDebug';

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
    notificationDebug('Admin broadcast request started.', {
      title: data?.title,
      optedInOnly: data?.send_to_opted_in_only,
    });
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
      notificationError('Admin broadcast request failed.', {
        status: res.status,
        detail: result?.detail || result?.message,
      });
      throw new Error(result.detail || 'Failed to execute system broadcast');
    }
    notificationDebug('Admin broadcast request succeeded.', result);
    return result;
  },

  /**
   * GET /api/notifications/campaigns/
   * Fetch recent notification campaigns.
   */
  getCampaigns: async token => {
    const res = await fetch(`${API_BASE_URL}/notifications/campaigns/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Failed to fetch campaigns');
    return res.json();
  },

  /**
   * GET /api/notifications/campaigns/{id}/
   * Fetch campaign metrics and recent failures.
   */
  getCampaignDetail: async (token, campaignId) => {
    const res = await fetch(`${API_BASE_URL}/notifications/campaigns/${campaignId}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Failed to fetch campaign detail');
    return res.json();
  },

  /**
   * GET /api/notifications/health/
   * Fetch health diagnostics for notification stack.
   */
  getHealth: async token => {
    const res = await fetch(`${API_BASE_URL}/notifications/health/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Failed to fetch notification health');
    return res.json();
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
