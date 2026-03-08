'use client';
import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiImage, FiCheck } from 'react-icons/fi';
import { useAdsAdmin } from '@/app/(admin)/hooks/useAdsAdmin';
import { adsAdminApi } from '@/app/(admin)/api/adsAdminApi';

export default function AdminEditAdPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const { updateAd, isUpdating, error: updateError } = useAdsAdmin();

  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    link: '',
    order: '',
    is_active: true,
    image: null,
  });

  // 1. Load existing banner data
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const data = await adsAdminApi.getDetail(token, id);
        setFormData({
          link: data.link || '',
          order: data.order || '0',
          is_active: data.is_active ?? true,
          image: null,
        });
        if (data.image_url) {
          setPreviewImage(data.image_url);
        }
      } catch (err) {
        console.error('Failed to load banner:', err);
        router.push('/admin/ads');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) loadData();
  }, [id, router]);

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData();
    data.append('link', formData.link);
    data.append('order', formData.order);
    data.append('is_active', formData.is_active ? 'true' : 'false');
    if (formData.image) {
      data.append('image', formData.image);
    }

    const success = await updateAd(id, data);
    if (success) {
      router.push('/admin/ads');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#3A5A40] border-t-transparent animate-spin rounded-none" />
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-[#8A8A78]">
            Loading Data...
          </p>
        </div>
      </div>
    );
  }

  const labelClass =
    'font-mono text-[11px] font-bold text-[#8A8A78] uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-12 px-4 bg-white border border-gray-200 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase placeholder:text-gray-300 text-[#1B1B1B]';

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col items-start gap-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-3 bg-[#3A5A40] text-white px-6 py-3 hover:bg-[#F59E0B] transition-all cursor-pointer group border border-transparent rounded-none"
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
            Edit Banner Info
          </h1>
          <p className="text-[13px] text-[#6B6B5E] font-medium">
            Update the promotional image and target destination.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 p-8 md:p-12 w-full rounded-none">
        <div className="mb-10 border-b border-gray-50 pb-6">
          <h2 className="font-mono text-sm font-bold text-[#1B1B1B] uppercase tracking-widest">
            Banner Settings
          </h2>
        </div>

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

            <div className="flex items-center justify-between p-6 bg-gray-50 border border-gray-100 rounded-none">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[13px] font-bold text-[#1B1B1B] uppercase">
                  Active Status
                </span>
                <span className="font-mono text-[10px] text-[#8A8A78] uppercase">
                  Show this banner on the website?
                </span>
              </div>
              <input
                type="checkbox"
                className="w-8 h-8 border-gray-300 accent-[#3A5A40] cursor-pointer rounded-none"
                checked={formData.is_active}
                onChange={e =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className={labelClass}>Current Banner Image</label>
            <div
              onClick={() => fileInputRef.current.click()}
              className="aspect-video w-full border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#E8F0EA] hover:border-[#3A5A40] transition-all group overflow-hidden relative rounded-none"
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
                    Change Image
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
              className="w-full h-16 bg-[#3A5A40] text-white font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-[#F59E0B] transition-all duration-300 cursor-pointer disabled:opacity-50 border border-transparent rounded-none"
            >
              {isUpdating ? (
                'SAVING...'
              ) : (
                <>
                  <FiCheck size={20} /> SAVE CHANGES
                </>
              )}
            </button>
          </div>

          {updateError && (
            <div className="lg:col-span-2 p-4 bg-red-50 border border-red-100 text-red-600 font-mono text-[10px] font-bold uppercase text-center rounded-none">
              Server Error: {updateError}
            </div>
          )}
        </form>
      </div>

      <div className="font-mono text-[10px] text-[#B7B7A4] uppercase tracking-[0.2em]">
        System_Ad_ID: #{id}
      </div>
    </div>
  );
}
