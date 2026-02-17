'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiMapPin,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiArrowLeft,
  FiCheckCircle,
  FiMap,
  FiShield,
} from 'react-icons/fi';
import { useAddress } from '../../hooks/useAddress';
import { isValidAddress } from '../../lib/addressUtils';
import UiButton from '@/app/(public)/components/UiButton';

export default function ManageAddressPage() {
  const {
    address,
    setAddress,
    isLoading,
    isUpdating,
    error,
    showSuccess,
    setShowSuccess,
    saveAddress,
    clearAddress,
  } = useAddress();

  const [isEditing, setIsEditing] = useState(false);
  const [tempAddress, setTempAddress] = useState('');

  // Sync temp address when entering edit mode
  const handleStartEdit = () => {
    setTempAddress(address);
    setIsEditing(true);
  };

  const handleSave = async e => {
    e.preventDefault();
    await saveAddress(tempAddress);
    setIsEditing(false);
  };

  // Disable scrolling when success popup is open
  useEffect(() => {
    if (showSuccess) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSuccess]);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-40">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Mobile Back Button */}
      <Link
        href="/user"
        className="inline-flex lg:hidden items-center gap-2 text-sm font-semibold text-primary-500 hover:text-primary-700 transition-colors mb-2"
      >
        <FiArrowLeft /> Back to Menu
      </Link>

      {/* Success Popup Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/10"
            onClick={() => setShowSuccess(false)}
          />
          <div className="relative bg-white rounded-[40px] p-10 flex flex-col items-center text-center max-w-sm w-full shadow-[0_20px_70px_-10px_rgba(0,0,0,0.15)] border border-gray-100 animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
              <FiCheckCircle size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Address Saved
            </h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Your delivery location has been updated successfully.
            </p>
            <UiButton onClick={() => setShowSuccess(false)}>OKAY</UiButton>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="hidden lg:block">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Manage Address
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-normal">
          Your primary delivery location for all orders.
        </p>
      </div>

      {/* Main Address Card */}
      <div className="bg-white rounded-[40px] p-8 md:p-12 border border-gray-100/50 w-full shadow-sm">
        {isEditing ? (
          /* EDIT MODE */
          <form
            onSubmit={handleSave}
            className="space-y-6 animate-in fade-in duration-500"
          >
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-gray-600">
                Full Delivery Address
              </label>
              <textarea
                className="w-full min-h-[120px] p-5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-primary-50/50 focus:border-primary-500 transition-all text-sm text-gray-900 leading-relaxed resize-none"
                placeholder="Enter your house no, road, area and city..."
                value={tempAddress}
                onChange={e => setTempAddress(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="flex-1">
                <UiButton
                  type="submit"
                  isLoading={isUpdating}
                  disabled={!isValidAddress(tempAddress)}
                >
                  SAVE ADDRESS
                </UiButton>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-8 py-4 rounded-full font-bold text-[13px] uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : address ? (
          /* DISPLAY MODE */
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 animate-in fade-in duration-500">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-500 shrink-0">
                <FiMapPin size={32} />
              </div>
              <div className="space-y-2">
                <span className="px-3 py-1 bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                  Primary Address
                </span>
                <p className="text-lg font-semibold text-gray-900 leading-relaxed max-w-md">
                  {address}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleStartEdit}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 text-gray-700 rounded-full text-xs font-bold hover:bg-gray-100 transition-all"
              >
                <FiEdit2 size={14} /> EDIT
              </button>
              <button
                onClick={clearAddress}
                className="w-12 h-12 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors"
                title="Remove Address"
              >
                <FiTrash2 size={20} />
              </button>
            </div>
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center text-center py-10 space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
              <FiMap size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">
                No address added
              </h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Add your delivery address now to enjoy faster checkouts on your
                next order.
              </p>
            </div>
            <div className="pt-4 w-full max-w-xs">
              <UiButton onClick={() => setIsEditing(true)}>
                <div className="flex items-center gap-2">
                  <FiPlus strokeWidth={3} />
                  <span>ADD NEW ADDRESS</span>
                </div>
              </UiButton>
            </div>
          </div>
        )}
      </div>

      {/* Security Note */}
      <div className="flex items-center justify-center gap-2 text-gray-400 pt-4">
        <FiShield className="text-sm" />
        <p className="text-[10px] font-bold uppercase tracking-widest">
          Your data is encrypted and used only for logistics
        </p>
      </div>
    </div>
  );
}
