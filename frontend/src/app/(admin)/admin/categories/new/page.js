'use client';
import React, { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiArrowLeft, FiCheck, FiImage } from 'react-icons/fi';
import { useCategoryAdmin } from '../../../hooks/useCategoryAdmin';
import AuthGuard from '@/app/(shared)/components/AuthGuard';

/**
 * AdminNewCategoryPage
 * Super Admin Zone: Simplified creation flow with home page visibility options.
 * Logic: Parent is automatically assigned via URL query parameter if navigated from details.
 * Design: Strictly rounded-none, industrial feel, business-friendly labels.
 */
export default function AdminNewCategoryPage() {
  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN']}>
      <Suspense
        fallback={
          <div className="p-20 font-mono uppercase animate-pulse">
            Initializing Form...
          </div>
        }
      >
        <NewCategoryContent />
      </Suspense>
    </AuthGuard>
  );
}

function NewCategoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Automatic parent assignment from URL
  const autoParentId = searchParams.get('parent');

  const { createCategory, isUpdating, error } = useCategoryAdmin();

  const imageInputRef = useRef(null);

  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    is_active: true,
    is_featured_home: false,
    featured_order: 0,
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

    // Construct FormData for multipart submission
    const data = new FormData();
    data.append('name', formData.name);
    data.append('is_active', formData.is_active);
    data.append('is_featured_home', formData.is_featured_home);
    data.append('featured_order', formData.featured_order);

    if (autoParentId) {
      data.append('parent', autoParentId);
    }

    if (formData.image) {
      data.append('image', formData.image);
    }

    const success = await createCategory(data);
    if (success) {
      if (autoParentId) {
        window.history.back();
      } else {
        router.push('/admin/categories');
      }
    }
  };

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
          className="flex items-center gap-3 bg-[#3A5A40] text-white px-6 py-3 hover:bg-black transition-all cursor-pointer group border border-transparent rounded-none shadow-none"
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
            Create New Category
          </h1>
          <p className="text-[13px] text-[#6B6B5E] font-medium">
            Define a new category and its visibility settings for your store.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-gray-100 p-8 md:p-12 w-full rounded-none shadow-none">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Category Name */}
            <div>
              <label className={labelClass}>Category Name</label>
              <input
                type="text"
                placeholder="E.G. TABLETS OR SYRUP"
                className={inputClass}
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Home Page Order */}
            <div>
              <label className={labelClass}>Home Page Serial Order</label>
              <input
                type="number"
                className={inputClass}
                value={formData.featured_order}
                onChange={e =>
                  setFormData({ ...formData, featured_order: e.target.value })
                }
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <label className={labelClass}>Category Icon</label>
            <div
              onClick={() => imageInputRef.current.click()}
              className="aspect-square max-w-[200px] border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#E8F0EA] hover:border-[#3A5A40] transition-all group overflow-hidden relative rounded-none shadow-none"
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
                    Upload Photo
                  </span>
                </>
              )}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Store Status Toggle */}
            <div className="flex items-center justify-between p-6 bg-gray-50 border border-gray-100 rounded-none">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[13px] font-bold text-[#1B1B1B] uppercase">
                  Active Status
                </span>
                <span className="font-mono text-[10px] text-[#8A8A78] uppercase">
                  Make this category visible in the shop?
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

            {/* Home Page Featured Toggle */}
            <div className="flex items-center justify-between p-6 bg-gray-50 border border-gray-100 rounded-none">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[13px] font-bold text-[#1B1B1B] uppercase">
                  Show on Home Page
                </span>
                <span className="font-mono text-[10px] text-[#8A8A78] uppercase">
                  Feature this on the landing page?
                </span>
              </div>
              <input
                type="checkbox"
                className="w-8 h-8 border-gray-300 accent-[#3A5A40] cursor-pointer"
                checked={formData.is_featured_home}
                onChange={e =>
                  setFormData({
                    ...formData,
                    is_featured_home: e.target.checked,
                  })
                }
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUpdating}
            className="w-full h-16 bg-[#3A5A40] text-white font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-black transition-all duration-300 cursor-pointer disabled:opacity-50 rounded-none border-none shadow-none"
          >
            {isUpdating ? (
              'CREATING...'
            ) : (
              <>
                <FiCheck size={20} /> CREATE CATEGORY
              </>
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 font-mono text-[10px] font-bold uppercase text-center rounded-none">
              Error: {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
