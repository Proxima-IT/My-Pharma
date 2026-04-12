'use client';

import { useEffect } from 'react';
import { updateNotificationPermissionApi } from '../api/notificationApi';

const ASKED_KEY = 'mypharma_notification_permission_asked';

export default function NotificationPermissionPrompt() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;

    const token = window.localStorage.getItem('access_token');

    const syncPermission = async permission => {
      if (!token) return;
      try {
        await updateNotificationPermissionApi(token, {
          browser_permission: permission,
          is_enabled: permission === 'granted',
          platform: navigator.platform || '',
        });
      } catch (_error) {
        // Ignore sync failures and keep UX non-blocking.
      }
    };

    // Keep backend in sync even if browser permission was already decided earlier.
    if (Notification.permission !== 'default') {
      syncPermission(Notification.permission);
      return;
    }

    // Ask only once per browser profile when permission is still undecided.
    if (Notification.permission !== 'default') return;
    if (window.localStorage.getItem(ASKED_KEY) === '1') return;

    const timer = window.setTimeout(async () => {
      try {
        const result = await Notification.requestPermission();
        window.localStorage.setItem(ASKED_KEY, '1');
        await syncPermission(result);

        if (result === 'granted') {
          new Notification('My Pharma', {
            body: 'Notifications are enabled. You will now receive updates.',
            icon: '/favicon.ico',
          });
        }
      } catch (_error) {
        // Ignore browser-level permission errors.
      }
    }, 1200);

    return () => window.clearTimeout(timer);
  }, []);

  return null;
}

