'use client';

import React, { useState, useEffect } from 'react';
import {
  FiSend,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiExternalLink,
} from 'react-icons/fi';
import AuthGuard from '@/app/(shared)/components/AuthGuard';
import { useNotificationAdmin } from '../../hooks/useNotificationAdmin';

/**
 * Super Admin Notification Broadcast Page
 * Refactored: Uses useNotificationAdmin hook for centralized state and API logic.
 * Design: Sharp Minimalist (rounded-none, thin borders, industrial data feel).
 */
export default function AdminNotificationPage() {
  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN']}>
      <NotificationBroadcastContent />
    </AuthGuard>
  );
}

function NotificationBroadcastContent() {
  const {
    broadcast,
    loading,
    error,
    success,
    clearStatus,
    campaigns,
    selectedCampaign,
    health,
    fetchCampaigns,
    fetchCampaignDetail,
    fetchHealth,
  } =
    useNotificationAdmin();

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target_url: '',
    send_to_opted_in_only: false,
  });

  // Clear success message when user starts typing again
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        clearStatus();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, clearStatus]);

  useEffect(() => {
    fetchCampaigns();
    fetchHealth();
  }, [fetchCampaigns, fetchHealth]);

  useEffect(() => {
    if (success) {
      fetchCampaigns();
      fetchHealth();
    }
  }, [success, fetchCampaigns, fetchHealth]);

  const handleSubmit = async e => {
    e.preventDefault();
    const ok = await broadcast(formData);

    if (ok) {
      setFormData({
        title: '',
        message: '',
        target_url: '',
        send_to_opted_in_only: false,
      });
    }
  };

  const inputClass =
    'w-full border border-gray-100 p-4 font-mono text-sm focus:outline-none focus:border-black transition-colors rounded-none bg-white shadow-none';
  const labelClass =
    'block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2';

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl font-black text-[#1B1B1B] tracking-tighter uppercase leading-none">
            System Broadcast
          </h1>
          <p className="text-[13px] text-[#6B6B5E] mt-3 font-medium max-w-xl">
            Dispatch global notifications to all users or target specific
            segments based on browser push permissions.
          </p>
        </div>
        <div className="flex items-center gap-2 border border-gray-100 p-3 bg-gray-50/50">
          <FiInfo className="text-gray-400" />
          <span className="font-mono text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
            Protocol: FCM TOKEN ACTIVE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Compose Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
          <div className="border border-gray-100 p-8 space-y-6 bg-white shadow-none">
            <div>
              <label className={labelClass}>Notification Title</label>
              <input
                type="text"
                required
                maxLength={200}
                placeholder="E.G. SYSTEM MAINTENANCE NOTICE"
                className={inputClass}
                value={formData.title}
                onChange={e => {
                  if (success || error) clearStatus();
                  setFormData({ ...formData, title: e.target.value });
                }}
              />
            </div>

            <div>
              <label className={labelClass}>Broadcast Message</label>
              <textarea
                required
                rows={5}
                placeholder="ENTER SYSTEM MESSAGE CONTENT..."
                className={`${inputClass} resize-none`}
                value={formData.message}
                onChange={e => {
                  if (success || error) clearStatus();
                  setFormData({ ...formData, message: e.target.value });
                }}
              />
            </div>

            <div>
              <label className={labelClass}>Action URL (Optional)</label>
              <div className="relative">
                <FiExternalLink className="absolute right-4 top-4 text-gray-300" />
                <input
                  type="url"
                  placeholder="HTTPS://MYPHARMA.COM/ORDERS"
                  className={inputClass}
                  value={formData.target_url}
                  onChange={e =>
                    setFormData({ ...formData, target_url: e.target.value })
                  }
                />
              </div>
              <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
                Users will be redirected to this link when they click the
                notification.
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto h-16 px-12 bg-black text-white font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 hover:bg-gray-800 transition-all disabled:opacity-20 cursor-pointer rounded-none shadow-none border-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiSend size={18} /> Execute Broadcast
                </>
              )}
            </button>

            {success && (
              <div className="flex items-center gap-3 font-mono text-[11px] font-bold uppercase text-green-600">
                <FiCheckCircle /> BROADCAST QUEUED SUCCESSFULLY
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 font-mono text-[11px] font-bold uppercase text-red-600">
                <FiAlertCircle /> ERROR: {error}
              </div>
            )}
          </div>
        </form>

        {/* Configuration Sidebar */}
        <div className="space-y-6">
          <div className="border border-gray-100 p-6 space-y-3 bg-white">
            <h4 className={labelClass}>Delivery Health</h4>
            <p className="font-mono text-[11px] text-gray-600">
              Firebase: {health?.firebase_initialized ? 'READY' : 'NOT READY'}
            </p>
            <p className="font-mono text-[11px] text-gray-600">
              Credentials: {health?.firebase_credential_source || '-'}
            </p>
            {!health?.firebase_initialized && !!health?.firebase_init_error && (
              <p className="font-mono text-[10px] text-red-600 break-words">
                {health.firebase_init_error}
              </p>
            )}
            <p className="font-mono text-[11px] text-gray-600">
              Active tokens: {health?.active_subscriptions ?? '-'}
            </p>
            <p className="font-mono text-[11px] text-gray-600">
              Inactive tokens: {health?.inactive_subscriptions ?? '-'}
            </p>
            <p className="font-mono text-[11px] text-gray-600">
              Deactivated (7d): {health?.recently_deactivated_7d ?? '-'}
            </p>
          </div>

          <div className="border border-gray-100 p-6 space-y-6 bg-gray-50/30">
            <h3 className={labelClass}>Segmentation Control</h3>

            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative flex items-center mt-1">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData.send_to_opted_in_only}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      send_to_opted_in_only: e.target.checked,
                    })
                  }
                />
                <div
                  className={`w-10 h-5 border border-gray-200 transition-colors ${formData.send_to_opted_in_only ? 'bg-black' : 'bg-white'}`}
                >
                  <div
                    className={`absolute top-1 w-3 h-3 transition-all ${formData.send_to_opted_in_only ? 'left-6 bg-white' : 'left-1 bg-gray-200'}`}
                  />
                </div>
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-black text-black uppercase tracking-widest block">
                  Opt-in Only
                </span>
                <span className="text-[10px] text-gray-500 uppercase leading-tight block mt-1">
                  Send only to users who have explicitly granted browser
                  notification permissions.
                </span>
              </div>
            </label>

            <div className="pt-6 border-t border-gray-100">
              <h4 className={labelClass}>Transmission Mode</h4>
              <div className="p-4 bg-white border border-gray-100 font-mono text-[10px] text-gray-400 uppercase space-y-2">
                <p>• Persistent DB Record</p>
                <p>• OS Level Push (SW)</p>
                <p>• Action Link Injection</p>
              </div>
            </div>
          </div>

          <div className="border border-gray-100 p-6 bg-white space-y-4">
            <h4 className={labelClass}>Recent Campaigns</h4>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {(campaigns || []).slice(0, 8).map(c => (
                <button
                  key={c.id}
                  type="button"
                  className="w-full text-left border border-gray-100 p-3 hover:border-black transition-colors cursor-pointer"
                  onClick={() => fetchCampaignDetail(c.id)}
                >
                  <p className="font-mono text-[11px] font-bold text-gray-700">
                    #{c.id} {c.title}
                  </p>
                  <p className="font-mono text-[10px] text-gray-500">
                    sent={c.recipient_count} ok={c.push_succeeded} fail={c.push_failed}
                  </p>
                </button>
              ))}
            </div>
            {!!selectedCampaign?.recent_failures?.length && (
              <div className="border border-red-100 p-3 bg-red-50/40 space-y-2">
                <p className="font-mono text-[10px] font-bold text-red-700 uppercase">
                  Recent Failures
                </p>
                {selectedCampaign.recent_failures.slice(0, 5).map(f => (
                  <p key={f.id} className="font-mono text-[10px] text-red-600">
                    user:{f.user} status:{f.status} reason:{f.reason || 'unknown'}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border border-amber-100 bg-amber-50/50 shadow-none">
            <div className="flex gap-3">
              <FiAlertCircle className="text-amber-500 shrink-0" size={18} />
              <p className="text-[10px] font-bold text-amber-700 uppercase leading-relaxed tracking-tight">
                Warning: System broadcasts are dispatched in real-time. Verify
                payload integrity before execution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
