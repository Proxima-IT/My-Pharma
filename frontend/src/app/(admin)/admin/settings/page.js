'use client';
import React from 'react';
import LogoSettings from './components/LogoSettings';

/**
 * AdminSettingsPage
 * Strictly follows the Super Admin "Sharp" design system.
 * Removed all static mock data to focus on functional modules.
 */
export default function AdminSettingsPage() {
  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-4xl font-black text-[#1B1B1B] tracking-tighter uppercase leading-none">
          System Configuration
        </h1>
        <p className="text-[13px] text-[#6B6B5E] mt-2 font-medium">
          Manage global brand assets and pharmaceutical system parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Branding Module - Functional */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-[2px] w-8 bg-[#3A5A40]"></div>
            <h2 className="font-mono text-[11px] font-black text-[#3A5A40] uppercase tracking-[0.3em]">
              Identity and Branding
            </h2>
          </div>
          <LogoSettings />
        </div>

        {/* Note: Additional functional modules (General, Security, etc.) 
            will be added here as their respective APIs are implemented. */}
      </div>

      {/* Technical Footer Info */}
      <div className="p-6 bg-[#F1F1E6] border border-[#DAD7CD] font-mono text-[10px] text-[#8A8A78] uppercase leading-relaxed flex justify-between items-center">
        <span>Operational Status: Active</span>
        <span className="font-bold text-[#1B1B1B]">My Pharma Core v1.0.4</span>
      </div>
    </div>
  );
}
