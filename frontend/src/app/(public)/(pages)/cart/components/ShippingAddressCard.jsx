'use client';

import React, { useState } from 'react';
import { FiHome, FiChevronDown } from 'react-icons/fi';
import AddressSelectorPopup from '@/app/(public)/components/AddressSelectorPopup';

const ShippingAddressCard = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // 1. State to hold the currently selected address
  const [currentAddress, setCurrentAddress] = useState({
    id: 1,
    label: 'Home',
    name: 'Abu Fahim',
    email: 'design.fahim@proton.me',
    phone: '+880 1347598372',
    gender: 'Male',
    deistic: 'Kushtia',
    thana: 'Bheramara',
    fullAddress: 'kasaripara, Merpur, Kushtia',
    isDefault: true,
  });

  // 2. Handler to receive new address from Popup
  const handleSelectAddress = newAddr => {
    setCurrentAddress(newAddr);
    setIsPopupOpen(false);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-6 sm:p-8 flex flex-col w-full transition-all">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Shipping Address
        </h2>
        <button
          onClick={() => setIsPopupOpen(true)}
          className="flex items-center gap-1.5 bg-(--color-primary-50)/50 border border-(--color-primary-100) rounded-full px-4 py-2 text-[13px] font-bold text-(--color-primary-500) hover:bg-(--color-primary-50) transition-all cursor-pointer"
        >
          Change
          <FiChevronDown size={16} />
        </button>
      </div>

      {/* Floating Identity Section - Dynamic Data */}
      <div className="w-full bg-white border border-gray-100 rounded-[24px] sm:rounded-full px-4 sm:px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 shadow-[0_4px_10px_rgba(0,0,0,0.03)] gap-4 sm:gap-0">
        <div className="flex items-center gap-3 overflow-hidden w-full sm:w-auto">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-(--color-primary-50) rounded-full flex items-center justify-center text-(--color-primary-500) shrink-0">
            <FiHome size={22} />
          </div>
          <div className="flex flex-col overflow-hidden">
            <h3 className="text-[15px] sm:text-[17px] font-bold text-gray-900 leading-tight truncate">
              {currentAddress.name}
            </h3>
            <p className="text-[12px] sm:text-[13px] text-gray-500 truncate">
              {currentAddress.email}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end shrink-0 w-full sm:w-auto border-t border-gray-50 sm:border-none pt-3 sm:pt-0">
          {currentAddress.isDefault && (
            <span className="bg-(--success-50) text-(--success-500) text-[9px] sm:text-[10px] font-bold px-3 py-1 rounded-full border border-(--success-100) uppercase">
              Default
            </span>
          )}
        </div>
      </div>

      {/* Address Details Section - Dynamic Data */}
      <div className="w-full space-y-4 px-2 sm:px-4">
        <DetailRow label="PHONE NUMBER" value={currentAddress.phone} />
        <DetailRow label="GENDER" value={currentAddress.gender} />
        <DetailRow label="DEISTIC" value={currentAddress.deistic} />
        <DetailRow label="THANA" value={currentAddress.thana} />
        <DetailRow label="FULL ADDRESS" value={currentAddress.fullAddress} />
      </div>

      {/* Popup Integration */}
      <AddressSelectorPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSelect={handleSelectAddress}
      />
    </div>
  );
};

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

export default ShippingAddressCard;
