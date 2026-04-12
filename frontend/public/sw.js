self.addEventListener('push', event => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_error) {
    payload = {};
  }

  const title = payload.title || 'My Pharma';
  const options = {
    body: payload.body || 'You have a new notification.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      url: payload.url || payload.target_url || '/',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
      return null;
    }),
  );
});
