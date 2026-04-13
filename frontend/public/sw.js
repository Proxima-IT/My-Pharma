/**
 * My Pharma - Refined Browser Push Service Worker
 * Robust handling for both JSON (from backend) and Plain Text (from DevTools).
 */

self.addEventListener('push', function (event) {
  if (!event.data) {
    console.log('Push event received with no data.');
    return;
  }

  let data = {
    title: 'My Pharma Update',
    message: 'You have a new notification.',
    target_url: '/',
  };

  // Try to parse JSON, if it fails, treat as plain text
  try {
    const jsonPayload = event.data.json();
    data.title = jsonPayload.title || data.title;
    data.message = jsonPayload.message || data.message;
    data.target_url = jsonPayload.target_url || data.target_url;
  } catch (e) {
    // If not JSON (like DevTools test push), use the raw text as the message
    data.message = event.data.text();
  }

  const options = {
    body: data.message,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      url: data.target_url,
    },
    tag: 'my-pharma-notification',
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const targetUrl = event.notification.data.url;

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client
              .focus()
              .then(focusedClient => focusedClient.navigate(targetUrl));
          }
        }
        if (clients.openWindow) return clients.openWindow(targetUrl);
      }),
  );
});
