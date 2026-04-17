/**
 * My Pharma - Firebase Cloud Messaging Service Worker
 * Handles background push notifications and click navigation.
 */

// Import Firebase scripts for service worker context
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

self.addEventListener('install', (event) => {
  console.log('[sw] install');
  self.skipWaiting();
});

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
// Firebase SDK automatically shows the notification using the "notification" payload.
// For data-only messages, we handle them here:
self.addEventListener('push', function (event) {
  if (!event.data) return;
  console.log('[sw] push event received.');

  let data = {
    title: 'My Pharma Update',
    message: 'You have a new notification.',
    target_url: '/',
  };

  try {
    const payload = event.data.json();
    // FCM wraps data in a "data" key or "notification" key
    const notif = payload.notification || payload.data || payload;
    data.title = notif.title || data.title;
    data.message = notif.body || notif.message || data.message;
    data.target_url = (payload.data && payload.data.target_url) || payload.fcmOptions?.link || data.target_url;
  } catch (e) {
    console.warn('[sw] push payload is not JSON; falling back to text payload.');
    data.message = event.data.text();
  }

  // Only show notification if Firebase SDK didn't already show one
  // (Firebase auto-shows when "notification" key is present in the payload)
  const options = {
    body: data.message,
    icon: '/assets/images/appicon.png',
    badge: '/assets/images/appicon.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.target_url,
    },
    tag: 'my-pharma-notification',
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
  console.log('[sw] notification shown with target:', data.target_url);
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
