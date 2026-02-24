'use client';

import React, { useState } from 'react';
import { FiMapPin, FiCheck, FiX, FiPlus } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

const AddressSelectorPopup = ({ isOpen, onClose }) => {
  const router = useRouter();

  // Mock data for UI
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      label: 'Home',
      address: 'Kushtia, Khulna, Bangladesh',
      isDefault: true,
    },
    {
      id: 2,
      label: 'Office',
      address: 'Dhanmondi, Dhaka, Bangladesh',
      isDefault: false,
    },
    {
      id: 3,
      label: 'Other',
      address: 'Gulshan 2, Dhaka, Bangladesh',
      isDefault: false,
    },
  ]);

  if (!isOpen) return null;

  const handleSelectDefault = id => {
    setAddresses(prev =>
      prev.map(addr => ({
        ...addr,
        isDefault: addr.id === id,
      })),
    );
  };

  const handleAddNew = () => {
    onClose();
    router.push('/user/address/new');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white border border-(--color-gray-100) rounded-[32px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
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

        {/* Address List */}
        <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
          {addresses.map(addr => (
            <div
              key={addr.id}
              onClick={() => handleSelectDefault(addr.id)}
              className={`p-5 rounded-[24px] border transition-all cursor-pointer flex items-start gap-4 ${
                addr.isDefault
                  ? 'border-(--color-primary-500) bg-(--color-primary-25)'
                  : 'border-(--color-gray-100) hover:bg-(--color-gray-50)'
              }`}
            >
              <div
                className={`mt-1 shrink-0 ${addr.isDefault ? 'text-(--color-primary-500)' : 'text-(--color-gray-400)'}`}
              >
                <FiMapPin size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[15px] font-bold text-(--color-gray-900) truncate">
                    {addr.label}
                  </p>
                  {addr.isDefault && (
                    <div className="w-5 h-5 rounded-full bg-(--color-primary-500) flex items-center justify-center text-white shrink-0">
                      <FiCheck size={12} strokeWidth={4} />
                    </div>
                  )}
                </div>
                <p className="text-sm text-(--color-gray-500) leading-relaxed mt-1">
                  {addr.address}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Action */}
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
