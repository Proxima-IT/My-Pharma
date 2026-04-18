const isDev = process.env.NODE_ENV !== 'production';

/**
 * Enable detailed notification logs in development by default.
 * In production, set NEXT_PUBLIC_NOTIFICATION_DEBUG=true to enable.
 */
export const isNotificationDebugEnabled =
  isDev || process.env.NEXT_PUBLIC_NOTIFICATION_DEBUG === 'true';

const prefix = '[NotificationDebug]';

export function notificationDebug(message, meta) {
  if (!isNotificationDebugEnabled) return;
  if (meta !== undefined) {
    console.log(`${prefix} ${message}`, meta);
    return;
  }
  console.log(`${prefix} ${message}`);
}

export function notificationWarn(message, meta) {
  if (!isNotificationDebugEnabled) return;
  if (meta !== undefined) {
    console.warn(`${prefix} ${message}`, meta);
    return;
  }
  console.warn(`${prefix} ${message}`);
}

export function notificationError(message, meta) {
  if (!isNotificationDebugEnabled) return;
  if (meta !== undefined) {
    console.error(`${prefix} ${message}`, meta);
    return;
  }
  console.error(`${prefix} ${message}`);
}
