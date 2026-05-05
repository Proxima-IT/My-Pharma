'use client';
import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import { useUnitAdmin } from '@/app/(admin)/hooks/useUnitAdmin';
import { unitAdminApi } from '@/app/(admin)/api/unitAdminApi';

export default function AdminEditUnitPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const { updateUnit, isUpdating, error: updateError } = useUnitAdmin();

  const [unit, setUnit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [formData, setFormData] = useState({
    unit_type: '',
    content_type: '',
    quantity: '',
    is_active: true,
  });

  useEffect(() => {
    const loadUnit = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const data = await unitAdminApi.getUnitBySlug(token, slug);
        setUnit(data);
        setFormData({
          unit_type: data.unit_type || '',
          content_type: data.content_type || '',
          quantity: data.quantity ?? '',
          is_active: data.is_active ?? true,
        });
      } catch (err) {
        setFetchError('Could not find this unit.');
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) loadUnit();
  }, [slug]);

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      ...formData,
      quantity: parseInt(formData.quantity, 10),
    };
    const success = await updateUnit(slug, payload);
    if (success) {
      router.push('/admin/units');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#3A5A40] border-t-transparent animate-spin" />
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-[#8A8A78]">
            Loading Data...
          </p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="flex flex-col items-center gap-4 text-red-500">
          <p className="font-mono text-sm font-bold uppercase">{fetchError}</p>
          <button
            onClick={() => router.back()}
            className="text-[#3A5A40] underline font-mono text-xs uppercase"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
            Edit Unit
          </h1>
          <p className="text-[13px] text-[#6B6B5E] font-medium">
            Updating details for:{' '}
            <span className="text-[#3A5A40] font-bold">{unit?.name}</span>
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-gray-100 p-8 md:p-12 w-full">
        <div className="mb-10 border-b border-gray-50 pb-6">
          <h2 className="font-mono text-sm font-bold text-[#1B1B1B] uppercase tracking-widest">
            Unit Settings
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Unit Type */}
          <div>
            <label className={labelClass}>Packaging Type</label>
            <input
              type="text"
              placeholder="E.G. STRIP, BOTTLE, VIAL"
              className={inputClass}
              value={formData.unit_type}
              onChange={e => setFormData({ ...formData, unit_type: e.target.value })}
              required
            />
          </div>

          {/* Quantity */}
          <div>
            <label className={labelClass}>Quantity</label>
            <input
              type="number"
              min="1"
              placeholder="E.G. 10, 20, 80"
              className={inputClass}
              value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
          </div>

          {/* Content Type */}
          <div>
            <label className={labelClass}>Content Type</label>
            <input
              type="text"
              placeholder="E.G. TABLETS, CAPSULES, ML SYRUP"
              className={inputClass}
              value={formData.content_type}
              onChange={e => setFormData({ ...formData, content_type: e.target.value })}
              required
            />
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
                <FiCheck size={20} /> SAVE CHANGES
              </>
            )}
          </button>

          {updateError && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 font-mono text-[10px] font-bold uppercase text-center">
              Error: {updateError}
            </div>
          )}
        </form>
      </div>

      <div className="font-mono text-[10px] text-[#B7B7A4] uppercase tracking-[0.2em]">
        Unit ID: {unit?.id}
      </div>
    </div>
  );
}
