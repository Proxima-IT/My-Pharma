'use client';
import React, { useState } from 'react';
import {
  FiSettings,
  FiShield,
  FiDatabase,
  FiCheck,
  FiGlobe,
  FiBell,
} from 'react-icons/fi';

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  // Mock Data for Settings
  const [settings, setSettings] = useState({
    siteName: 'MY PHARMA',
    contactEmail: 'support@mypharma.com',
    currency: 'BDT (৳)',
    maintenanceMode: false,
    emailNotifications: true,
    backupFrequency: 'Daily',
  });

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  const labelClass =
    'font-mono text-[11px] font-bold text-[#8A8A78] uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-12 px-4 bg-white border border-gray-200 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase placeholder:text-gray-300 text-[#1B1B1B]';

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-4xl font-black text-[#1B1B1B] tracking-tighter uppercase leading-none">
          System Settings
        </h1>
        <p className="text-[13px] text-[#6B6B5E] mt-2 font-medium">
          Manage your pharmacy system&apos;s global information and security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: General & System */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. General Information */}
          <div className="bg-white border border-gray-100 p-8">
            <h3 className="font-mono text-xs font-bold text-[#1B1B1B] uppercase tracking-widest border-b border-gray-50 pb-4 mb-6 flex items-center gap-2">
              <FiGlobe className="text-[#3A5A40]" /> General Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Pharmacy Name</label>
                <input
                  className={inputClass}
                  value={settings.siteName}
                  onChange={e =>
                    setSettings({ ...settings, siteName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Support Email</label>
                <input
                  className={inputClass}
                  value={settings.contactEmail}
                  onChange={e =>
                    setSettings({ ...settings, contactEmail: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>System Currency</label>
                <select
                  className={inputClass}
                  value={settings.currency}
                  onChange={e =>
                    setSettings({ ...settings, currency: e.target.value })
                  }
                >
                  <option>BDT (৳)</option>
                  <option>USD ($)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. System Maintenance */}
          <div className="bg-white border border-gray-100 p-8">
            <h3 className="font-mono text-xs font-bold text-[#1B1B1B] uppercase tracking-widest border-b border-gray-50 pb-4 mb-6 flex items-center gap-2">
              <FiDatabase className="text-[#3A5A40]" /> Maintenance & Backup
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100">
                <div className="flex flex-col">
                  <span className="font-mono text-[12px] font-bold text-[#1B1B1B] uppercase">
                    Maintenance Mode
                  </span>
                  <span className="text-[10px] text-[#8A8A78] uppercase">
                    If on, customers cannot access the shop
                  </span>
                </div>
                <input
                  type="checkbox"
                  className="w-8 h-8 border-gray-300 accent-[#3A5A40] cursor-pointer"
                  checked={settings.maintenanceMode}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      maintenanceMode: e.target.checked,
                    })
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Database Backup Frequency</label>
                <select
                  className={inputClass}
                  value={settings.backupFrequency}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      backupFrequency: e.target.value,
                    })
                  }
                >
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Security & Actions */}
        <div className="space-y-8">
          {/* Security Card */}
          <div className="bg-white border border-gray-100 p-8">
            <h3 className="font-mono text-xs font-bold text-[#1B1B1B] uppercase tracking-widest border-b border-gray-50 pb-4 mb-6 flex items-center gap-2">
              <FiShield className="text-[#3A5A40]" /> Security
            </h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 cursor-pointer">
                <span className="text-[11px] font-bold text-[#1B1B1B] uppercase">
                  Email Alerts?
                </span>
                <input
                  type="checkbox"
                  className="w-6 h-6 accent-[#3A5A40]"
                  checked={settings.emailNotifications}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      emailNotifications: e.target.checked,
                    })
                  }
                />
              </label>
              <button className="w-full py-3 border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-[#1B1B1B] hover:bg-gray-50 transition-all cursor-pointer">
                Change Admin Password
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-20 bg-[#3A5A40] text-white font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-[#F59E0B] transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              'SAVING...'
            ) : (
              <>
                <FiCheck size={20} /> SAVE SETTINGS
              </>
            )}
          </button>

          <div className="p-4 bg-[#F1F1E6] border border-[#DAD7CD] font-mono text-[9px] text-[#8A8A78] uppercase leading-relaxed">
            Note: Global settings affect all users and pharmacy modules. Please
            verify changes before saving.
          </div>
        </div>
      </div>
    </div>
  );
}
