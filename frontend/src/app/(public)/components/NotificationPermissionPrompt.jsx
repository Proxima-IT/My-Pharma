'use client';

import React, { useState, useEffect } from 'react';
import { FiBell, FiX, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import { notificationApi } from '../api/notificationApi';

/**
 * NotificationPermissionPrompt
 * Refined: Added strict null checks for VAPID key and descriptive logging to debug environment issues.
 * Design: Public Zone (rounded-[32px], soft shadows).
 */
export default function NotificationPermissionPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Environment Variable Access
  const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  // Helper: Convert VAPID key to Uint8Array safely
  const urlBase64ToUint8Array = base64String => {
    // CRITICAL FIX: Guard against undefined/null strings
    if (!base64String || typeof base64String !== 'string') {
      console.error(
        'VAPID_CONVERSION_ERROR: Received invalid key string:',
        base64String,
      );
      return null;
    }

    try {
      const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    } catch (err) {
      console.error('VAPID_CONVERSION_FAILED: Invalid base64 format.', err);
      return null;
    }
  };

  useEffect(() => {
    const checkStatus = async () => {
      // 1. Browser Support Check
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        console.warn(
          'PUSH_NOT_SUPPORTED: Browser does not support Push Notifications.',
        );
        return;
      }

      // 2. Already decided?
      if (
        Notification.permission === 'granted' ||
        Notification.permission === 'denied'
      ) {
        return;
      }

      // 3. User Auth Check
      const token = localStorage.getItem('access_token');
      if (!token) return;

      // Show after delay
      const timer = setTimeout(() => setIsVisible(true), 4000);
      return () => clearTimeout(timer);
    };

    checkStatus();
  }, []);

  const handleAllow = async () => {
    // DEBUG LOG: See if the key is actually visible during click
    console.log('INTERNAL_CHECK: VAPID_KEY is', VAPID_KEY);

    if (!VAPID_KEY) {
      alert(
        'Configuration Error: Notification Key (VAPID) is missing in environment files (.env.local).',
      );
      return;
    }

    setIsProcessing(true);
    const token = localStorage.getItem('access_token');

    try {
      // Step 1: Request Browser UI Permission
      const permission = await Notification.requestPermission();

      // Step 2: Inform Backend about current state
      await notificationApi.updatePermissionState(token, {
        browser_permission: permission,
        is_enabled: permission === 'granted',
        platform: navigator.platform,
      });

      if (permission === 'granted') {
        // Step 3: Service Worker Registration
        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        // Step 4: Subscription Generation
        const convertedKey = urlBase64ToUint8Array(VAPID_KEY);
        if (!convertedKey)
          throw new Error('Could not convert VAPID Key to valid Uint8Array');

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey,
        });

        // Step 5: Save to Backend
        await notificationApi.saveSubscription(token, subscription);
        console.log('PUSH_FLOW_COMPLETED: Successfully subscribed.');
      }
    } catch (err) {
      console.error('NOTIFICATION_SETUP_FAILED:', err);
      alert('Technical error enabling notifications. Please try again later.');
    } finally {
      setIsProcessing(false);
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[9999] animate-in slide-in-from-bottom-10 duration-1000">
      <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)] max-w-[360px] w-full relative">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-5 right-5 p-2 text-gray-300 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <FiX size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-5">
          <div className="w-16 h-16 bg-(--color-primary-500) text-white rounded-[24px] flex items-center justify-center shadow-lg shadow-primary-100">
            <FiBell size={32} className="animate-bounce" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">
              Notifications
            </h3>
            <p className="text-[13px] text-gray-500 font-medium leading-relaxed px-2">
              Enable real-time tracking for your prescriptions, order updates,
              and exclusive pharma offers.
            </p>
          </div>

          <div className="flex flex-col w-full gap-2 pt-2">
            <button
              onClick={handleAllow}
              disabled={isProcessing}
              className="w-full h-14 bg-(--color-primary-500) hover:bg-(--color-primary-600) text-white font-bold rounded-full flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs cursor-pointer"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiCheck size={18} /> Enable Now
                </>
              )}
            </button>

            <button
              onClick={() => setIsVisible(false)}
              className="w-full h-10 text-gray-400 hover:text-gray-600 font-bold text-[10px] uppercase tracking-[0.2em] transition-colors cursor-pointer"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
