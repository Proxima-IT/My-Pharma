'use client';
import React, { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FiArrowLeft,
  FiCheck,
  FiImage,
  FiActivity,
  FiAlertCircle,
} from 'react-icons/fi';
import { useCategoryAdmin } from '../../../hooks/useCategoryAdmin';
import AuthGuard from '@/app/(shared)/components/AuthGuard';

/**
 * AdminNewCategoryPage
 * Super Admin Zone: Simplified creation flow with homepage section support.
 * Updated: Uses the persistent 'is_home_categoery' database field for section status.
 * Logic: Bypasses product-level linking as sections are now driven by category flags.
 * Design: Strictly rounded-none, industrial feel, business-friendly labels.
 */
export default function AdminNewCategoryPage() {
  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN']}>
      <Suspense
        fallback={
          <div className="p-20 font-mono uppercase animate-pulse text-black">
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

  // Automatic parent assignment from URL query
  const autoParentId = searchParams.get('parent');

  const {
    createCategory,
    isUpdating: hookIsUpdating,
    error: hookError,
  } = useCategoryAdmin();

  // Internal state for orchestration
  const [isProcessing, setIsProcessing] = useState(false);
  const [localError, setLocalError] = useState(null);

  const imageInputRef = useRef(null);

  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    is_active: true,
    is_featured_home: false,
    is_home_categoery: false, // Persistent field for Homepage Section
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

  /**
   * handleSubmit
   * Logic:
   * 1. Creates the category record with the persistent 'is_home_categoery' flag.
   * 2. Bypasses manual product linking as homepage sections now filter by category status.
   */
  const handleSubmit = async e => {
    e.preventDefault();
    setIsProcessing(true);
    setLocalError(null);

    // Construct FormData for multipart submission
    const data = new FormData();
    data.append('name', formData.name);
    data.append('is_active', formData.is_active);
    data.append('is_featured_home', formData.is_featured_home);
    data.append('is_home_categoery', formData.is_home_categoery); // Save to persistent DB column
    data.append('featured_order', formData.featured_order);

    if (autoParentId) {
      data.append('parent', autoParentId);
    }

    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      const success = await createCategory(data);
      if (success) {
        if (autoParentId) {
          window.history.back();
        } else {
          router.push('/admin/categories');
        }
      }
    } catch (err) {
      setLocalError('Failed to create category registry.');
    } finally {
      setIsProcessing(false);
    }
  };

  const labelClass =
    'font-mono text-[11px] font-bold text-[#8A8A78] uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-12 px-4 bg-white border border-gray-200 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase placeholder:text-gray-300 text-[#1B1B1B]';

  const activeUpdating = hookIsUpdating || isProcessing;

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 pb-20 text-black">
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
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
            Create New Category
          </h1>
          <p className="text-[13px] text-[#6B6B5E] font-medium">
            Define a new category and its visibility settings for your store.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-gray-100 p-8 md:p-12 w-full rounded-none shadow-none">
        <form onSubmit={handleSubmit} className="space-y-10">
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

          {/* Configuration Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Shop Visibility */}
            <div className="p-6 bg-gray-50 border border-gray-100 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-[12px] uppercase">
                  Active Status
                </span>
                <span className="text-[9px] text-gray-400 uppercase font-bold mt-1">
                  Visible in shop?
                </span>
              </div>
              <input
                type="checkbox"
                className="w-8 h-8 accent-[#3A5A40] cursor-pointer"
                checked={formData.is_active}
                onChange={e =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
              />
            </div>

            {/* 2. Icon Bar Visibility */}
            <div className="p-6 bg-gray-50 border border-gray-100 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-[12px] uppercase">
                  Home Icon Bar
                </span>
                <span className="text-[9px] text-gray-400 uppercase font-bold mt-1">
                  Show in circles?
                </span>
              </div>
              <input
                type="checkbox"
                className="w-8 h-8 accent-[#3A5A40] cursor-pointer"
                checked={formData.is_featured_home}
                onChange={e =>
                  setFormData({
                    ...formData,
                    is_featured_home: e.target.checked,
                  })
                }
              />
            </div>

            {/* 3. Section Trigger (Persistent) */}
            <div className="p-6 bg-black text-white flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-[12px] uppercase">
                  Make it a Section
                </span>
                <span className="text-[9px] text-gray-300 uppercase font-bold mt-1">
                  Show big product grid?
                </span>
              </div>
              <input
                type="checkbox"
                className="w-8 h-8 accent-white cursor-pointer"
                checked={formData.is_home_categoery}
                onChange={e =>
                  setFormData({
                    ...formData,
                    is_home_categoery: e.target.checked,
                  })
                }
              />
            </div>
          </div>

          {/* Processing Feedback */}
          {activeUpdating && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 flex items-center gap-3">
              <FiActivity className="text-emerald-600 animate-spin" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                Writing Registry Entry...
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={activeUpdating}
            className="w-full h-16 bg-black text-white font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-[#3A5A40] transition-all duration-300 cursor-pointer disabled:opacity-50 rounded-none border-none shadow-none"
          >
            {activeUpdating ? (
              'CREATING...'
            ) : (
              <>
                <FiCheck size={20} /> CREATE CATEGORY
              </>
            )}
          </button>

          {(hookError || localError) && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 font-mono text-[10px] font-bold uppercase text-center rounded-none shadow-none">
              Error: {hookError || localError}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
