'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FiPlus, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { useAddress } from '../../hooks/useAddress';
import UiButton from '@/app/(public)/components/UiButton';
import AddressCard from './components/AddressCard';

export default function ManageAddressPage() {
  const {
    addresses,
    isLoading,
    showSuccess,
    setShowSuccess,
    removeAddress,
    setDefaultAddress,
  } = useAddress();

  const [activeMenu, setActiveMenu] = useState(null);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-40">
        <div className="w-10 h-10 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="w-full space-y-6 animate-in fade-in duration-700 pb-20"
      onClick={() => setActiveMenu(null)}
    >
      {/* 4. PHONE SCREEN - Mobile Header */}
      <div className="flex items-center gap-4 lg:hidden mb-2">
        <Link
          href="/user"
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          Manage Address
        </h1>
      </div>

      {/* Main Container with 4-Level Responsive Padding */}
      <div
        className="bg-white rounded-[32px] border border-gray-100/50 min-h-[600px]
        p-5           /* 4. Phone Screen */
        md:p-8        /* 3. Tab Screen */
        lg:p-10       /* 2. Laptop Screen */
        xl:p-14       /* 1. Large Screen */
      "
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="space-y-1">
            <h1
              className="font-bold text-gray-900 tracking-tight
              text-2xl        /* Phone */
              md:text-3xl     /* Tab */
              lg:text-[32px]  /* Laptop/Large */
            "
            >
              Manage Address
            </h1>
            <p className="text-gray-500 text-sm md:text-base font-medium">
              Set your default shipping destination for faster checkout.
            </p>
          </div>

          <Link href="/user/address/new" className="w-full md:w-auto">
            <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-(--color-primary-500) hover:brightness-110 text-white px-8 h-[52px] rounded-full text-[15px] font-bold transition-all cursor-pointer active:scale-95 shadow-none">
              <FiPlus size={20} strokeWidth={3} />
              Add New Address
            </button>
          </Link>
        </div>

        {/* 
          Address Grid - 4 Breakpoint Strategy:
          1. Large Screen (xl): grid-cols-2 (2 Cards per row)
          2. Laptop Screen (lg): grid-cols-1 (1 Card per row)
          3. Tab Screen (md): grid-cols-1 (1 Card per row)
          4. Phone Screen (base): grid-cols-1 (1 Card per row)
        */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
          {addresses.map(item => (
            <AddressCard
              key={item.id}
              data={item}
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
              onDelete={removeAddress}
              onSetDefault={setDefaultAddress}
            />
          ))}

          {addresses.length === 0 && (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                <FiPlus size={32} />
              </div>
              <p className="text-gray-400 font-bold max-w-xs">
                No addresses found. Click "Add New Address" to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowSuccess(false)}
          />
          <div className="relative bg-white rounded-[40px] p-8 md:p-12 flex flex-col items-center text-center max-w-sm w-full border border-gray-100 shadow-2xl">
            <div className="w-20 h-20 bg-green-50 text-(--color-success-500) rounded-full flex items-center justify-center mb-6">
              <FiCheckCircle size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-500 mb-8 font-medium leading-relaxed">
              Your address preferences have been updated.
            </p>
            <UiButton onClick={() => setShowSuccess(false)}>GOT IT</UiButton>
          </div>
        </div>
      )}
    </div>
  );
}
