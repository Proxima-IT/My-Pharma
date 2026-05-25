/**
 * My Pharma - Firebase Cloud Messaging Service Worker
 * Handles background push notifications and click navigation.
 */

// Import Firebase scripts for service worker context
importScripts('https://www.gstatic.com/firebasejs/12.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.12.0/firebase-messaging-compat.js');

self.addEventListener('install', (event) => {
  console.log('[sw] install');
  self.skipWaiting();
});

const NOTIFICATION_ICON = '/assets/images/my-pharma-logo.png';

self.addEventListener('activate', (event) => {
  console.log('[sw] activate');
  event.waitUntil(clients.claim());
});

// Firebase config will be sent from the main app via postMessage on first load.
// We also handle the case where it's initialized via the messaging.onBackgroundMessage callback.
let firebaseInitialized = false;

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    if (!firebaseInitialized) {
      console.log('[sw] Initializing Firebase app from postMessage.');
      firebase.initializeApp(event.data.config);
      firebaseInitialized = true;
    } else {
      console.log('[sw] Firebase app already initialized; skipping re-init.');
    }
  }
});

// Handle background push messages (when tab is not focused)
// Firebase SDK automatically shows the notification when a "notification" payload is present.
// We only manually show for data-only messages (no "notification" key in payload).
self.addEventListener('push', function (event) {
  if (!event.data) return;
  console.log('[sw] push event received.');

  let payload = {};
  try {
    payload = event.data.json();
  } catch (e) {
    // Not JSON — show a generic notification from text
    const textBody = event.data.text();
    const options = {
      body: textBody,
      icon: NOTIFICATION_ICON,
      badge: NOTIFICATION_ICON,
      vibrate: [100, 50, 100],
      data: { url: '/' },
      tag: 'my-pharma-notification',
      requireInteraction: true,
    };
    event.waitUntil(self.registration.showNotification('My Pharma Update', options));
    return;
  }

  // If FCM sends a "notification" key, the SDK handles display automatically.
  // Only show manually for data-only messages (no "notification" key).
  if (payload.notification) {
    console.log('[sw] FCM notification payload detected — SDK will auto-display.');
    return;
  }

  // Data-only message: extract fields and show notification manually
  const data = payload.data || payload;
  const title = data.title || 'My Pharma Update';
  const message = data.body || data.message || 'You have a new notification.';
  const targetUrl = data.target_url || payload.fcmOptions?.link || '/';

  const options = {
    body: message,
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_ICON,
    vibrate: [100, 50, 100],
    data: {
      url: targetUrl,
    },
    tag: 'my-pharma-notification',
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
  console.log('[sw] data-only notification shown with target:', targetUrl);
});

self.addEventListener('notificationclick', function (event) {
  console.log('[sw] notification click received.');
  event.notification.close();
  const rawTargetUrl = event.notification?.data?.url || '/';

  let safeTargetUrl = '/';
  try {
    const parsedTargetUrl = new URL(rawTargetUrl, self.location.origin);
    if (parsedTargetUrl.origin === self.location.origin) {
      safeTargetUrl = `${parsedTargetUrl.pathname}${parsedTargetUrl.search}${parsedTargetUrl.hash}`;
    }
  } catch (e) {
    safeTargetUrl = '/';
  }

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client
              .focus()
              .then(focusedClient => focusedClient.navigate(safeTargetUrl));
          }
        }
        if (clients.openWindow) return clients.openWindow(safeTargetUrl);
      }),
  );
});
