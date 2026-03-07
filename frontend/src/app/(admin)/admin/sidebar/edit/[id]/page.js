'use client';
import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiImage, FiCheck, FiX } from 'react-icons/fi';
import { useSidebarAdmin } from '../../../hooks/useSidebarAdmin';
import { sidebarAdminApi } from '../../../../api/sidebarAdminApi';

export default function AdminEditSidebarItemPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const {
    updateSidebarItem,
    isUpdating,
    error: updateError,
  } = useSidebarAdmin();

  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    image: null,
  });

  // ১. বিদ্যমান ডাটা লোড করা
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const data = await sidebarAdminApi.getDetail(token, id);
        setFormData({
          title: data.title || '',
          image: null, // New image starts as null
        });
        if (data.image_url) {
          setPreviewImage(data.image_url);
        }
      } catch (err) {
        console.error('Failed to load menu item:', err);
        router.push('/admin/sidebar');
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
    data.append('title', formData.title);
    if (formData.image) {
      data.append('image', formData.image);
    }

    const success = await updateSidebarItem(id, data);
    if (success) {
      router.push('/admin/sidebar');
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

  const labelClass =
    'font-mono text-[11px] font-bold text-[#8A8A78] uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-12 px-4 bg-white border border-gray-200 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase placeholder:text-gray-300 text-[#1B1B1B]';

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
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
            Edit Menu Details
          </h1>
          <p className="text-[13px] text-[#6B6B5E] font-medium">
            Update the name or icon for this sidebar category.
          </p>
        </div>
      </div>

      {/* Form Container - Full Width */}
      <div className="bg-white border border-gray-100 p-8 md:p-12 w-full">
        <div className="mb-10 border-b border-gray-50 pb-6">
          <h2 className="font-mono text-sm font-bold text-[#1B1B1B] uppercase tracking-widest">
            Menu Details
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          {/* Left: Text Details */}
          <div className="space-y-8">
            <div>
              <label className={labelClass}>Menu Title / Name</label>
              <input
                type="text"
                className={inputClass}
                value={formData.title}
                onChange={e =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="p-4 bg-gray-50 border border-gray-100 font-mono text-[10px] text-[#8A8A78] uppercase leading-relaxed">
              Note: Changes will be reflected immediately on the public website
              sidebar.
            </div>
          </div>

          {/* Right: Image Upload */}
          <div className="space-y-4">
            <label className={labelClass}>Current Icon / Photo</label>
            <div
              onClick={() => fileInputRef.current.click()}
              className="aspect-square max-w-[200px] border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#E8F0EA] hover:border-[#3A5A40] transition-all group overflow-hidden relative"
            >
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <>
                  <FiImage
                    size={32}
                    className="text-gray-300 group-hover:text-[#3A5A40]"
                  />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Change Icon
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
            <p className="text-[10px] text-[#B7B7A4] font-medium uppercase">
              Click the box above to upload a new icon.
            </p>
          </div>

          {/* Full Width Submit Button */}
          <div className="lg:col-span-2 pt-4">
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
          </div>

          {updateError && (
            <div className="lg:col-span-2 p-4 bg-red-50 border border-red-100 text-red-600 font-mono text-[10px] font-bold uppercase text-center">
              Error: {updateError}
            </div>
          )}
        </form>
      </div>

      {/* Footer */}
      <div className="font-mono text-[10px] text-[#B7B7A4] uppercase tracking-[0.2em]">
        System_ID: #SID_{id}
      </div>
    </div>
  );
}
