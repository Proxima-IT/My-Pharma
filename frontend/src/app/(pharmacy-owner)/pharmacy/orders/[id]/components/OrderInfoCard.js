'use client';
import React from 'react';

export default function OrderInfoCard({
  label,
  value,
  children,
  badge,
  badgeType = 'success',
}) {
  const badgeStyles = {
    success:
      'bg-(--color-admin-success) text-white border-(--color-admin-border)',
    error: 'bg-(--color-admin-error) text-white border-(--color-admin-border)',
    warning:
      'bg-(--color-admin-warning) text-black border-(--color-admin-border)',
    neutral: 'bg-(--color-gray-200) text-black border-(--color-admin-border)',
  };

  return (
    <div className="bg-(--color-admin-card) border border-(--color-admin-border) p-5 flex flex-col gap-2 w-full rounded-none transition-colors duration-300 hover:bg-white">
      <span className="font-mono text-[10px] font-bold text-(--color-text-secondary) uppercase tracking-[0.2em]">
        {label.replace(/ /g, '_')}
      </span>

      <div className="flex items-center flex-wrap gap-3">
        {value && (
          <span className="font-mono text-lg font-bold text-(--color-admin-navy) tracking-tighter">
            {value}
          </span>
        )}

        {badge && (
          <span
            className={`px-2 py-0.5 border font-mono text-[10px] font-bold uppercase tracking-tighter ${badgeStyles[badgeType] || badgeStyles.neutral}`}
          >
            {badge}
          </span>
        )}
        {children}
      </div>
    </div>
  );
}
