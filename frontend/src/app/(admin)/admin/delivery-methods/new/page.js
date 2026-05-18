'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import { useDeliveryMethodAdmin } from '@/app/(admin)/hooks/useDeliveryMethodAdmin';

const DELIVERY_TYPES = [
  { value: 'STANDARD', label: 'Standard' },
  { value: 'EXPRESS', label: 'Express' },
  { value: 'SAME_DAY', label: 'Same Day' },
];

export default function AdminNewDeliveryMethodPage() {
  const router = useRouter();
  const { createMethod, isUpdating, error } = useDeliveryMethodAdmin();

  const [formData, setFormData] = useState({
    name: '',
    delivery_type: 'STANDARD',
    amount: '',
    duration: '',
    price: '',
    order: 0,
    is_active: true,
  });

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      ...formData,
      amount: formData.amount ? parseFloat(formData.amount) : 0,
      price: formData.price ? parseFloat(formData.price) : 0,
      order: parseInt(formData.order, 10) || 0,
    };
    const success = await createMethod(payload);
    if (success) {
      router.push('/admin/delivery-methods');
    }
  };

  const labelClass =
    'font-mono text-[11px] font-bold text-[#8A8A78] uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-12 px-4 bg-white border border-gray-200 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all placeholder:text-gray-300';
  const selectClass =
    'w-full h-12 px-4 bg-white border border-gray-200 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase cursor-pointer';

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col items-start gap-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-3 bg-[#3A5A40] text-white px-6 py-3 hover:bg-[#F59E0B] transition-all cursor-pointer group border border-transparent"
        >
          <FiArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
            Go Back
          </span>
        </button>

        <div className="space-y-2">
          <h1 className="text-4xl font-black text-[#1B1B1B] tracking-tighter uppercase leading-none">
            Add Delivery Method
          </h1>
          <p className="text-[13px] text-[#6B6B5E] font-medium">
            Define a new delivery option — e.g. Standard Delivery, Express, Same Day.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-gray-100 p-8 md:p-12 w-full">
        <div className="mb-10 border-b border-gray-50 pb-6">
          <h2 className="font-mono text-sm font-bold text-[#1B1B1B] uppercase tracking-widest">
            Method Details
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Name */}
          <div>
            <label className={labelClass}>Method Name</label>
            <input
              type="text"
              placeholder="E.G. STANDARD DELIVERY, EXPRESS DELIVERY"
              className={inputClass}
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <p className="mt-2 font-mono text-[10px] text-[#B7B7A4] uppercase">
              The display name shown to customers during checkout.
            </p>
          </div>

          {/* Type */}
          <div>
            <label className={labelClass}>Delivery Type</label>
            <select
              className={selectClass}
              value={formData.delivery_type}
              onChange={e => setFormData({ ...formData, delivery_type: e.target.value })}
              required
            >
              {DELIVERY_TYPES.map(t => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <p className="mt-2 font-mono text-[10px] text-[#B7B7A4] uppercase">
              Category of delivery speed. Affects the icon shown in checkout.
            </p>
          </div>

          {/* Duration */}
          <div>
            <label className={labelClass}>Estimated Duration</label>
            <input
              type="text"
              placeholder='E.G. "24-48 HOURS", "3-5 BUSINESS DAYS"'
              className={inputClass}
              value={formData.duration}
              onChange={e => setFormData({ ...formData, duration: e.target.value })}
            />
            <p className="mt-2 font-mono text-[10px] text-[#B7B7A4] uppercase">
              Human-readable estimate shown to the customer.
            </p>
          </div>

          {/* Price */}
          <div>
            <label className={labelClass}>Price (BDT)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="E.G. 50, 100, 150"
              className={inputClass}
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: e.target.value })}
              required
            />
            <p className="mt-2 font-mono text-[10px] text-[#B7B7A4] uppercase">
              The delivery charge in BDT. Set to 0 for free delivery options.
            </p>
          </div>

          {/* Amount (optional weight/distance threshold) */}
          <div>
            <label className={labelClass}>Amount / Threshold (Optional)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="E.G. 500 (FREE ABOVE THIS)"
              className={inputClass}
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
            />
            <p className="mt-2 font-mono text-[10px] text-[#B7B7A4] uppercase">
              Optional amount field for threshold-based logic.
            </p>
          </div>

          {/* Sort Order */}
          <div>
            <label className={labelClass}>Display Order</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              className={inputClass}
              value={formData.order}
              onChange={e => setFormData({ ...formData, order: e.target.value })}
            />
            <p className="mt-2 font-mono text-[10px] text-[#B7B7A4] uppercase">
              Lower numbers appear first in the checkout selector.
            </p>
          </div>

          {/* Preview */}
          {formData.name && formData.price && (
            <div className="p-6 bg-[#F0F5F1] border border-[#3A5A40]/20">
              <span className="font-mono text-[10px] text-[#8A8A78] uppercase tracking-widest block mb-2">
                Checkout Preview
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-black text-[#1B1B1B] uppercase tracking-tight block">
                    {formData.name}
                  </span>
                  <span className="font-mono text-xs text-[#8A8A78]">
                    {formData.duration || 'No duration set'}
                  </span>
                </div>
                <span className="text-2xl font-black text-[#3A5A40]">
                  ৳{parseFloat(formData.price || 0).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Active Status */}
          <div className="flex items-center justify-between p-6 bg-gray-50 border border-gray-100">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[13px] font-bold text-[#1B1B1B] uppercase">
                Active Status
              </span>
              <span className="font-mono text-[10px] text-[#8A8A78] uppercase">
                Make this method available to customers?
              </span>
            </div>
            <input
              type="checkbox"
              className="w-8 h-8 border-gray-300 accent-[#3A5A40] cursor-pointer"
              checked={formData.is_active}
              onChange={e =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
            />
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full h-16 bg-[#3A5A40] text-white font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-[#F59E0B] transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            {isUpdating ? (
              'SAVING...'
            ) : (
              <>
                <FiCheck size={20} /> SAVE DELIVERY METHOD
              </>
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 font-mono text-[10px] font-bold uppercase text-center">
              Error: {error}
            </div>
          )}
        </form>
      </div>

      <div className="font-mono text-[10px] text-[#B7B7A4] uppercase tracking-[0.2em]">
        System: Ready for input
      </div>
    </div>
  );
}
