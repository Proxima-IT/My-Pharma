'use client';
import React from 'react';
import { FiCheck } from 'react-icons/fi';
import { formatDate } from '../../../lib/formatters';

export default function PrescriptionCard({ item, isSelected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className={`relative bg-white rounded-2xl border-[5px] transition-all cursor-pointer ${
        isSelected
          ? 'border-primary-500 ring-0'
          : 'border-white ring-1 ring-gray-100'
      }`}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-10 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center animate-in zoom-in duration-300">
          <FiCheck size={14} strokeWidth={4} />
        </div>
      )}

      {/* Image Container - Now rounded on all corners */}
      <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden rounded-[11px]">
        {item.file ? (
          <img
            src={item.file}
            alt="Prescription"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200 font-bold text-xs uppercase tracking-widest">
            No Preview
          </div>
        )}
      </div>

      {/* Text Section */}
      <div className="p-4 flex flex-col gap-0.5">
        <p className="text-sm font-bold text-gray-900">
          {formatDate(item.created_at)}
        </p>
        <p className="text-gray-400 font-medium text-[11px]">Uploading Date</p>
      </div>
    </div>
  );
}
