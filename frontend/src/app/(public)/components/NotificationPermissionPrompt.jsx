'use client';

import { useEffect } from 'react';

const ASKED_KEY = 'mypharma_notification_permission_asked';

export default function NotificationPermissionPrompt() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;

    // Ask only once per browser profile when permission is still undecided.
    if (Notification.permission !== 'default') return;
    if (window.localStorage.getItem(ASKED_KEY) === '1') return;

    const timer = window.setTimeout(async () => {
      try {
        const result = await Notification.requestPermission();
        window.localStorage.setItem(ASKED_KEY, '1');

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

