'use client';

import React, { useState, useEffect } from 'react';
import { FiBell, FiX, FiCheck, FiAlertTriangle, FiWifi } from 'react-icons/fi';
import { notificationApi } from '../api/notificationApi';
import { registerPushSubscription } from '../lib/webPush';
import {
  notificationDebug,
  notificationWarn,
  notificationError,
} from '../../(shared)/lib/notificationDebug';

const logDebug = (...args) => {
  notificationDebug(args[0], args[1]);
};
const logWarn = (...args) => {
  notificationWarn(args[0], args[1]);
};

/**
 * NotificationPermissionPrompt
 * Firebase Cloud Messaging version.
 * Same UI design — uses FCM getToken() instead of VAPID PushManager.subscribe()
 */
export default function NotificationPermissionPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // 'idle' | 'success' | 'push_unavailable' | 'error'
  const [resultState, setResultState] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const syncGrantedPermissionSilently = async authToken => {
    try {
      logDebug('[NotificationPrompt] Permission already granted. Running silent FCM sync.');
      const fcmResult = await registerPushSubscription();
      const tokenPreview = (fcmResult?.fcmToken || '').slice(0, 20);
      logDebug('[NotificationPrompt] Silent FCM token obtained:', `${tokenPreview}...`);
      await notificationApi.saveSubscription(authToken, {
        fcm_token: fcmResult.fcmToken,
        platform: fcmResult.platform,
      });
      await notificationApi.updatePermissionState(authToken, {
        browser_permission: 'granted',
        is_enabled: true,
        platform: navigator.platform,
      });
      logDebug('[NotificationPrompt] Silent FCM sync completed successfully.');
    } catch (err) {
      logWarn(
        '[NotificationPrompt] Silent FCM sync failed:',
        err?.message || err,
      );
    }
  };

  // ─── Mount check ──────────────────────────────────────────────────────────

  useEffect(() => {
    const checkStatus = async () => {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        logWarn('[NotificationPrompt] Push not supported in this browser.');
        return;
      }

      const currentPermission = Notification.permission;
      logDebug('[NotificationPrompt] Notification.permission =', currentPermission);

      const token = localStorage.getItem('access_token');
      if (!token) {
        logDebug('[NotificationPrompt] No auth token, skipping prompt.');
        return;
      }

      if (currentPermission === 'granted') {
        await syncGrantedPermissionSilently(token);
        logDebug('[NotificationPrompt] Permission already granted, skipping prompt UI.');
        return;
      }

      if (currentPermission === 'denied') {
        logDebug('[NotificationPrompt] Permission denied previously, skipping prompt UI.');
        return;
      }

      if (localStorage.getItem('push_prompt_dismissed') === 'true') {
        logDebug('[NotificationPrompt] Previously dismissed, not showing again.');
        return;
      }

      if (window.isSecureContext === false) {
        logWarn('[NotificationPrompt] Not a secure context (HTTPS required). Skipping.');
        return;
      }

      logDebug('[NotificationPrompt] All checks passed — showing prompt in 3s.');
      const timer = setTimeout(() => {
        logDebug('[NotificationPrompt] Showing prompt.');
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    };

    checkStatus();
  }, []);

  // ─── Dismiss ──────────────────────────────────────────────────────────────

  const handleDismiss = () => {
    localStorage.setItem('push_prompt_dismissed', 'true');
    setIsVisible(false);
    setResultState('idle');
    setErrorMessage('');
  };

  // ─── Allow ────────────────────────────────────────────────────────────────

  const handleAllow = async () => {
    setIsProcessing(true);
    setResultState('idle');
    setErrorMessage('');

    const authToken = localStorage.getItem('access_token');
    if (!authToken) {
      setIsProcessing(false);
      setIsVisible(false);
      return;
    }

    try {
      // Step 1: Ask browser permission
      const permission = await Notification.requestPermission();
      logDebug('[NotificationPrompt] Browser permission result:', permission);

      if (permission === 'granted') {
        // Step 2: Get FCM token via Firebase
        let fcmResult = null;
        let pushAvailable = true;

        try {
          fcmResult = await registerPushSubscription();
          logDebug('[NotificationPrompt] FCM token obtained:', fcmResult.fcmToken.substring(0, 20) + '...');
        } catch (subscribeError) {
          notificationError('FCM registration failed.', subscribeError?.message);
          pushAvailable = false;

          const msg = String(subscribeError?.message || '').toLowerCase();
          if (
            msg.includes('messaging is not supported') ||
            msg.includes('push service') ||
            msg.includes('failed to get fcm') ||
            msg.includes('permission')
          ) {
            logWarn('[NotificationPrompt] Push service unreachable.');
            setResultState('push_unavailable');
          } else if (
            msg.includes('missing next_public_firebase_vapid_key') ||
            msg.includes('missing firebase config keys') ||
            msg.includes('token-subscribe-failed') ||
            msg.includes('authentication credential')
          ) {
            setResultState('error');
            setErrorMessage(
              'Firebase Web Push config is invalid. Set correct NEXT_PUBLIC_FIREBASE_* values ' +
              'and Firebase Web Push certificate key, then rebuild frontend.',
            );
          } else {
            setResultState('error');
            setErrorMessage(subscribeError?.message || 'Registration failed. Try again later.');
          }
        }

        // Step 3: Save FCM token to backend
        if (fcmResult) {
          try {
            await notificationApi.saveSubscription(authToken, {
              fcm_token: fcmResult.fcmToken,
              platform: fcmResult.platform,
            });
          } catch (saveError) {
            logWarn('[NotificationPrompt] Token save failed (non-fatal):', saveError?.message);
          }
        }

        // Step 4: Sync permission state to backend
        try {
          await notificationApi.updatePermissionState(authToken, {
            browser_permission: permission,
            is_enabled: pushAvailable,
            platform: navigator.platform,
          });
        } catch (syncError) {
          logWarn('[NotificationPrompt] Permission sync failed:', syncError?.message);
        }

        if (pushAvailable) {
          setResultState('success');
          localStorage.removeItem('push_prompt_dismissed');
          setTimeout(() => setIsVisible(false), 1800);
        }
      } else {
        // User denied
        localStorage.setItem('push_prompt_dismissed', 'true');
        try {
          await notificationApi.updatePermissionState(authToken, {
            browser_permission: permission,
            is_enabled: false,
            platform: navigator.platform,
          });
        } catch {
          // Non-fatal
        }
        setIsVisible(false);
      }
    } catch (err) {
      notificationError('Unhandled permission prompt error.', err?.message || err);
      setResultState('error');
      setErrorMessage(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isVisible) return null;

  // ─── UI ───────────────────────────────────────────────────────────────────

  const isSuccess = resultState === 'success';
  const isPushUnavailable = resultState === 'push_unavailable';
  const isError = resultState === 'error';
  const showButtons = resultState === 'idle';

  return (
    <div className="fixed bottom-8 right-8 z-[9999] animate-in slide-in-from-bottom-10 duration-700">
      <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)] max-w-[360px] w-full relative">

        {!isProcessing && !isSuccess && (
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-5 right-5 p-2 text-gray-300 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <FiX size={20} />
          </button>
        )}

        <div className="flex flex-col items-center text-center space-y-5">

          <div className={`w-16 h-16 text-white rounded-[24px] flex items-center justify-center shadow-lg transition-colors duration-300 ${
            isSuccess ? 'bg-green-500 shadow-green-100' :
            isPushUnavailable ? 'bg-amber-400 shadow-amber-100' :
            isError ? 'bg-red-500 shadow-red-100' :
            'bg-(--color-primary-500) shadow-primary-100'
          }`}>
            {isSuccess ? <FiCheck size={32} /> :
             isPushUnavailable ? <FiWifi size={32} /> :
             isError ? <FiAlertTriangle size={32} /> :
             <FiBell size={32} className="animate-bounce" />}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">
              {isSuccess ? 'Notifications On!' :
               isPushUnavailable ? 'Permission Saved' :
               isError ? 'Something went wrong' :
               'Notifications'}
            </h3>
            <p className="text-[13px] text-gray-500 font-medium leading-relaxed px-2">
              {isSuccess
                ? "You'll receive real-time updates on your orders and prescriptions."
                : isPushUnavailable
                ? "Push delivery isn't available on this network right now. Your preference has been saved — we'll retry automatically."
                : isError
                ? (errorMessage || 'Could not enable notifications. Please try again later.')
                : 'Enable real-time tracking for your prescriptions, order updates, and exclusive pharma offers.'}
            </p>
          </div>

          {showButtons && (
            <div className="flex flex-col w-full gap-2 pt-2">
              <button
                type="button"
                onClick={handleAllow}
                disabled={isProcessing}
                className="w-full h-14 bg-(--color-primary-500) hover:bg-(--color-primary-600) text-white font-bold rounded-full flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs cursor-pointer"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><FiCheck size={18} /> Enable Now</>
                )}
              </button>

              {!isProcessing && (
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-full h-10 text-gray-400 hover:text-gray-600 font-bold text-[10px] uppercase tracking-[0.2em] transition-colors cursor-pointer"
                >
                  Maybe Later
                </button>
              )}
            </div>
          )}

          {(isPushUnavailable || isError) && (
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full h-10 text-gray-400 hover:text-gray-600 font-bold text-[10px] uppercase tracking-[0.2em] transition-colors cursor-pointer"
            >
              Got it
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
