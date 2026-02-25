'use client';

import React, { useState } from 'react';
import { FiMapPin, FiCheck, FiX, FiPlus } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

const AddressSelectorPopup = ({ isOpen, onClose, onSelect }) => {
  const router = useRouter();

  // Mock data with distinct information for each address
  const [addresses, setAddresses] = useState([
    {
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
    },
    {
      id: 2,
      label: 'Office',
      name: 'Abu Fahim',
      email: 'work.fahim@company.com',
      phone: '+880 1711223344',
      gender: 'Male',
      deistic: 'Dhaka',
      thana: 'Dhanmondi',
      fullAddress: 'House 12, Road 5, Dhanmondi, Dhaka',
      isDefault: false,
    },
    {
      id: 3,
      label: 'Other',
      name: 'Abu Fahim',
      email: 'design.fahim@proton.me',
      phone: '+880 1999888777',
      gender: 'Male',
      deistic: 'Dhaka',
      thana: 'Gulshan',
      fullAddress: 'Flat 4B, Lakeview, Gulshan 2, Dhaka',
      isDefault: false,
    },
  ]);

  if (!isOpen) return null;

  const handleSelect = addr => {
    // 1. Update local UI state to show which one is active in the list
    setAddresses(prev =>
      prev.map(a => ({
        ...a,
        isDefault: a.id === addr.id,
      })),
    );

    // 2. Pass the selected object back to the ShippingAddressCard
    if (onSelect) {
      onSelect({ ...addr, isDefault: true });
    }
  };

  const handleAddNew = () => {
    onClose();
    router.push('/user/address/new');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white border border-(--color-gray-100) rounded-[32px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-8 py-6 border-b border-(--color-gray-50)">
          <h2 className="text-xl font-bold text-(--color-gray-900) tracking-tight">
            Address
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-(--color-gray-100) flex items-center justify-center text-(--color-gray-400) hover:text-(--color-gray-900) transition-colors cursor-pointer"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
          {addresses.map(addr => (
            <div
              key={addr.id}
              onClick={() => handleSelect(addr)}
              className={`p-5 rounded-[24px] border transition-all cursor-pointer flex items-start gap-4 ${
                addr.isDefault
                  ? 'bg-(--color-primary-500) border-(--color-primary-500)'
                  : 'border-(--color-gray-100) bg-white hover:bg-(--color-gray-50)'
              }`}
            >
              <div
                className={`mt-1 shrink-0 ${addr.isDefault ? 'text-white' : 'text-(--color-gray-400)'}`}
              >
                <FiMapPin size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-[15px] font-bold truncate ${addr.isDefault ? 'text-white' : 'text-(--color-gray-900)'}`}
                  >
                    {addr.label}
                  </p>
                  {addr.isDefault && (
                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-(--color-primary-500) shrink-0">
                      <FiCheck size={12} strokeWidth={4} />
                    </div>
                  )}
                </div>
                <p
                  className={`text-sm leading-relaxed mt-1 ${addr.isDefault ? 'text-white/80' : 'text-(--color-gray-500)'}`}
                >
                  {addr.fullAddress}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 pt-2">
          <button
            onClick={handleAddNew}
            className="w-full h-14 bg-white border-2 border-dashed border-(--color-gray-200) text-(--color-gray-600) rounded-full text-[15px] font-bold flex items-center justify-center gap-2 hover:border-(--color-primary-500) hover:text-(--color-primary-500) transition-all cursor-pointer group"
          >
            <FiPlus
              size={18}
              className="group-hover:scale-110 transition-transform"
            />
            Add New Address
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressSelectorPopup;
