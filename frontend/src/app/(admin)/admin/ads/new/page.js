'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiImage, FiCheck } from 'react-icons/fi';
import { useAdsAdmin } from '../../../hooks/useAdsAdmin';

export default function AdminNewAdPage() {
  const router = useRouter();
  const { createAd, isUpdating, error } = useAdsAdmin();

  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    link: '',
    order: '0',
    is_active: true,
    image: null,
  });

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.image) {
      alert('Please select an image first.');
      return;
    }

    const data = new FormData();
    data.append('link', formData.link);
    data.append('order', formData.order);
    data.append('is_active', formData.is_active ? 'true' : 'false');
    data.append('image', formData.image);

    const success = await createAd(data);
    if (success) {
      router.push('/admin/ads');
    }
  };

  const labelClass =
    'font-mono text-[11px] font-bold text-[#8A8A78] uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-12 px-4 bg-white border border-gray-200 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase placeholder:text-gray-300 text-[#1B1B1B]';

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col items-start gap-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-3 bg-[#3A5A40] text-white px-6 py-3 hover:bg-[#F59E0B] transition-all cursor-pointer border border-transparent"
        >
          <FiArrowLeft size={16} />
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
            Go Back
          </span>
        </button>

        <div className="space-y-2">
          <h1 className="text-4xl font-black text-[#1B1B1B] tracking-tighter uppercase leading-none">
            Create Ad Banner
          </h1>
          <p className="text-[13px] text-[#6B6B5E] font-medium">
            Upload a new promotional banner for the website sidebar.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 p-8 md:p-12 w-full">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          <div className="space-y-8">
            <div>
              <label className={labelClass}>Target Link (Full URL)</label>
              <input
                type="text"
                placeholder="https://mypharma.com/products"
                className={inputClass}
                value={formData.link}
                onChange={e =>
                  setFormData({ ...formData, link: e.target.value })
                }
                required
              />
              <p className="text-[9px] text-amber-600 mt-2 font-bold uppercase tracking-tight">
                Note: Link must start with http:// or https://
              </p>
            </div>

            <div>
              <label className={labelClass}>Display Order</label>
              <input
                type="number"
                className={inputClass}
                value={formData.order}
                onChange={e =>
                  setFormData({ ...formData, order: e.target.value })
                }
                required
              />
            </div>

            <div className="flex items-center justify-between p-6 bg-gray-50 border border-gray-100">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[13px] font-bold text-[#1B1B1B] uppercase">
                  Active Status
                </span>
                <span className="font-mono text-[10px] text-[#8A8A78] uppercase">
                  Show this banner to users?
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
          </div>

          <div className="space-y-4">
            <label className={labelClass}>Banner Image</label>
            <div
              onClick={() => fileInputRef.current.click()}
              className="aspect-video w-full border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#E8F0EA] hover:border-[#3A5A40] transition-all group overflow-hidden relative"
            >
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <FiImage
                    size={32}
                    className="text-gray-300 group-hover:text-[#3A5A40]"
                  />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Select Image
                  </span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div className="lg:col-span-2 pt-4">
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full h-16 bg-[#3A5A40] text-white font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-[#F59E0B] transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              {isUpdating ? (
                'UPLOADING...'
              ) : (
                <>
                  <FiCheck size={20} /> PUBLISH AD
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="lg:col-span-2 p-4 bg-red-50 border border-red-100 text-red-600 font-mono text-[10px] font-bold uppercase text-center">
              Server Error: {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
