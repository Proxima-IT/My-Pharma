'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiSave,
  FiTag,
  FiPercent,
  FiDollarSign,
  FiCalendar,
  FiUserCheck,
} from 'react-icons/fi';
import { useCouponAdmin } from '@/app/(admin)/hooks/useCouponAdmin';

/**
 * Super Admin - Create New Coupon Page
 * Design: Sharp Minimalist (rounded-none, border-gray-100, font-mono for labels).
 */
export default function NewCouponPage() {
  const router = useRouter();
  const { addCoupon, isUpdating, error } = useCouponAdmin();

  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'PERCENT',
    discount_value: '',
    min_order_amount: '0.00',
    valid_from: '',
    valid_until: '',
    max_uses: '',
    is_active: true,
  });

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Clean data for API
    const payload = {
      ...formData,
      max_uses: formData.max_uses === '' ? null : parseInt(formData.max_uses),
      valid_from: formData.valid_from || null,
      valid_until: formData.valid_until || null,
    };

    try {
      await addCoupon(payload);
      router.push('/admin/coupons');
    } catch (err) {
      console.error('Creation failed:', err);
    }
  };

  const labelClass =
    'font-mono text-[10px] font-bold text-[#8A8A78] uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-11 px-4 bg-white border border-gray-100 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase placeholder:text-gray-200 text-[#1B1B1B]';

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/coupons"
            className="p-2 hover:bg-gray-50 text-[#8A8A78] transition-colors border border-transparent hover:border-gray-100"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-[#1B1B1B] tracking-tighter uppercase leading-none">
              New Coupon
            </h1>
            <p className="text-[11px] font-mono text-[#8A8A78] mt-1 uppercase tracking-widest">
              Registering promotional logic to system core
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 font-mono text-xs uppercase">
          System Error:{' '}
          {typeof error === 'object' ? 'Validation Failed' : error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-10"
      >
        {/* Left Column: Core Logic */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-gray-100 p-8 space-y-6">
            <h3 className="font-mono text-[11px] font-bold text-[#1B1B1B] uppercase tracking-widest border-b border-gray-50 pb-4 mb-4 flex items-center gap-2">
              <FiTag className="text-[#3A5A40]" /> Identity & Value
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClass}>Coupon Code (Unique)</label>
                <input
                  required
                  name="code"
                  className={inputClass}
                  placeholder="E.G. RAMADAN2025"
                  value={formData.code}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className={labelClass}>Discount Type</label>
                <select
                  name="discount_type"
                  className={inputClass}
                  value={formData.discount_type}
                  onChange={handleInputChange}
                >
                  <option value="PERCENT">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (৳)</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  {formData.discount_type === 'PERCENT'
                    ? 'Percentage Value'
                    : 'Fixed Amount'}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-mono text-xs">
                    {formData.discount_type === 'PERCENT' ? <FiPercent /> : '৳'}
                  </span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    name="discount_value"
                    className={inputClass + ' pl-10'}
                    placeholder="0.00"
                    value={formData.discount_value}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-8 space-y-6">
            <h3 className="font-mono text-[11px] font-bold text-[#1B1B1B] uppercase tracking-widest border-b border-gray-50 pb-4 mb-4 flex items-center gap-2">
              <FiDollarSign className="text-[#3A5A40]" /> Usage Restrictions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Minimum Order Amount (৳)</label>
                <input
                  type="number"
                  step="0.01"
                  name="min_order_amount"
                  className={inputClass}
                  value={formData.min_order_amount}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className={labelClass}>Maximum Uses (Total)</label>
                <input
                  type="number"
                  name="max_uses"
                  className={inputClass}
                  placeholder="Leave blank for unlimited"
                  value={formData.max_uses}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Validity & Actions */}
        <div className="space-y-8">
          <div className="bg-white border border-gray-100 p-8 space-y-6">
            <h3 className="font-mono text-[11px] font-bold text-[#1B1B1B] uppercase tracking-widest border-b border-gray-50 pb-4 mb-4 flex items-center gap-2">
              <FiCalendar className="text-[#3A5A40]" /> Campaign Period
            </h3>

            <div>
              <label className={labelClass}>Valid From</label>
              <input
                type="datetime-local"
                name="valid_from"
                className={inputClass}
                value={formData.valid_from}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className={labelClass}>Valid Until</label>
              <input
                type="datetime-local"
                name="valid_until"
                className={inputClass}
                value={formData.valid_until}
                onChange={handleInputChange}
              />
            </div>

            <div className="pt-4">
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 border border-gray-100 group">
                <input
                  type="checkbox"
                  name="is_active"
                  className="w-5 h-5 accent-[#3A5A40]"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
                <span className="font-mono text-[11px] font-bold text-[#1B1B1B] uppercase tracking-widest group-hover:text-[#3A5A40] transition-colors">
                  Enable Coupon Now
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full h-20 bg-[#1B1B1B] text-white font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-[#3A5A40] transition-all duration-300 disabled:opacity-50 cursor-pointer"
          >
            {isUpdating ? (
              'SYNCING...'
            ) : (
              <>
                <FiSave size={20} /> Deploy Coupon
              </>
            )}
          </button>

          <div className="p-4 bg-[#F1F1E6] border border-[#DAD7CD] font-mono text-[9px] text-[#8A8A78] uppercase leading-relaxed">
            Technical Note: Ensure timezone alignment (Asia/Dhaka) when setting
            campaign periods. Coupons are validated against server time.
          </div>
        </div>
      </form>
    </div>
  );
}
