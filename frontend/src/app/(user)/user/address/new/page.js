'use client';

import React from 'react';
import Link from 'next/link';
import { FiChevronDown, FiChevronRight, FiArrowLeft } from 'react-icons/fi';
import UiInput from '@/app/(public)/components/UiInput';

export default function AddNewAddressPage() {
  // Styling for select fields to match UiInput's internal default styling exactly
  const selectContainerClass = 'flex flex-col gap-2';
  const labelClass = 'text-[13px] font-bold text-gray-600 ml-5';
  const selectClass =
    'w-full py-3.5 px-6 bg-white border border-gray-200 rounded-full text-sm text-gray-900 outline-none appearance-none cursor-pointer transition-all duration-300 focus:ring-4 focus:ring-primary-50/50 focus:border-primary-500';

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Mobile Back Button */}
      <div className="flex items-center gap-4 lg:hidden mb-2">
        <Link href="/user/address" className="p-2 -ml-2 text-gray-600">
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Add Address</h1>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[32px] p-8 md:p-12 border border-gray-100/50 w-full">
        <h2 className="text-[24px] font-bold text-gray-900 mb-10 tracking-tight">
          Shipping Information
        </h2>

        <form className="space-y-8" onSubmit={e => e.preventDefault()}>
          {/* Full Name */}
          <UiInput label="Full name" placeholder="Abu Fahim" />

          {/* Email & Phone Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <UiInput
              label="Email address"
              placeholder="design.fahim@gmail.com"
            />
            <UiInput label="Phone Number" placeholder="+880 1347598372" />
          </div>

          {/* Gender Select - Kept as Select per requirement */}
          <div className={selectContainerClass}>
            <label className={labelClass}>Gender</label>
            <div className="relative group">
              <select className={selectClass}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-focus-within:text-primary-500">
                <FiChevronDown size={18} />
              </div>
            </div>
          </div>

          {/* District & Thana Row - Converted to UiInput */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <UiInput label="District" placeholder="Kushtia" />
            <UiInput label="Thana" placeholder="Bheramara" />
          </div>

          {/* Full Address - Converted to UiInput */}
          <UiInput
            label="Full address"
            placeholder="Kacharipara, Mirpur, Kushtia"
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4">
            <Link href="/user/address">
              <button
                type="button"
                className="px-10 h-[52px] rounded-full text-[13px] font-bold uppercase tracking-widest text-primary-500 bg-primary-25 hover:bg-primary-50 transition-all"
              >
                Cancel
              </button>
            </Link>

            <button
              type="submit"
              className="flex items-center gap-3 bg-primary-500 hover:bg-primary-600 text-white px-10 h-[52px] rounded-full text-[13px] font-bold uppercase tracking-widest transition-all"
            >
              <span>Add Save Address</span>
              <FiChevronRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
