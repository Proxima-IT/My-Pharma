'use client';
import React from 'react';

export default function OrderInfoCard({ label, value, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-[24px] p-4 sm:p-5 flex flex-col gap-1.5 w-full transition-all hover:border-gray-200">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] truncate">
        {label}
      </span>
      <div className="text-[14px] font-bold text-gray-900 flex items-center min-w-0">
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
