import { useState, useCallback } from 'react';
import { notificationAdminApi } from '../api/notificationAdminApi';
import {
  notificationDebug,
  notificationError,
} from '../../(shared)/lib/notificationDebug';

/**
 * My Pharma - Super Admin Notification Hook
 * Logic for dispatching system-wide broadcasts and monitoring user permission analytics.
 */
export const useNotificationAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [logs, setLogs] = useState({ results: [], count: 0 });

  /**
   * Dispatches a notification to the system broadcast queue.
   */
  const broadcast = useCallback(async formData => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    notificationDebug('Broadcast flow started from admin hook.', {
      hasTargetUrl: Boolean(formData?.target_url),
    });
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await notificationAdminApi.broadcastNotification(token, formData);
      notificationDebug('Broadcast flow completed.', result);
      setSuccess(true);
      return true;
    } catch (err) {
      notificationError('Broadcast flow failed in admin hook.', err?.message || err);
      setError(err.message || 'Transmission failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetches data on user browser permissions (granted/denied/default).
   */
  const fetchAnalytics = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setLoading(true);
    try {
      const data = await notificationAdminApi.getPermissionAnalytics(token);
      notificationDebug('Fetched notification analytics.', data);
      setAnalytics(data);
    } catch (err) {
      notificationError('Fetching notification analytics failed.', err?.message || err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Retrieves history of sent notifications.
   */
  const fetchLogs = useCallback(async (params = {}) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setLoading(true);
    try {
      const data = await notificationAdminApi.getBroadcastLogs(token, params);
      notificationDebug('Fetched notification logs.', {
        count: data?.count,
      });
      setLogs(data);
    } catch (err) {
      notificationError('Fetching notification logs failed.', err?.message || err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearStatus = () => {
    setSuccess(false);
    setError(null);
  };

  return {
    broadcast,
    fetchAnalytics,
    fetchLogs,
    clearStatus,
    loading,
    error,
    success,
    analytics,
    logs,
  };
};
