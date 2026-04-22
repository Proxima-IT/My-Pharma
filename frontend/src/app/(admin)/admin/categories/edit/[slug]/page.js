'use client';
import React, { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCheck, FiImage } from 'react-icons/fi';
import { useCategoryAdmin } from '@/app/(admin)/hooks/useCategoryAdmin';
import { useSidebarAdmin } from '@/app/(admin)/hooks/useSidebarAdmin';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';
import AuthGuard from '@/app/(shared)/components/AuthGuard';

/**
 * AdminEditCategoryPage
 * Super Admin Zone: Handles category updates and organization.
 * Feature: Links Product Categories to Custom Sidebar Menus (sidebar_category).
 * Design: Strictly rounded-none, high contrast industrial feel.
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

  // Load necessary data: Hierarchy tree, Custom Sidebar items, and Target category details
  useEffect(() => {
    const loadData = async () => {
      // Fetch Method B items for the organization dropdown
      await Promise.all([
        fetchCategoryTree(),
        fetchSidebarItems({ page_size: 200 }),
      ]);

      const data = await fetchCategoryBySlug(slug);
      if (data) {
        setFormData({
          name: data.name || '',
          parent: data.parent || '',
          sidebar_category: data.sidebar_category || '',
          is_active: data.is_active ?? true,
          image: null,
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

  // Helper to render nested product category options (Method A)
  const renderCategoryOptions = (nodes, depth = 0) => {
    if (!nodes || !Array.isArray(nodes)) return null;
    return nodes.map(node => (
      <React.Fragment key={node.id}>
        {node.slug !== slug && (
          <option value={node.id}>
            {'\u00A0'.repeat(depth * 4)}
            {depth > 0 ? '↳ ' : ''}
            {node.name.toUpperCase()}
          </option>
        )}
        {node.children && renderCategoryOptions(node.children, depth + 1)}
      </React.Fragment>
    ));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Construct FormData for multipart submission
    const data = new FormData();
    data.append('name', formData.name);
    data.append('is_active', formData.is_active);

    if (formData.parent !== '' && formData.parent !== null) {
      data.append('parent', formData.parent);
    }

    // Crucial: Linking to Custom Sidebar Menu (Method B)
    if (
      formData.sidebar_category !== '' &&
      formData.sidebar_category !== null
    ) {
      data.append('sidebar_category', formData.sidebar_category);
    } else {
      data.append('sidebar_category', ''); // Send empty to unassign
    }

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
            Syncing_Registry...
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
      {/* Header */}
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
          <h1 className="text-4xl font-black text-[#1B1B1B] tracking-tighter uppercase leading-none">
            Edit Category
          </h1>
          <p className="text-[13px] text-[#6B6B5E] font-medium">
            Manage classification and sidebar organization for:{' '}
            <span className="text-[#3A5A40] font-bold underline">
              {categoryDetails?.name}
            </span>
          </p>
        </div>
      </div>

      {/* Form Body */}
      <div className="bg-white border border-gray-100 p-8 md:p-12 w-full rounded-none">
        <div className="mb-10 border-b border-gray-50 pb-6">
          <h2 className="font-mono text-sm font-bold text-[#1B1B1B] uppercase tracking-widest">
            Organization & Assets
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Category Name */}
            <div>
              <label className={labelClass}>Category Title</label>
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

            {/* Hierarchical Parent (Method A) */}
            <div>
              <label className={labelClass}>Sub-Category Of? (Optional)</label>
              <select
                className={inputClass + ' cursor-pointer appearance-none'}
                value={formData.parent}
                onChange={e =>
                  setFormData({ ...formData, parent: e.target.value })
                }
              >
                <option value="">NONE (THIS IS A ROOT CATEGORY)</option>
                {renderCategoryOptions(categoryTree)}
              </select>
            </div>

            {/* Sidebar Custom Menu Parent (Method B) */}
            <div>
              <label className={labelClass}>Assign to Sidebar Menu?</label>
              <select
                className={
                  inputClass +
                  ' cursor-pointer appearance-none border-[#3A5A40]/30'
                }
                value={formData.sidebar_category}
                onChange={e =>
                  setFormData({ ...formData, sidebar_category: e.target.value })
                }
              >
                <option value="">STANDALONE (NO CUSTOM MENU PARENT)</option>
                {sidebarItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.title.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Asset */}
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
                    Upload Asset
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

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between p-6 bg-gray-50 border border-gray-100 rounded-none shadow-none">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[13px] font-bold text-[#1B1B1B] uppercase">
                Active Store Status
              </span>
              <span className="font-mono text-[10px] text-[#8A8A78] uppercase">
                Should this category be visible to public users?
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

          {/* Action Button */}
          <button
            type="submit"
            disabled={isUpdating}
            className="w-full h-16 bg-[#3A5A40] text-white font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-black transition-all duration-300 cursor-pointer disabled:opacity-50 rounded-none border-none shadow-none"
          >
            {isUpdating ? (
              'PROCESSING...'
            ) : (
              <>
                <FiCheck size={20} /> COMMIT CHANGES
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
