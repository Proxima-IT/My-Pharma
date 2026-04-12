function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerPushSubscription(vapidPublicKey) {
  if (typeof window === 'undefined') {
    throw new Error('Push is only available in browser.');
  }
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service worker is not supported on this browser.');
  }
  if (!('PushManager' in window)) {
    throw new Error('Push notifications are not supported on this browser.');
  }
  if (!vapidPublicKey) {
    throw new Error('Missing web push public key.');
  }

  const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  const readyRegistration = await navigator.serviceWorker.ready;

  let subscription = await readyRegistration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await readyRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
  }

  return {
    registration,
    subscription: subscription.toJSON(),
    platform: navigator.platform || '',
  };
}

export async function unsubscribePushEndpoint(endpoint) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;
  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  if (!existing) return false;
  if (endpoint && existing.endpoint !== endpoint) return false;
  return existing.unsubscribe();
}
