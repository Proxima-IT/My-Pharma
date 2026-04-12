'use client';

import React, { useState } from 'react';
import { FiBell, FiSend } from 'react-icons/fi';
import { broadcastNotificationApi } from '@/app/(admin)/api/notificationAdminApi';

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [sendToOptedInOnly, setSendToOptedInOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Please login again.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await broadcastNotificationApi(token, {
        title: title.trim(),
        message: message.trim(),
        target_url: targetUrl.trim(),
        send_to_opted_in_only: sendToOptedInOnly,
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to send notifications.');
    } finally {
      setLoading(false);
    }
  };

  const labelClass =
    'font-mono text-[10px] font-bold text-[#8A8A78] uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full px-4 py-3 bg-white border border-gray-100 rounded-none text-sm focus:outline-none focus:border-[#3A5A40] transition-all';

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
        <div className="w-10 h-10 border border-gray-100 bg-white flex items-center justify-center">
          <FiBell className="text-[#3A5A40]" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[#1B1B1B] tracking-tighter uppercase leading-none">
            Notifications
          </h1>
          <p className="text-[11px] font-mono text-[#8A8A78] mt-1 uppercase tracking-widest">
            Broadcast updates to users
          </p>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 font-mono text-xs uppercase">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="p-4 bg-green-50 border border-green-100 text-green-700 font-mono text-xs uppercase">
          {result.detail} Sent: {result.sent_count}
          {' | '}Push Attempted: {result.push_attempted}
          {' | '}Push Succeeded: {result.push_succeeded}
          {' | '}Push Failed: {result.push_failed}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-100 p-8 space-y-6"
      >
        <div>
          <label className={labelClass}>Notification Title</label>
          <input
            className={inputClass}
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={200}
            required
            placeholder="System Update"
          />
        </div>

        <div>
          <label className={labelClass}>Message</label>
          <textarea
            className={inputClass + ' min-h-[140px]'}
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
            placeholder="Write your broadcast message..."
          />
        </div>

        <div>
          <label className={labelClass}>Target URL (optional)</label>
          <input
            className={inputClass}
            value={targetUrl}
            onChange={e => setTargetUrl(e.target.value)}
            placeholder="https://mypharma.com/orders"
          />
        </div>

        <label className="flex items-center gap-3 text-sm text-[#1B1B1B]">
          <input
            type="checkbox"
            checked={sendToOptedInOnly}
            onChange={e => setSendToOptedInOnly(e.target.checked)}
            className="w-4 h-4"
          />
          Send only to users who enabled notification permission
        </label>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#3A5A40] text-white text-xs font-mono uppercase tracking-widest hover:bg-[#2d4732] disabled:opacity-60 transition-all"
        >
          <FiSend />
          {loading ? 'Sending...' : 'Send Broadcast'}
        </button>
      </form>
    </div>
  );
}
