'use client';
import React, { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCheck, FiImage } from 'react-icons/fi';
import { useCategoryAdmin } from '@/app/(admin)/hooks/useCategoryAdmin';
import { useSidebarAdmin } from '@/app/(admin)/hooks/useSidebarAdmin';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';

export default function AdminEditCategoryPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const {
    categoryDetails,
    fetchCategoryBySlug,
    fetchCategoryTree,
    categoryTree,
    updateCategory,
    isUpdating,
    loading: fetchLoading,
  } = useCategoryAdmin();
  const { sidebarItems, fetchSidebarItems } = useSidebarAdmin();

  const imageInputRef = useRef(null);

  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    parent: '',
    sidebar_category: '',
    is_active: true,
    image: null,
  });

  // ১. ডাটা লোড করা
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchCategoryTree(), fetchSidebarItems({ page_size: 200 })]);
      const data = await fetchCategoryBySlug(slug);
      if (data) {
        setFormData({
          name: data.name || '',
          parent: data.parent || '',
          sidebar_category: data.sidebar_category || '',
          is_active: data.is_active ?? true,
          image: null, // New image will be set separately
        });
        if (data.image) {
          setPreviewImage(getMediaUrl(data.image));
        }
      }
    };
    if (slug) loadData();
  }, [slug, fetchCategoryBySlug, fetchCategoryTree, fetchSidebarItems]);

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // ২. গ্রুপের হায়ারার্কি দেখানোর জন্য ফাংশন
  const renderOptions = (nodes, depth = 0) => {
    if (!nodes || !Array.isArray(nodes)) return null;
    return nodes.map(node => (
      <React.Fragment key={node.id}>
        {/* নিজের গ্রুপকে নিজে প্যারেন্ট হিসেবে সিলেক্ট করা যাবে না */}
        {node.slug !== slug && (
          <option value={node.id}>
            {'\u00A0'.repeat(depth * 4)}
            {depth > 0 ? '↳ ' : ''}
            {node.name.toUpperCase()}
          </option>
        )}
        {node.children && renderOptions(node.children, depth + 1)}
      </React.Fragment>
    ));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      ...formData,
      parent: formData.parent === '' ? null : parseInt(formData.parent),
      sidebar_category:
        formData.sidebar_category === ''
          ? null
          : parseInt(formData.sidebar_category),
    };
    const success = await updateCategory(slug, payload);
    if (success) router.push('/admin/categories');
  };

  if (fetchLoading && !categoryDetails) {
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
    'w-full h-12 px-4 bg-white border border-gray-200 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase placeholder:text-gray-300';

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
            Edit Category Info
          </h1>
          <p className="text-[13px] text-[#6B6B5E] font-medium">
            Updating details for:{' '}
            <span className="text-[#3A5A40] font-bold">
              {categoryDetails?.name}
            </span>
          </p>
        </div>
      </div>

      {/* Form Container - Full Width */}
      <div className="bg-white border border-gray-100 p-8 md:p-12 w-full">
        <div className="mb-10 border-b border-gray-50 pb-6">
          <h2 className="font-mono text-sm font-bold text-[#1B1B1B] uppercase tracking-widest">
            Category Settings
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Category Name */}
            <div>
              <label className={labelClass}>Category Name / Type</label>
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

            {/* Parent Selection */}
            <div>
              <label className={labelClass}>
                Move Under Category? (Optional)
              </label>
              <select
                className={inputClass + ' cursor-pointer appearance-none'}
                value={formData.parent}
                onChange={e =>
                  setFormData({ ...formData, parent: e.target.value })
                }
              >
                <option value="">NONE (SET AS MAIN CATEGORY)</option>
                {renderOptions(categoryTree)}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Sidebar Menu Parent (Optional)
              </label>
              <select
                className={inputClass + ' cursor-pointer appearance-none'}
                value={formData.sidebar_category}
                onChange={e =>
                  setFormData({ ...formData, sidebar_category: e.target.value })
                }
              >
                <option value="">NONE (NO SIDEBAR MENU PARENT)</option>
                {sidebarItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.title.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <label className={labelClass}>Category Icon / Image</label>
            <div
              onClick={() => imageInputRef.current.click()}
              className="aspect-square max-w-[200px] border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#E8F0EA] hover:border-[#3A5A40] transition-all group overflow-hidden relative rounded-none"
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
              ref={imageInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
            <p className="text-[10px] text-[#B7B7A4] font-medium uppercase">
              Click to upload new icon. Recommended size: 64x64px (PNG/SVG).
            </p>
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between p-6 bg-gray-50 border border-gray-100">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[13px] font-bold text-[#1B1B1B] uppercase">
                Active Status
              </span>
              <span className="font-mono text-[10px] text-[#8A8A78] uppercase">
                Show this category in the shop?
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

          {/* Submit Button */}
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
        </form>
      </div>

      {/* Footer */}
      <div className="font-mono text-[10px] text-[#B7B7A4] uppercase tracking-[0.2em]">
        Category_ID: {categoryDetails?.id}
      </div>
    </div>
  );
}
