'use client';
import React, { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiArrowLeft,
  FiCheck,
  FiImage,
  FiAlertCircle,
  FiActivity,
} from 'react-icons/fi';
import { useCategoryAdmin } from '@/app/(admin)/hooks/useCategoryAdmin';
import { productAdminApi } from '@/app/(admin)/api/productAdminApi';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';
import AuthGuard from '@/app/(shared)/components/AuthGuard';

/**
 * AdminEditCategoryPage
 * Super Admin Zone: Handles category updates and homepage section organization.
 * Feature: Integrated "Make it a Section" logic to curate products into big home grids.
 * Design: Strictly rounded-none, industrial contrast, simple wording.
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
  const [isLinking, setIsLinking] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    is_active: true,
    is_featured_home: false,
    featured_order: 0,
    make_section: false, // UI trigger for product-to-category linking
    image: null,
  });

  // Load category details from registry
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchCategoryBySlug(slug);
      if (data) {
        setFormData({
          name: data.name || '',
          is_active: data.is_active ?? true,
          is_featured_home: data.is_featured_home ?? false,
          featured_order: data.featured_order || 0,
          make_section: false,
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

  /**
   * handleSubmit
   * 1. Updates category basic info and visibility flags.
   * 2. If 'Make it a Section' is checked, fetches direct products and links them via API.
   */
  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');

    // Prepare Category Data
    const data = new FormData();
    data.append('name', formData.name);
    data.append('is_active', formData.is_active);
    data.append('is_featured_home', formData.is_featured_home);
    data.append('featured_order', formData.featured_order);

    if (formData.image) {
      data.append('image', formData.image);
    }

    const success = await updateCategory(slug, data);

    if (success) {
      // Logic: If user wants to create/refresh a section, link all direct products
      if (formData.make_section && categoryDetails?.id) {
        setIsLinking(true);
        try {
          // Fetch products belonging to this category
          const productsRes = await productAdminApi.getProducts(token, {
            category: categoryDetails.id,
            page_size: 100, // Linking only first 100 direct products
          });

          const productList = productsRes.results || [];

          // Call link-category for each direct product
          for (const product of productList) {
            await productAdminApi.linkProductToCategory(token, product.slug, {
              category_id: categoryDetails.id,
            });
          }
        } catch (err) {
          console.error('Section linking failed', err);
        } finally {
          setIsLinking(false);
        }
      }
      router.push('/admin/categories');
    }
  };

  if (fetchLoading && !categoryDetails) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-10 h-10 border-4 border-[#3A5A40] border-t-transparent animate-spin rounded-none" />
      </div>
    );
  }

  const labelClass =
    'font-mono text-[11px] font-bold text-[#8A8A78] uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-12 px-4 bg-white border border-gray-200 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase placeholder:text-gray-300 text-[#1B1B1B]';

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 pb-20 text-black">
      {/* Top Header */}
      <div className="flex flex-col items-start gap-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-3 bg-[#3A5A40] text-white px-6 py-3 hover:bg-black transition-all cursor-pointer group border border-transparent rounded-none"
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
            Edit Category
          </h1>
          <p className="text-[13px] text-[#6B6B5E] font-medium">
            Configure identity, visibility, and homepage section settings.
          </p>
        </div>
      </div>

      {/* Form Area */}
      <div className="bg-white border border-gray-100 p-8 md:p-12 w-full rounded-none shadow-none">
        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
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
            <div>
              <label className={labelClass}>Order on Home Page</label>
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

          {/* Photo Upload */}
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

          {/* Visibility and Section Logic */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Shop Visibility */}
            <div className="p-6 bg-gray-50 border border-gray-100 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-[12px] uppercase">
                  Active Status
                </span>
                <span className="text-[9px] text-gray-400 uppercase font-bold mt-1">
                  Visible in store?
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

            {/* 2. Icon Bar Visibility (is_featured_home) */}
            <div className="p-6 bg-gray-50 border border-gray-100 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-[12px] uppercase">
                  Top Icon Bar
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

            {/* 3. Section Trigger (Make it a Section) */}
            <div className="p-6 bg-black text-white flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-[12px] uppercase">
                  Make it a Section
                </span>
                <span className="text-[9px] text-gray-300 uppercase font-bold mt-1">
                  Add to big Home grid?
                </span>
              </div>
              <input
                type="checkbox"
                className="w-8 h-8 accent-white cursor-pointer"
                checked={formData.make_section}
                onChange={e =>
                  setFormData({ ...formData, make_section: e.target.checked })
                }
              />
            </div>
          </div>

          {/* User Feedback for linking */}
          {(isLinking || isUpdating) && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 flex items-center gap-3">
              <FiActivity className="text-emerald-600 animate-spin" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                Processing_Registry_Changes_And_Section_Links...
              </span>
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={isUpdating || isLinking}
            className="w-full h-16 bg-black text-white font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-[#3A5A40] transition-all duration-300 cursor-pointer disabled:opacity-30 rounded-none border-none shadow-none"
          >
            {isUpdating || isLinking ? (
              'SYNCHRONIZING...'
            ) : (
              <>
                <FiCheck size={20} /> EXECUTE SAVE
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
