'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { useAddress } from '../../hooks/useAddress';
import UiButton from '@/app/(public)/components/UiButton';
import AddressCard from './components/AddressCard';

export default function ManageAddressPage() {
  const { isLoading, showSuccess, setShowSuccess } = useAddress();
  const [activeMenu, setActiveMenu] = useState(null);

  // Local state for dynamic UI interaction
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: 'Abu Fahim',
      email: 'design.fahim@proton.me',
      isDefault: true,
      phone: '+880 1347598372',
      gender: 'Male',
      deistic: 'Kushtia',
      thana: 'Bheramara',
      fullAddress: 'kasaripara, Merpur, Kushtia',
    },
    {
      id: 2,
      name: 'Bayzid Aman',
      email: 'bayzidaman@gmail.com',
      isDefault: false,
      phone: '+880 1347598372',
      gender: 'Male',
      deistic: 'Kushtia',
      thana: 'Bheramara',
      fullAddress: 'kasaripara, Merpur, Kushtia',
    },
    {
      id: 3,
      name: 'Bayzid Aman',
      email: 'bayzidaman@gmail.com',
      isDefault: false,
      phone: '+880 1347598372',
      gender: 'Male',
      deistic: 'Kushtia',
      thana: 'Bheramara',
      fullAddress: 'kasaripara, Merpur, Kushtia',
    },
  ]);

  const handlePageClick = () => {
    if (activeMenu) setActiveMenu(null);
  };

  // Dynamic UI Logic: Delete
  const handleDelete = id => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  // Dynamic UI Logic: Make Default
  const handleMakeDefault = id => {
    setAddresses(prev =>
      prev.map(addr => ({
        ...addr,
        isDefault: addr.id === id,
      })),
    );
    setShowSuccess(true); // Show success popup when default changes
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-40">
        <div className="w-10 h-10 border-4 border-(--primary-500) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="w-full space-y-6 animate-in fade-in duration-700 pb-20"
      onClick={handlePageClick}
    >
      {/* Mobile Back Button */}
      <div className="flex items-center gap-4 lg:hidden mb-2">
        <Link href="/user" className="p-2 -ml-2 text-gray-600">
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Manage Address</h1>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[32px] p-6 md:p-10 border border-gray-100/50 min-h-[600px]">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">
            Manage Address
          </h1>
          <Link href="/user/address/new">
            <button className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-8 h-[52px] rounded-full text-[15px] font-bold transition-all">
              <FiPlus size={20} strokeWidth={3} />
              Add New Address
            </button>
          </Link>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {addresses.map(item => (
            <AddressCard
              key={item.id}
              data={item}
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
              onDelete={handleDelete}
              onMakeDefault={handleMakeDefault}
            />
          ))}

          {addresses.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400 font-medium">
              No addresses found. Click &quot;Add New Address&quot; to get
              started.
            </div>
          )}
        </div>
      </div>

      {/* Success Popup Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/10"
            onClick={() => setShowSuccess(false)}
          />
          <div className="relative bg-white rounded-[40px] p-10 flex flex-col items-center text-center max-w-sm w-full border border-gray-100">
            <div className="w-24 h-24 bg-green-50 text-(--success-500) rounded-full flex items-center justify-center mb-6">
              <FiCheckCircle size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Address Updated
            </h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Your primary delivery location has been updated successfully.
            </p>
            <UiButton onClick={() => setShowSuccess(false)}>OKAY</UiButton>
          </div>
        </div>
      )}
    </div>
  );
}
