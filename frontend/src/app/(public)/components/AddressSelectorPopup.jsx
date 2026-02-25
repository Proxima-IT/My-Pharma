'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FiHome,
  FiMapPin,
  FiMoreVertical,
  FiPlus,
  FiX,
  FiChevronRight,
  FiEdit2,
  FiCheckCircle,
  FiTrash2,
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';

const AddressSelectorPopup = ({ isOpen, onClose, onSelect }) => {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  // Mock data matching the image content
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: 'Abu Fahim',
      phone: '+8801948348211',
      address: 'Kacharipara, Bheramra, Kushtia',
      isDefault: true,
    },
    {
      id: 2,
      name: 'Badhon Mollik',
      phone: '+8801948348211',
      address: 'Kacharipara, Bheramra, Kushtia',
      isDefault: false,
    },
    {
      id: 3,
      name: 'Abu Fahim',
      phone: '+8801948348211',
      address: 'Kacharipara, Bheramra, Kushtia',
      isDefault: false,
    },
  ]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleAddNew = () => {
    onClose();
    router.push('/user/address/new');
  };

  const handleConfirm = () => {
    const selected = addresses.find(a => a.id === selectedId);
    if (onSelect && selected) onSelect(selected);
    onClose();
  };

  const handleMakeDefault = id => {
    setAddresses(prev =>
      prev.map(addr => ({
        ...addr,
        isDefault: addr.id === id,
      })),
    );
    setOpenMenuId(null);
  };

  const handleDelete = id => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
    setOpenMenuId(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-10 pt-10 pb-6 flex justify-between items-center">
          <h2 className="text-[28px] font-bold text-gray-900 tracking-tight">
            Shipping Address
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 cursor-pointer"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Address Grid */}
        <div className="px-10 pb-8 grid grid-cols-1 sm:grid-cols-2 gap-5 max-h-[60vh] overflow-y-auto no-scrollbar">
          {addresses.map(addr => (
            <div
              key={addr.id}
              onClick={() => setSelectedId(addr.id)}
              className={`relative p-6 rounded-[24px] border-2 transition-all cursor-pointer flex flex-col gap-4 ${
                selectedId === addr.id
                  ? 'border-(--color-primary-300) bg-white'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              {/* Top Row: Icon & Menu */}
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-full bg-(--color-primary-50) flex items-center justify-center text-(--color-primary-500)">
                  <FiHome size={22} />
                </div>

                <div className="relative">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === addr.id ? null : addr.id);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    <FiMoreVertical size={20} />
                  </button>

                  {/* Context Menu Popover */}
                  {openMenuId === addr.id && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200"
                      onClick={e => e.stopPropagation()}
                    >
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                        <FiEdit2 size={16} className="text-blue-500" />
                        Edit
                      </button>

                      {!addr.isDefault && (
                        <>
                          <button
                            onClick={() => handleMakeDefault(addr.id)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <FiCheckCircle
                              size={16}
                              className="text-green-500"
                            />
                            Make Default
                          </button>
                          <button
                            onClick={() => handleDelete(addr.id)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <FiTrash2 size={16} />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {addr.name}
                  </h3>
                  {addr.isDefault && (
                    <span className="px-2 py-0.5 rounded-full border border-(--success-500) text-(--success-500) text-[10px] font-bold uppercase">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  {addr.phone}
                </p>
                <div className="flex items-start gap-2 text-gray-400 pt-1">
                  <FiMapPin size={16} className="mt-0.5 shrink-0" />
                  <p className="text-sm leading-relaxed">{addr.address}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Address Dashed Card */}
          <div
            onClick={handleAddNew}
            className="border-2 border-dashed border-(--success-200) rounded-[24px] p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-(--success-25) transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-(--success-500) flex items-center justify-center text-white shadow-lg shadow-(--success-500)/20 group-hover:scale-110 transition-transform">
              <FiPlus size={24} strokeWidth={3} />
            </div>
            <div>
              <p className="text-(--success-500) font-bold">Add New Address</p>
              <p className="text-xs text-gray-400 font-medium">
                Add Another Shipping Address
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-10 pb-10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            onClick={handleAddNew}
            className="w-full sm:w-auto px-8 h-14 rounded-full border border-(--color-primary-50) bg-(--color-primary-25)/50 text-(--color-primary-500) font-bold flex items-center justify-center gap-2 hover:bg-(--color-primary-50) transition-all cursor-pointer"
          >
            <FiPlus size={18} strokeWidth={3} />
            Add New Address
          </button>

          <button
            onClick={handleConfirm}
            className="w-full sm:w-auto px-10 h-14 rounded-full bg-(--color-primary-700) text-white font-bold flex items-center justify-center gap-3 hover:bg-(--color-primary-800) transition-all cursor-pointer shadow-lg shadow-(--color-primary-700)/20"
          >
            <span>Select Address</span>
            <FiChevronRight size={20} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressSelectorPopup;
