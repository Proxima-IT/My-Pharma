'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiChevronDown, FiChevronRight, FiArrowLeft } from 'react-icons/fi';
import UiInput from '@/app/(public)/components/UiInput';
import { useAddress } from '../../../hooks/useAddress';
import { BANGLADESH_DISTRICTS } from '../../../lib/addressUtils';

export default function AddNewAddressPage() {
  const router = useRouter();
  const { districts, addAddress, isUpdating } = useAddress();

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    delivery_area: '',
    address: '',
    address_type: 'HOME',
    is_default: false,
  });

  // Prioritize API districts, fallback to static list
  const districtList = districts.length > 0 ? districts : BANGLADESH_DISTRICTS;

  const handleSubmit = async e => {
    e.preventDefault();
    const success = await addAddress(formData);
    if (success) {
      router.push('/user/address');
    }
  };

  const selectClass =
    'w-full py-3.5 px-6 bg-white border border-gray-200 rounded-full text-sm text-gray-900 outline-none appearance-none cursor-pointer transition-all duration-300 focus:ring-4 focus:ring-(--color-primary-50)/50 focus:border-(--color-primary-500)';

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

        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Full Name */}
          <UiInput
            label="Full name"
            placeholder="Enter full name"
            value={formData.full_name}
            onChange={e =>
              setFormData({ ...formData, full_name: e.target.value })
            }
            required
          />

          {/* Phone & District Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <UiInput
              label="Phone Number"
              placeholder="+880"
              value={formData.phone}
              onChange={e =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
            />

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-gray-600 ml-5">
                District
              </label>
              <div className="relative group">
                <select
                  className={selectClass}
                  value={formData.delivery_area}
                  onChange={e =>
                    setFormData({ ...formData, delivery_area: e.target.value })
                  }
                  required
                >
                  <option value="">Select District</option>
                  {districtList.map(district => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-focus-within:text-(--color-primary-500)">
                  <FiChevronDown size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* Full Address */}
          <UiInput
            label="Full address"
            placeholder="House no, Road no, Area details..."
            value={formData.address}
            onChange={e =>
              setFormData({ ...formData, address: e.target.value })
            }
            required
          />

          {/* Action Buttons - Fixed for Mobile Responsiveness */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link href="/user/address" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:px-10 h-[52px] rounded-full text-[13px] font-bold uppercase tracking-widest text-(--color-primary-500) bg-(--color-primary-25) hover:bg-(--color-primary-50) transition-all cursor-pointer"
              >
                Cancel
              </button>
            </Link>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-(--color-primary-500) hover:bg-(--color-primary-600) text-white sm:px-10 h-[52px] rounded-full text-[13px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{isUpdating ? 'Saving...' : 'Add Save Address'}</span>
              <FiChevronRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
