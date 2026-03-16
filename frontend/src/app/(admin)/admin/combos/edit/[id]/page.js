'use client';

import React, { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiArrowLeft,
  FiSave,
  FiUpload,
  FiX,
  FiImage,
  FiRefreshCw,
} from 'react-icons/fi';
import { useComboAdmin } from '@/app/(admin)/hooks/useComboAdmin';
import { comboAdminApi } from '@/app/(admin)/api/comboAdminApi';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Super Admin - Edit Combo Page
 * Fixed: Updated field name to 'bg_color' to match backend implementation.
 */
export default function EditComboPage({ params }) {
  const resolvedParams = use(params);
  const comboId = resolvedParams.id;

  const router = useRouter();
  const { updateCombo, isUpdating, error: hookError } = useComboAdmin();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    price: '',
    original_price: '',
    bg_color: '#B0E5C7', // Changed from color to bg_color
    order: 0,
    is_active: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const loadCombo = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const data = await comboAdminApi.getComboById(token, comboId);

        setFormData({
          title: data.title || '',
          description: data.description || '',
          link: data.link || '',
          price: data.price || '',
          original_price: data.original_price || '',
          bg_color: data.bg_color || '#B0E5C7', // Changed from color to bg_color
          order: data.order || 0,
          is_active: data.is_active ?? true,
        });

        if (data.image_url) {
          setPreviewUrl(data.image_url);
        }
      } catch (err) {
        setFetchError('Failed to retrieve combo data from system core.');
      } finally {
        setIsFetching(false);
      }
    };

    loadCombo();
  }, [comboId]);

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

      await updateCombo(comboId, data);
      router.push('/admin/combos');
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const labelClass =
    'font-mono text-[11px] font-bold text-[#8A8A78] uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-12 px-4 bg-white border border-gray-200 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase placeholder:text-gray-300 text-[#1B1B1B]';
  const textareaClass =
    'w-full p-4 bg-white border border-gray-200 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase placeholder:text-gray-300 text-[#1B1B1B] min-h-[120px]';

  if (isFetching) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center space-y-4">
        <FiRefreshCw className="animate-spin text-[#3A5A40]" size={32} />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#8A8A78]">
          Retrieving Asset Data...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20">
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
              Edit Combo Asset
            </h1>
            <p className="text-[11px] font-mono text-[#8A8A78] mt-1 uppercase tracking-widest">
              Modifying Bundle ID: {comboId}
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-10"
      >
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
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className={labelClass}>Description / Marketing Copy</label>
              <textarea
                name="description"
                className={textareaClass}
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className={labelClass}>External Link (Optional)</label>
              <input
                name="link"
                className={inputClass}
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
                  value={formData.original_price}
                  onChange={handleInputChange}
                />
              </div>
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
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiUpload className="text-white" size={32} />
                  </div>
                </>
              ) : (
                <>
                  <FiImage size={48} className="text-gray-200 mb-4" />
                  <span className="font-mono text-[10px] text-gray-400 uppercase font-bold">
                    Change Combo Image
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
          </div>
          <button
            type="submit"
            disabled={isUpdating}
            className="w-full h-20 bg-[#3A5A40] text-white font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-[#1B1B1B] transition-all duration-300 disabled:opacity-50 cursor-pointer"
          >
            {isUpdating ? (
              'RE-DEPLOYING...'
            ) : (
              <>
                <FiSave size={20} /> UPDATE COMBO
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
