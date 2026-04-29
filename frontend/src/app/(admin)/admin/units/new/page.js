'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import { useUnitAdmin } from '@/app/(admin)/hooks/useUnitAdmin';

export default function AdminNewUnitPage() {
  const router = useRouter();
  const { createUnit, isUpdating, error } = useUnitAdmin();

  const [formData, setFormData] = useState({
    unit_type: '',
    content_type: '',
    quantity: '',
    is_active: true,
  });

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      ...formData,
      quantity: parseInt(formData.quantity, 10),
    };
    const success = await createUnit(payload);
    if (success) {
      router.push('/admin/units');
    }
  };

  const labelClass =
    'font-mono text-[11px] font-bold text-[#8A8A78] uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-12 px-4 bg-white border border-gray-200 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase placeholder:text-gray-300';

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
            Add New Unit
          </h1>
          <p className="text-[13px] text-[#6B6B5E] font-medium">
            Define a medicine packaging unit — e.g. Strip of 10 Tablets, Bottle of 80ml Syrup.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-gray-100 p-8 md:p-12 w-full">
        <div className="mb-10 border-b border-gray-50 pb-6">
          <h2 className="font-mono text-sm font-bold text-[#1B1B1B] uppercase tracking-widest">
            Unit Details
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Unit Type */}
          <div>
            <label className={labelClass}>Packaging Type</label>
            <input
              type="text"
              placeholder="E.G. STRIP, BOTTLE, VIAL, BOX, TUBE"
              className={inputClass}
              value={formData.unit_type}
              onChange={e => setFormData({ ...formData, unit_type: e.target.value })}
              required
            />
            <p className="mt-2 font-mono text-[10px] text-[#B7B7A4] uppercase">
              The package form: Strip, Bottle, Vial, Box, Tube, Sachet, Ampoule, etc.
            </p>
          </div>

          {/* Quantity */}
          <div>
            <label className={labelClass}>Quantity</label>
            <input
              type="number"
              min="1"
              placeholder="E.G. 10, 20, 80, 100"
              className={inputClass}
              value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
            <p className="mt-2 font-mono text-[10px] text-[#B7B7A4] uppercase">
              Number of items or volume inside the package.
            </p>
          </div>

          {/* Content Type */}
          <div>
            <label className={labelClass}>Content Type</label>
            <input
              type="text"
              placeholder="E.G. TABLETS, CAPSULES, ML SYRUP, GM CREAM"
              className={inputClass}
              value={formData.content_type}
              onChange={e => setFormData({ ...formData, content_type: e.target.value })}
              required
            />
            <p className="mt-2 font-mono text-[10px] text-[#B7B7A4] uppercase">
              What&apos;s inside: Tablets, Capsules, ml Syrup, gm Cream, ml Injection, etc.
            </p>
          </div>

          {/* Preview */}
          {formData.unit_type && formData.quantity && formData.content_type && (
            <div className="p-6 bg-[#F0F5F1] border border-[#3A5A40]/20">
              <span className="font-mono text-[10px] text-[#8A8A78] uppercase tracking-widest block mb-2">
                Preview
              </span>
              <span className="text-lg font-black text-[#1B1B1B] uppercase tracking-tight">
                {formData.unit_type} of {formData.quantity} {formData.content_type}
              </span>
            </div>
          )}

          {/* Active Status */}
          <div className="flex items-center justify-between p-6 bg-gray-50 border border-gray-100">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[13px] font-bold text-[#1B1B1B] uppercase">
                Active Status
              </span>
              <span className="font-mono text-[10px] text-[#8A8A78] uppercase">
                Make this unit available for products?
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
                <FiCheck size={20} /> SAVE UNIT
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
        System: Ready_for_input
      </div>
    </div>
  );
}
