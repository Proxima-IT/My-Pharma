'use client';
import React from 'react';
import { FiHome, FiTrash2, FiEdit2, FiMoreVertical } from 'react-icons/fi';

export default function AddressCard({
  data,
  activeMenu,
  setActiveMenu,
  onDelete,
  onMakeDefault,
}) {
  const isOpen = activeMenu === data.id;

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-5 sm:p-6 pt-8 relative flex flex-col items-center w-full transition-all">
      {/* Floating Header Section: Responsive flex-col on mobile, flex-row on sm+ */}
      <div className="w-[96%] sm:w-[94%] bg-white border border-gray-100 rounded-[24px] sm:rounded-full px-4 sm:px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 shadow-[0_4px_10px_rgba(0,0,0,0.03)] gap-4 sm:gap-0">
        {/* Left: Identity */}
        <div className="flex items-center gap-3 overflow-hidden w-full sm:w-auto">
          {/* Home Icon: No border, just background */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-(--color-primary-50) rounded-full flex items-center justify-center text-(--color-primary-500) shrink-0">
            <FiHome size={22} />
          </div>
          <div className="flex flex-col overflow-hidden">
            <h3 className="text-[15px] sm:text-[17px] font-bold text-gray-900 leading-tight truncate">
              {data.name}
            </h3>
            <p className="text-[12px] sm:text-[13px] text-gray-500 truncate">
              {data.email}
            </p>
          </div>
        </div>

        {/* Right: Actions & Badge - Full width on mobile to allow separation */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 relative shrink-0 w-full sm:w-auto border-t border-gray-50 sm:border-none pt-3 sm:pt-0">
          {data.isDefault && (
            <span className="bg-(--success-50) text-(--success-500) text-[9px] sm:text-[10px] font-bold px-2 sm:px-3 py-1 rounded-full border border-(--success-100) uppercase mr-1">
              Default
            </span>
          )}

          {!data.isDefault && (
            <button
              onClick={() => onDelete(data.id)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-100 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
            >
              <FiTrash2 size={16} />
            </button>
          )}

          <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-100 flex items-center justify-center text-(--color-primary-500) hover:bg-(--color-primary-50) transition-colors">
            <FiEdit2 size={16} />
          </button>

          <div className="relative">
            {/* Three dots: No border */}
            <button
              onClick={e => {
                e.stopPropagation();
                setActiveMenu(isOpen ? null : data.id);
              }}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors ${isOpen ? 'bg-gray-100' : ''}`}
            >
              <FiMoreVertical size={18} />
            </button>

            {/* Context Menu Popover */}
            {isOpen && (
              <div
                className="absolute right-0 top-[calc(100%+12px)] z-30 bg-white border border-gray-100 rounded-2xl py-3 px-4 flex items-center gap-3 min-w-[160px] animate-in fade-in zoom-in-95 duration-200 shadow-lg"
                onClick={e => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={data.isDefault}
                  onChange={() => {
                    onMakeDefault(data.id);
                    setActiveMenu(null);
                  }}
                  className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500 cursor-pointer accent-primary-500"
                />
                <span className="text-[14px] sm:text-[15px] text-gray-900 whitespace-nowrap font-medium">
                  Make Default
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="w-full space-y-4 px-2 sm:px-4">
        <DetailRow label="PHONE NUMBER" value={data.phone} />
        <DetailRow label="GENDER" value={data.gender} />
        <DetailRow label="DEISTIC" value={data.deistic} />
        <DetailRow label="THANA" value={data.thana} />
        <DetailRow label="FULL ADDRESS" value={data.fullAddress} />
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between text-[14px] sm:text-[15px] w-full gap-1 sm:gap-0">
      <div className="flex items-center shrink-0">
        <span className="text-[11px] sm:text-[13px] text-gray-500 font-medium tracking-[0.5px] uppercase">
          {label}
        </span>
        <span className="hidden sm:inline text-gray-400 mx-4">-</span>
      </div>
      <span className="text-gray-900 font-medium leading-relaxed text-left sm:text-right break-words">
        {value}
      </span>
    </div>
  );
}
