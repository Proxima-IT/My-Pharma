'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave, FiUpload, FiX, FiImage } from 'react-icons/fi';
import { useComboAdmin } from '@/app/(admin)/hooks/useComboAdmin';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Super Admin - Create New Combo Page
 * Design: Sharp & Authoritative, rounded-none, border-2, high contrast.
 * Updated: Synchronized field name to 'bg_color' to match backend implementation.
 */
export default function NewComboPage() {
  const router = useRouter();
  const { addCombo, isUpdating, error } = useComboAdmin();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    price: '',
    original_price: '',
    bg_color: '#B0E5C7', // Updated from color to bg_color
    order: 0,
    is_active: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (imageFile) {
        data.append('image', imageFile);
      }

      await addCombo(data);
      router.push('/admin/combos');
    } catch (err) {
      console.error('Creation failed:', err);
    }
  };

  const labelClass =
    'font-mono text-[11px] font-bold text-[#8A8A78] uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-12 px-4 bg-white border border-gray-200 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase placeholder:text-gray-300 text-[#1B1B1B]';
  const textareaClass =
    'w-full p-4 bg-white border border-gray-200 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase placeholder:text-gray-300 text-[#1B1B1B] min-h-[120px]';

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/combos"
            className="p-2 hover:bg-gray-50 text-[#8A8A78] transition-colors border border-transparent hover:border-gray-100"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-[#1B1B1B] tracking-tighter uppercase leading-none">
              New Combo Asset
            </h1>
            <p className="text-[11px] font-mono text-[#8A8A78] mt-1 uppercase tracking-widest">
              Registering bundle to system core
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
        {/* Left Column: Primary Data */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-gray-100 p-8 space-y-6">
            <h3 className="font-mono text-xs font-bold text-[#1B1B1B] uppercase tracking-widest border-b border-gray-50 pb-4 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#3A5A40]"></span> General Information
            </h3>

            <div>
              <label className={labelClass}>Combo Title</label>
              <input
                required
                name="title"
                className={inputClass}
                placeholder="E.G. FAMILY HEALTH PACK"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className={labelClass}>Description / Marketing Copy</label>
              <textarea
                name="description"
                className={textareaClass}
                placeholder="DETAILED DESCRIPTION OF THE BUNDLE CONTENTS..."
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className={labelClass}>External Link (Optional)</label>
              <input
                name="link"
                className={inputClass}
                placeholder="HTTPS://MYPHARMA.COM/PROMO/..."
                value={formData.link}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-8 space-y-6">
            <h3 className="font-mono text-xs font-bold text-[#1B1B1B] uppercase tracking-widest border-b border-gray-50 pb-4 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#3A5A40]"></span> Pricing & Logic
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Sale Price (BDT)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  name="price"
                  className={inputClass}
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className={labelClass}>Original Price (BDT)</label>
                <input
                  type="number"
                  step="0.01"
                  name="original_price"
                  className={inputClass}
                  placeholder="0.00"
                  value={formData.original_price}
                  onChange={handleInputChange}
                />
              </div>

              {/* Color Selection Field */}
              <div>
                <label className={labelClass}>
                  Container Color (Public Card)
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="bg_color"
                    className="w-12 h-12 border border-gray-200 p-1 bg-white cursor-pointer"
                    value={formData.bg_color}
                    onChange={handleInputChange}
                  />
                  <input
                    name="bg_color"
                    className={inputClass}
                    placeholder="#FFFFFF"
                    value={formData.bg_color}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Display Order</label>
                <input
                  type="number"
                  name="order"
                  className={inputClass}
                  value={formData.order}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer h-12 px-4 bg-gray-50 border border-gray-100 w-full">
                  <input
                    type="checkbox"
                    name="is_active"
                    className="w-5 h-5 accent-[#3A5A40]"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                  <span className="font-mono text-[11px] font-bold text-[#1B1B1B] uppercase tracking-widest">
                    Visible on Site
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Media & Submission */}
        <div className="space-y-8">
          <div className="bg-white border border-gray-100 p-8">
            <h3 className="font-mono text-xs font-bold text-[#1B1B1B] uppercase tracking-widest border-b border-gray-50 pb-4 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#3A5A40]"></span> Media Asset
            </h3>

            <div
              onClick={() => fileInputRef.current.click()}
              className="w-full aspect-square border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all relative overflow-hidden group"
            >
              {previewUrl ? (
                <>
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiUpload className="text-white" size={32} />
                  </div>
                </>
              ) : (
                <>
                  <FiImage size={48} className="text-gray-200 mb-4" />
                  <span className="font-mono text-[10px] text-gray-400 uppercase font-bold">
                    Select Combo Image
                  </span>
                  <span className="font-mono text-[9px] text-gray-300 uppercase mt-1">
                    1080x1080 Recommended
                  </span>
                </>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />

            {previewUrl && (
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setPreviewUrl(null);
                }}
                className="w-full mt-4 py-2 text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
              >
                <FiX /> Remove Image
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full h-20 bg-[#3A5A40] text-white font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-[#1B1B1B] transition-all duration-300 disabled:opacity-50 cursor-pointer"
          >
            {isUpdating ? (
              'INITIALIZING...'
            ) : (
              <>
                <FiSave size={20} /> DEPLOY COMBO
              </>
            )}
          </button>

          <div className="p-4 bg-[#F1F1E6] border border-[#DAD7CD] font-mono text-[9px] text-[#8A8A78] uppercase leading-relaxed">
            Note: The selected color will be applied to the background of the
            card on the public website.
          </div>
        </div>
      </form>
    </div>
  );
}
