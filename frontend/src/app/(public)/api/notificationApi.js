import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';
import {
  notificationDebug,
  notificationError,
} from '@/app/(shared)/lib/notificationDebug';

/**
 * My Pharma - Public Notification API
 * Handles user notifications, permission syncing, and browser push subscriptions.
 */

const getAuthHeader = token => {
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const readErrorMessage = async response => {
  const fallback = `Request failed with status ${response.status}`;
  try {
    const text = await response.text();
    if (!text) return fallback;
    try {
      const data = JSON.parse(text);
      return data?.detail || data?.message || fallback;
    } catch {
      return text.slice(0, 240);
    }
  } catch {
    return fallback;
  }
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const normalizeSubscriptionPayload = subscription => {
  // Accept both snake_case and camelCase token keys.
  const fcmToken = subscription?.fcm_token || subscription?.fcmToken || '';
  return {
    fcm_token: fcmToken,
    platform: subscription?.platform || (typeof navigator !== 'undefined' ? navigator.platform : ''),
    is_active: true,
  };
};

async function fetchWithRetry(url, options = {}, retries = 1, timeoutMs = 10000) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
      if (attempt < retries) {
        await sleep(300 * (attempt + 1));
      }
    }
  }
  throw lastError;
}

export const notificationApi = {
  /**
   * GET /api/notifications/
   * List paginated notifications for the authenticated user.
   */
  getNotifications: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    notificationDebug('Fetching notifications.', { query });
    const res = await fetch(`${API_BASE_URL}/notifications/?${query}`, {
      headers: { ...getAuthHeader(token) },
    });
    if (!res.ok) {
      notificationError('Failed to fetch notifications.', { status: res.status });
      throw new Error('Failed to fetch notifications');
    }
    return res.json();
  },

  /**
   * PATCH /api/notifications/{id}/read/
   * Mark a specific notification as read.
   */
  markAsRead: async (token, id) => {
    notificationDebug('Marking notification as read.', { id });
    const res = await fetch(`${API_BASE_URL}/notifications/${id}/read/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(token),
      },
    });
    if (!res.ok) {
      notificationError('Failed to mark notification as read.', {
        id,
        status: res.status,
      });
      throw new Error('Failed to mark notification as read');
    }
    return res.json();
  },

  /**
   * PATCH /api/notifications/read-all/
   * Mark all notifications as read for the user.
   */
  markAllRead: async token => {
    notificationDebug('Marking all notifications as read.');
    const res = await fetch(`${API_BASE_URL}/notifications/read-all/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(token),
      },
    });
    if (!res.ok) {
      notificationError('Failed to mark all notifications as read.', {
        status: res.status,
      });
      throw new Error('Failed to mark all as read');
    }
    return res.json();
  },

  /**
   * POST /api/notifications/permission/
   * Sync browser permission status (granted/denied) to backend.
   * Payload example: { browser_permission: 'granted', is_enabled: true, platform: 'Win32' }
   */
  updatePermissionState: async (token, data) => {
    console.log('[notificationApi] updatePermissionState payload:', data);
    const res = await fetchWithRetry(`${API_BASE_URL}/notifications/permission/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(token),
      },
      body: JSON.stringify(data),
    }, 2);
    if (!res.ok) {
      console.error('[notificationApi] updatePermissionState failed status:', res.status);
      throw new Error(await readErrorMessage(res));
    }
    console.log('[notificationApi] updatePermissionState success.');
    return res.json();
  },

  /**
   * POST /api/notifications/subscriptions/
   * Save the Browser PushSubscription object to the backend.
   * This allows the backend to send notifications even when the tab is closed.
   */
  saveSubscription: async (token, subscription) => {
    const payload = normalizeSubscriptionPayload(subscription);
    console.log('[notificationApi] saveSubscription token prefix:', (payload.fcm_token || '').slice(0, 20));
    const res = await fetchWithRetry(`${API_BASE_URL}/notifications/subscriptions/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(token),
      },
      body: JSON.stringify(payload),
    }, 2);
    if (!res.ok) {
      console.error('[notificationApi] saveSubscription failed status:', res.status);
      throw new Error(await readErrorMessage(res));
    }
    console.log('[notificationApi] saveSubscription success.');
    return res.json();
  },

  /**
   * GET /api/notifications/permission/
   * Check user's stored notification preferences.
   */
  getPermissionPreferences: async token => {
    notificationDebug('Fetching notification permission preferences.');
    const res = await fetch(`${API_BASE_URL}/notifications/permission/`, {
      headers: { ...getAuthHeader(token) },
    });
    if (!res.ok) {
      notificationError('Failed to fetch notification permission preferences.', {
        status: res.status,
      });
      throw new Error('Failed to fetch notification preferences');
    }
    return res.json();
  },
};
