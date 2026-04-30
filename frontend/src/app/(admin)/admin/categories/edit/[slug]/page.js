'use client';
import React, { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCheck, FiImage } from 'react-icons/fi';
import { useCategoryAdmin } from '@/app/(admin)/hooks/useCategoryAdmin';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';
import AuthGuard from '@/app/(shared)/components/AuthGuard';

/**
 * AdminEditCategoryPage
 * Super Admin Zone: Handles category updates including homepage visibility settings.
 * Design: Strictly rounded-none, industrial contrast, business-friendly labels.
 */
export default function AdminEditCategoryPage({ params }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN']}>
      <EditCategoryContent slug={slug} />
    </AuthGuard>
  );
}

function EditCategoryContent({ slug }) {
  const router = useRouter();
  const {
    categoryDetails,
    fetchCategoryBySlug,
    updateCategory,
    isUpdating,
    loading: fetchLoading,
  } = useCategoryAdmin();

  const imageInputRef = useRef(null);

  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    is_active: true,
    is_featured_home: false,
    featured_order: 0,
    image: null,
  });

  // Load existing data from the database
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchCategoryBySlug(slug);
      if (data) {
        setFormData({
          name: data.name || '',
          is_active: data.is_active ?? true,
          is_featured_home: data.is_featured_home ?? false,
          featured_order: data.featured_order || 0,
          image: null,
        });
        if (data.image) {
          setPreviewImage(getMediaUrl(data.image));
        }
      }
    };
    if (slug) loadData();
  }, [slug, fetchCategoryBySlug]);

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Construct FormData for multipart/file submission
    const data = new FormData();
    data.append('name', formData.name);
    data.append('is_active', formData.is_active);
    data.append('is_featured_home', formData.is_featured_home);
    data.append('featured_order', formData.featured_order);

    if (formData.image) {
      data.append('image', formData.image);
    }

    const success = await updateCategory(slug, data);
    if (success) router.push('/admin/categories');
  };

  if (fetchLoading && !categoryDetails) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#3A5A40] border-t-transparent animate-spin rounded-none" />
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-[#8A8A78]">
            Syncing Data...
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
            Edit Category
          </h1>
          <p className="text-[13px] text-[#6B6B5E] font-medium">
            Manage how this category appears in your store and on the homepage.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-gray-100 p-8 md:p-12 w-full rounded-none shadow-none">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Category Name */}
            <div className="md:col-span-1">
              <label className={labelClass}>Category Name</label>
              <input
                type="text"
                className={inputClass}
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Featured Order */}
            <div className="md:col-span-1">
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

          {/* Image Asset Section */}
          <div className="space-y-4">
            <label className={labelClass}>Category Icon</label>
            <div
              onClick={() => imageInputRef.current.click()}
              className="aspect-square max-w-[180px] border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#E8F0EA] hover:border-[#3A5A40] transition-all group overflow-hidden relative rounded-none shadow-none"
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
            <div className="flex items-center justify-between p-6 bg-gray-50 border border-gray-100 rounded-none shadow-none">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[13px] font-bold text-[#1B1B1B] uppercase">
                  Active Status
                </span>
                <span className="font-mono text-[10px] text-[#8A8A78] uppercase">
                  Show this category in the public shop?
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

            {/* Home Page Toggle */}
            <div className="flex items-center justify-between p-6 bg-gray-50 border border-gray-100 rounded-none shadow-none">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[13px] font-bold text-[#1B1B1B] uppercase">
                  Show on Home Page
                </span>
                <span className="font-mono text-[10px] text-[#8A8A78] uppercase">
                  Highlight this category on the main landing page?
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

          {/* Action Button */}
          <button
            type="submit"
            disabled={isUpdating}
            className="w-full h-16 bg-[#3A5A40] text-white font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-black transition-all duration-300 cursor-pointer disabled:opacity-50 rounded-none border-none shadow-none"
          >
            {isUpdating ? (
              'UPDATING...'
            ) : (
              <>
                <FiCheck size={20} /> SAVE CATEGORY CHANGES
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
