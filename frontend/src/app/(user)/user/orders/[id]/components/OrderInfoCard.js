'use client';
import React from 'react';

export default function OrderInfoCard({ label, value, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-[24px] p-4 sm:p-5 flex flex-col gap-1 sm:gap-2 flex-1 min-w-0 transition-all">
      {/* Label: Smaller on mobile, forced truncation to prevent push-out */}
      <span className="text-[11px] sm:text-[13px] font-medium text-gray-400 whitespace-nowrap uppercase tracking-wider truncate">
        {label}
      </span>

      {/* Value Container: min-w-0 allows the child span to truncate properly */}
      <div className="text-[14px] sm:text-[15px] font-bold text-gray-900 flex items-center min-w-0">
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
