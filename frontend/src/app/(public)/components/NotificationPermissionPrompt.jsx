'use client';

import { useEffect } from 'react';
import {
  removePushSubscriptionApi,
  updateNotificationPermissionApi,
  upsertPushSubscriptionApi,
} from '../api/notificationApi';
import { registerPushSubscription, unsubscribePushEndpoint } from '../lib/webPush';
import { WEB_PUSH_VAPID_PUBLIC_KEY } from '@/app/(shared)/lib/apiConfig';

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

    const syncPushSubscription = async permission => {
      if (!token) return;
      if (permission !== 'granted') return;
      try {
        const { subscription, platform } = await registerPushSubscription(
          WEB_PUSH_VAPID_PUBLIC_KEY,
        );
        await upsertPushSubscriptionApi(token, {
          endpoint: subscription.endpoint,
          keys: subscription.keys,
          platform,
          is_active: true,
        });
      } catch (_error) {
        // Keep prompt UX non-blocking if push registration fails.
      }
    };

    const deactivateSubscription = async () => {
      if (!token) return;
      if (!('serviceWorker' in navigator)) return;
      try {
        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();
        if (!existing) return;
        await removePushSubscriptionApi(token, existing.endpoint);
        await unsubscribePushEndpoint(existing.endpoint);
      } catch (_error) {
        // Ignore unsubscribe sync failures.
      }
    };

    // Keep backend in sync even if browser permission was already decided earlier.
    if (Notification.permission !== 'default') {
      syncPermission(Notification.permission);
      if (Notification.permission === 'granted') {
        syncPushSubscription('granted');
      } else {
        deactivateSubscription();
      }
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
          await syncPushSubscription(result);
        } else {
          await deactivateSubscription();
        }

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

