'use client';
import React from 'react';

export default function OrderInfoCard({ label, value, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-[24px] p-3.5 sm:p-5 flex flex-col gap-1 sm:gap-2 w-full min-w-0 transition-all">
      {/* Label: Adjusted size and tracking for mobile readability */}
      <span className="text-[10px] sm:text-[12px] font-bold text-gray-400 whitespace-nowrap uppercase tracking-widest truncate">
        {label}
      </span>

      {/* Value Container: Uses font-black for a premium look, handles truncation */}
      <div className="text-[14px] sm:text-[16px] font-black text-gray-900 flex items-center min-w-0 gap-2">
        {value && (
          <span className="truncate" title={value}>
            {value}
          </span>
        )}
        {children}
      </div>
    </div>
  );
}
