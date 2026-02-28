'use client';
import React from 'react';
import {
  FiHome,
  FiTrash2,
  FiEdit2,
  FiMoreVertical,
  FiBriefcase,
  FiMapPin,
} from 'react-icons/fi';

export default function AddressCard({
  data,
  activeMenu,
  setActiveMenu,
  onDelete,
  onSetDefault, // Renamed to match the hook's naming convention
}) {
  const isOpen = activeMenu === data.id;

  // Helper to get icon based on address type
  const getIcon = type => {
    switch (type?.toUpperCase()) {
      case 'HOME':
        return <FiHome size={22} />;
      case 'OFFICE':
        return <FiBriefcase size={22} />;
      default:
        return <FiMapPin size={22} />;
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-5 sm:p-6 pt-8 relative flex flex-col items-center w-full transition-all hover:border-gray-200">
      {/* Floating Header Section */}
      <div className="w-[96%] sm:w-[94%] bg-white border border-gray-100 rounded-[24px] sm:rounded-full px-4 sm:px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 shadow-[0_4px_10px_rgba(0,0,0,0.02)] gap-4 sm:gap-0">
        {/* Left: Identity */}
        <div className="flex items-center gap-3 overflow-hidden w-full sm:w-auto">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-(--color-primary-50) rounded-full flex items-center justify-center text-(--color-primary-500) shrink-0">
            {getIcon(data.address_type)}
          </div>
          <div className="flex flex-col overflow-hidden">
            <h3 className="text-[15px] sm:text-[17px] font-bold text-gray-900 leading-tight truncate">
              {data.full_name || 'No Name'}
            </h3>
            <p className="text-[12px] sm:text-[13px] text-gray-500 truncate">
              {data.email}
            </p>
          </div>
        </div>

        {/* Right: Actions & Badge */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 relative shrink-0 w-full sm:w-auto border-t border-gray-50 sm:border-none pt-3 sm:pt-0">
          {data.is_default && (
            <span className="bg-(--success-50) text-(--success-500) text-[9px] sm:text-[10px] font-black px-3 py-1 rounded-full border border-(--success-100) uppercase mr-1 tracking-wider">
              Default
            </span>
          )}

          {!data.is_default && (
            <button
              onClick={() => onDelete && onDelete(data.id)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-100 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <FiTrash2 size={16} />
            </button>
          )}

          <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-100 flex items-center justify-center text-(--color-primary-500) hover:bg-(--color-primary-50) transition-colors cursor-pointer">
            <FiEdit2 size={16} />
          </button>

          <div className="relative">
            <button
              onClick={e => {
                e.stopPropagation();
                setActiveMenu(isOpen ? null : data.id);
              }}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer ${isOpen ? 'bg-gray-100' : ''}`}
            >
              <FiMoreVertical size={18} />
            </button>

            {/* Context Menu Popover */}
            {isOpen && (
              <div
                className="absolute right-0 top-[calc(100%+12px)] z-30 bg-white border border-gray-100 rounded-2xl py-3 px-4 flex items-center gap-3 min-w-[180px] animate-in fade-in zoom-in-95 duration-200 shadow-xl"
                onClick={e => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  id={`default-${data.id}`}
                  checked={data.is_default}
                  disabled={data.is_default}
                  onChange={() => {
                    if (onSetDefault) {
                      onSetDefault(data.id);
                      setActiveMenu(null);
                    }
                  }}
                  className="w-5 h-5 rounded border-gray-300 text-(--color-primary-500) focus:ring-(--color-primary-500) cursor-pointer accent-(--color-primary-500)"
                />
                <label
                  htmlFor={`default-${data.id}`}
                  className="text-[14px] text-gray-900 whitespace-nowrap font-bold cursor-pointer"
                >
                  Set as Default
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Section - Updated with Real API Keys */}
      <div className="w-full space-y-4 px-2 sm:px-4">
        <DetailRow label="PHONE NUMBER" value={data.phone} />
        <DetailRow label="GENDER" value={data.gender_display || data.gender} />
        <DetailRow label="DISTRICT" value={data.district} />
        <DetailRow label="THANA" value={data.thana} />
        <DetailRow label="FULL ADDRESS" value={data.address} />
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between text-[14px] sm:text-[15px] w-full gap-1 sm:gap-0">
      <div className="flex items-center shrink-0">
        <span className="text-[10px] sm:text-[11px] text-gray-400 font-black tracking-[0.15em] uppercase">
          {label}
        </span>
        <span className="hidden sm:inline text-gray-200 mx-4">-</span>
      </div>
      <span className="text-gray-900 font-bold leading-relaxed text-left sm:text-right break-words">
        {value || 'N/A'}
      </span>
    </div>
  );
}
