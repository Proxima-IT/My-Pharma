'use client';

import React from 'react';
import Link from 'next/link';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { FiHome, FiChevronDown, FiAlertCircle } from 'react-icons/fi';
import { formatCurrency } from '@/app/(user)/lib/formatters';

/**
 * PrescriptionOrderForm Component
 * Updated: Shipping Address section is now 100% identical to the standard ShippingAddressCard design.
 * Features: Identity section, Detail rows, Duration selection, and Note area.
 */
const PrescriptionOrderForm = ({
  durations,
  selectedDurationId,
  setSelectedDurationId,
  note,
  setNote,
  address,
  onOpenAddressPopup,
  onOrder,
  isPlacingOrder,
  orderError,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Shipping Address Card - 100% Match to Example */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-6 sm:p-8 flex flex-col w-full transition-all">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Shipping Address
          </h2>
          <button
            onClick={onOpenAddressPopup}
            className="flex items-center gap-1.5 bg-(--color-primary-50)/50 border border-(--color-primary-100) rounded-full px-4 py-2 text-[13px] font-bold text-(--color-primary-500) hover:bg-(--color-primary-50) transition-all cursor-pointer"
          >
            Change
            <FiChevronDown size={16} />
          </button>
        </div>

        {address ? (
          <>
            {/* Floating Identity Section */}
            <div className="w-full bg-white border border-gray-100 rounded-[24px] sm:rounded-full px-4 sm:px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 shadow-[0_4px_10px_rgba(0,0,0,0.03)] gap-4 sm:gap-0">
              <div className="flex items-center gap-3 overflow-hidden w-full sm:w-auto">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-(--color-primary-50) rounded-full flex items-center justify-center text-(--color-primary-500) shrink-0">
                  <FiHome size={22} />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <h3 className="text-[15px] sm:text-[17px] font-bold text-gray-900 leading-tight truncate">
                    {address.full_name}
                  </h3>
                  <p className="text-[12px] sm:text-[13px] text-gray-500 truncate">
                    {address.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end shrink-0 w-full sm:w-auto border-t border-gray-50 sm:border-none pt-3 sm:pt-0">
                {address.is_default && (
                  <span className="bg-(--success-50) text-(--success-500) text-[9px] sm:text-[10px] font-bold px-3 py-1 rounded-full border border-(--success-100) uppercase">
                    Default
                  </span>
                )}
              </div>
            </div>

            {/* Address Details Section */}
            <div className="w-full space-y-4 px-2 sm:px-4">
              <DetailRow label="PHONE NUMBER" value={address.phone} />
              <DetailRow
                label="GENDER"
                value={address.gender_display || address.gender}
              />
              <DetailRow label="DEISTIC" value={address.district} />
              <DetailRow label="THANA" value={address.thana} />
              <DetailRow label="FULL ADDRESS" value={address.address} />
            </div>
          </>
        ) : (
          <div className="py-10 text-center">
            <p className="text-gray-400 text-sm italic">
              No default address found.
            </p>
            <button
              onClick={onOpenAddressPopup}
              className="mt-4 text-(--color-primary-500) font-bold underline"
            >
              Select Address
            </button>
          </div>
        )}
      </div>

      {/* 2. Order Parameters Card */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-gray-100">
        <div className="mb-8">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
            Medicine Supply Duration
          </h3>
          <div className="flex gap-3 flex-wrap">
            {durations.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDurationId(d.id)}
                className={`px-6 py-3 rounded-full border-2 text-[14px] font-bold transition-all cursor-pointer ${
                  selectedDurationId === d.id
                    ? 'bg-[#EEF2FF] border-[#1D3583] text-[#1D3583]'
                    : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block">
            Prescription Note
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Enter note for your uploading prescription..."
            className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[24px] text-[15px] focus:outline-none focus:bg-white focus:border-(--color-primary-500)/30 transition-all resize-none"
            rows="4"
          />
        </div>

        <div className="mb-8 p-5 bg-[#F0FDF4] border-2 border-dashed border-[#10B981]/30 rounded-[24px]">
          <p className="text-[14px] text-[#10B981] font-medium leading-relaxed">
            One My Pharma representative will call you shortly for confirming
            this order.
          </p>
        </div>

        {orderError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
            <FiAlertCircle className="shrink-0" />
            <p className="text-xs font-bold uppercase">
              {typeof orderError === 'string' ? orderError : 'Order Failed'}
            </p>
          </div>
        )}

        <button
          onClick={onOrder}
          disabled={isPlacingOrder}
          className="w-full h-16 bg-[#1D3583] hover:bg-[#162a6b] text-white rounded-full text-lg font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-none"
        >
          {isPlacingOrder ? 'Processing...' : 'Order Prescription'}
          <MdKeyboardArrowRight size={24} />
        </button>

        <p className="mt-6 text-[12px] text-gray-400 text-center leading-relaxed px-4">
          By continuing you agree to our{' '}
          <Link href="/terms" className="underline">
            Terms
          </Link>
          ,{' '}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link href="/return-policy" className="underline">
            Refund Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

/**
 * DetailRow Helper Component
 * Matches the exact layout of the example ShippingAddressCard.
 */
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

export default PrescriptionOrderForm;
