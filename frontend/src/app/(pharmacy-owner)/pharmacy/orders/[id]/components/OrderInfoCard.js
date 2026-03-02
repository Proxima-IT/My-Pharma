'use client';
import React from 'react';

/**
 * OrderInfoCard Component
 * Updated to support status badges (e.g., Paid/Unpaid) and payment methods.
 */
export default function OrderInfoCard({
  label,
  value,
  children,
  badge,
  badgeType = 'success',
}) {
  // Define badge styles based on type
  const badgeStyles = {
    success: 'bg-green-50 text-(--success-600) border-green-100',
    error: 'bg-red-50 text-red-600 border-red-100',
    warning: 'bg-orange-50 text-orange-600 border-orange-100',
    neutral: 'bg-gray-50 text-gray-600 border-gray-100',
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[24px] p-4 sm:p-5 flex flex-col gap-1.5 sm:gap-2.5 w-full min-w-0 transition-all hover:border-gray-200">
      {/* Label: High-end tracking and bold hierarchy */}
      <span className="text-[10px] sm:text-[11px] font-black text-gray-400 whitespace-nowrap uppercase tracking-[0.15em] truncate">
        {label}
      </span>

      {/* Value Container */}
      <div className="flex items-center flex-wrap gap-2 min-w-0">
        {value && (
          <span
            className="text-[14px] sm:text-[16px] font-black text-gray-900 truncate"
            title={value}
          >
            {value}
          </span>
        )}

        {/* Status Badge: For Payment Status (Paid/Unpaid) */}
        {badge && (
          <span
            className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${badgeStyles[badgeType] || badgeStyles.neutral}`}
          >
            {badge}
          </span>
        )}

        {children}
      </div>
    </div>
  );
}
