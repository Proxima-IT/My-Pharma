import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

/**
 * My Pharma - Public Notification API
 * Handles user notifications, permission syncing, and browser push subscriptions.
 */

const getAuthHeader = token => {
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const notificationApi = {
  /**
   * GET /api/notifications/
   * List paginated notifications for the authenticated user.
   */
  getNotifications: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/notifications/?${query}`, {
      headers: { ...getAuthHeader(token) },
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  /**
   * PATCH /api/notifications/{id}/read/
   * Mark a specific notification as read.
   */
  markAsRead: async (token, id) => {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}/read/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(token),
      },
    });
    if (!res.ok) throw new Error('Failed to mark notification as read');
    return res.json();
  },

  /**
   * PATCH /api/notifications/read-all/
   * Mark all notifications as read for the user.
   */
  markAllRead: async token => {
    const res = await fetch(`${API_BASE_URL}/notifications/read-all/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(token),
      },
    });
    if (!res.ok) throw new Error('Failed to mark all as read');
    return res.json();
  },

  /**
   * POST /api/notifications/permission/
   * Sync browser permission status (granted/denied) to backend.
   * Payload example: { browser_permission: 'granted', is_enabled: true, platform: 'Win32' }
   */
  updatePermissionState: async (token, data) => {
    const res = await fetch(`${API_BASE_URL}/notifications/permission/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(token),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to sync permission state');
    return res.json();
  },

  /**
   * POST /api/notifications/subscriptions/
   * Save the Browser PushSubscription object to the backend.
   * This allows the backend to send notifications even when the tab is closed.
   */
  saveSubscription: async (token, subscription) => {
    const res = await fetch(`${API_BASE_URL}/notifications/subscriptions/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(token),
      },
      body: JSON.stringify(subscription),
    });
    if (!res.ok) throw new Error('Failed to save push subscription');
    return res.json();
  },

  /**
   * GET /api/notifications/permission/
   * Check user's stored notification preferences.
   */
  getPermissionPreferences: async token => {
    const res = await fetch(`${API_BASE_URL}/notifications/permission/`, {
      headers: { ...getAuthHeader(token) },
    });
    if (!res.ok) throw new Error('Failed to fetch notification preferences');
    return res.json();
  },
};
