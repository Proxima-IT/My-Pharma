'use client';
import React from 'react';

/**
 * OrderInfoCard Component
 * Responsive scaling for all screen sizes (Phone to Desktop).
 * Design: White background, 1px border, Black text, Thin labels.
 * Updated: Added subValue support to display delivery fee breakdowns (Base + Option Charge).
 */
export default function OrderInfoCard({ label, value, subValue, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-[20px] md:rounded-[24px] p-3.5 sm:p-5 flex flex-col gap-1 w-full transition-all hover:border-gray-200">
      <span className="text-[9px] md:text-[10px] font-light text-black uppercase tracking-[0.15em] truncate opacity-60">
        {label}
      </span>
      <div className="text-[13px] md:text-[14px] font-bold text-black flex flex-col items-start min-w-0">
        <div className="flex items-center w-full">
          {value && (
            <span className="truncate" title={value}>
              {value}
            </span>
          )}
          {children}
        </div>

        {/* Display breakdown info if provided (e.g., Base Fee + Express Charge) */}
        {subValue && (
          <span className="text-[10px] font-mono font-medium text-gray-400 mt-0.5 leading-none">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}
