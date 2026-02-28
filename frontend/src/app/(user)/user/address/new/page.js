'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiChevronDown,
  FiChevronRight,
  FiArrowLeft,
  FiInfo,
} from 'react-icons/fi';
import UiInput from '@/app/(public)/components/UiInput';
import { useAddress } from '../../../hooks/useAddress';

export default function AddNewAddressPage() {
  const router = useRouter();
  const { districts, addAddress, isUpdating, error } = useAddress();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    gender: 'MALE',
    district: '',
    thana: '',
    address: '',
    address_type: 'HOME',
    is_default: false,
  });

  const handleSubmit = async e => {
    e.preventDefault();
    const success = await addAddress(formData);
    if (success) {
      router.push('/user/address');
    }
  };

  const selectClass =
    'w-full py-3.5 px-6 bg-white border border-gray-200 rounded-full text-sm text-gray-900 outline-none appearance-none cursor-pointer transition-all duration-300 focus:ring-4 focus:ring-(--color-primary-50)/50 focus:border-(--color-primary-500)';

  const labelClass =
    'text-[13px] font-bold text-gray-600 ml-5 uppercase tracking-wider';

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link
          href="/user/address"
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Add New Address
        </h1>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-[32px] p-6 md:p-12 border border-gray-100 w-full">
        <div className="mb-10">
          <h2 className="text-[24px] font-bold text-gray-900 tracking-tight">
            Shipping Information
          </h2>
          <p className="text-gray-500 text-sm font-medium mt-1">
            Please provide accurate details for seamless delivery.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
            <FiInfo className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* ROW 1: Full Name (Alone) */}
          <div className="w-full">
            <UiInput
              label="Full Name"
              placeholder="e.g. John Doe"
              value={formData.full_name}
              onChange={e =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              required
            />
          </div>

          {/* ROW 2: Email & Phone (Duo) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UiInput
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={e =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
            <UiInput
              label="Phone Number"
              placeholder="01XXXXXXXXX"
              value={formData.phone}
              onChange={e =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
            />
          </div>

          {/* ROW 3: Gender & Address Type (Duo) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Gender</label>
              <div className="relative group">
                <select
                  className={selectClass}
                  value={formData.gender}
                  onChange={e =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  required
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                <FiChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Address Type</label>
              <div className="relative group">
                <select
                  className={selectClass}
                  value={formData.address_type}
                  onChange={e =>
                    setFormData({ ...formData, address_type: e.target.value })
                  }
                  required
                >
                  <option value="HOME">Home</option>
                  <option value="OFFICE">Office</option>
                  <option value="OTHER">Other</option>
                </select>
                <FiChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ROW 4: District & Thana (Duo) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>District</label>
              <div className="relative group">
                <select
                  className={selectClass}
                  value={formData.district}
                  onChange={e =>
                    setFormData({ ...formData, district: e.target.value })
                  }
                  required
                >
                  <option value="">Select District</option>
                  {districts.map(d => (
                    <option key={d.id || d} value={d.name || d}>
                      {d.name || d}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <UiInput
              label="Thana / Area"
              placeholder="Enter your thana"
              value={formData.thana}
              onChange={e =>
                setFormData({ ...formData, thana: e.target.value })
              }
              required
            />
          </div>

          {/* ROW 5: Full Address (Alone) */}
          <div className="w-full">
            <UiInput
              label="Full Address"
              placeholder="House no, Road no, Landmark, Area details..."
              value={formData.address}
              onChange={e =>
                setFormData({ ...formData, address: e.target.value })
              }
              required
            />
          </div>

          {/* ROW 6: Default Toggle */}
          <div className="w-full">
            <label className="flex items-center gap-3 cursor-pointer group ml-5">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.is_default}
                  onChange={e =>
                    setFormData({ ...formData, is_default: e.target.checked })
                  }
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--color-primary-500)"></div>
              </div>
              <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                Set as default address
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
            <Link href="/user/address" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:px-12 h-[56px] rounded-full text-[13px] font-bold uppercase tracking-widest text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </Link>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-3 bg-(--color-primary-500) hover:brightness-110 text-white sm:px-12 h-[56px] rounded-full text-[13px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer active:scale-95"
            >
              <span>{isUpdating ? 'Saving...' : 'Save Address'}</span>
              <FiChevronRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
