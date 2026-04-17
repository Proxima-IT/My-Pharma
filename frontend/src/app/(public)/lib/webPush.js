/**
 * Firebase Cloud Messaging - Push registration helpers
 * Replaces the old VAPID-based webPush.js
 */
import { getFirebaseMessaging } from '../../(shared)/lib/firebaseConfig';
import { getToken, deleteToken } from 'firebase/messaging';

/**
 * Register for push notifications via Firebase Cloud Messaging.
 * Returns the FCM registration token string.
 */
export async function registerPushSubscription() {
  console.log('[webPush] Starting FCM registration flow.');
  if (typeof window === 'undefined') {
    throw new Error('Push is only available in browser.');
  }
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service worker is not supported on this browser.');
  }
  if (!('Notification' in window)) {
    throw new Error('Notifications are not supported on this browser.');
  }

  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    throw new Error('Firebase Messaging is not supported in this browser.');
  }
  console.log('[webPush] Firebase Messaging is supported.');

  // Register our custom SW that has Firebase compat scripts
  const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  console.log('[webPush] Service worker registration state:', registration?.active ? 'active' : 'pending');
  await navigator.serviceWorker.ready;
  console.log('[webPush] Service worker ready.');

  // Send Firebase config to the service worker so it can initialize
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  };
  const missingConfigKeys = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missingConfigKeys.length > 0) {
    throw new Error(
      `Missing Firebase config keys: ${missingConfigKeys.join(', ')}. ` +
      'Set NEXT_PUBLIC_FIREBASE_* values and rebuild frontend.',
    );
  }

  if (registration.active) {
    console.log('[webPush] Sending Firebase config to active service worker.');
    registration.active.postMessage({
      type: 'FIREBASE_CONFIG',
      config: firebaseConfig,
    });
  } else {
    console.warn('[webPush] No active service worker instance yet; config postMessage skipped.');
  }

  // Get FCM token using the VAPID key from Firebase project settings
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';
  if (!vapidKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_FIREBASE_VAPID_KEY. ' +
      'Use Firebase Console -> Project Settings -> Cloud Messaging -> Web Push certificate key pair.',
    );
  }
  let token = '';
  try {
    token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
  } catch (err) {
    const msg = String(err?.message || '');
    if (
      msg.includes('messaging/token-subscribe-failed') ||
      msg.includes('authentication credential') ||
      msg.includes('401')
    ) {
      throw new Error(
        'FCM subscribe failed (401). Verify Firebase Web Push setup: ' +
        '1) NEXT_PUBLIC_FIREBASE_VAPID_KEY must be Firebase Cloud Messaging Web Push public key, ' +
        '2) API key restrictions must allow your localhost origin, ' +
        '3) appId/senderId/projectId must match same Firebase project.',
      );
    }
    throw err;
  }

  if (!token) {
    throw new Error('Failed to get FCM registration token.');
  }
  console.log('[webPush] FCM token generated successfully.');

  return {
    fcmToken: token,
    platform: navigator.platform || '',
  };
}

/**
 * Unsubscribe from Firebase push notifications.
 */
export async function unsubscribePush() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;
  try {
    console.log('[webPush] Attempting FCM unsubscription.');
    const messaging = await getFirebaseMessaging();
    if (!messaging) return false;
    const removed = await deleteToken(messaging);
    console.log('[webPush] FCM token deletion result:', removed);
    return removed;
  } catch {
    console.warn('[webPush] FCM unsubscription failed.');
    return false;
  }
}
