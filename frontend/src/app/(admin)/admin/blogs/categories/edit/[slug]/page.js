'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiSave,
  FiGrid,
  FiRefreshCw,
  FiHash,
} from 'react-icons/fi';
import { useBlogAdmin } from '../../../../../hooks/useBlogAdmin';

/**
 * Admin Blog Category Edit Page
 * Design: Super Admin Sharp Minimalist.
 * Updated: Set to 100% width to utilize full dashboard space.
 */
export default function EditBlogCategoryPage({ params }) {
  const resolvedParams = use(params);
  const slugParam = resolvedParams.slug;
  const router = useRouter();

  const { categories, fetchCategories, updateCategory, isUpdating, error } =
    useBlogAdmin();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    order: 0,
    is_active: true,
  });

  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsFetching(true);
      try {
        await fetchCategories();
      } catch (err) {
        console.error('Load failed:', err);
      } finally {
        setIsFetching(false);
      }
    };
    loadData();
  }, [fetchCategories]);

  useEffect(() => {
    if (categories.results?.length > 0) {
      const cat = categories.results.find(c => c.slug === slugParam);
      if (cat) {
        setFormData({
          name: cat.name || '',
          slug: cat.slug || '',
          order: cat.order || 0,
          is_active: cat.is_active ?? true,
        });
      }
    }
  }, [categories, slugParam]);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const success = await updateCategory(slugParam, formData);
    if (success) {
      router.push('/admin/blogs');
    }
  };

  if (isFetching) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center space-y-4">
        <FiRefreshCw className="animate-spin text-[#3A5A40]" size={32} />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#8A8A78]">
          Accessing Registry...
        </span>
      </div>
    );
  }

  const labelClass =
    'font-mono text-[10px] font-bold text-[#8A8A78] uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-11 px-4 bg-white border border-gray-100 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase placeholder:text-gray-200 text-[#1B1B1B]';

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-6">
        <div className="space-y-4">
          <Link
            href="/admin/blogs"
            className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[#8A8A78] hover:text-[#1B1B1B] transition-colors"
          >
            <FiArrowLeft /> Back to Blog List
          </Link>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none text-[#1B1B1B]">
            Edit Category
          </h1>
          <div className="font-mono text-[10px] font-bold text-[#8A8A78] mt-2 uppercase tracking-widest">
            <FiHash className="inline" /> Slug Identifier: {slugParam}
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isUpdating}
          className="h-14 px-10 bg-[#1B1B1B] text-white font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3 hover:bg-[#3A5A40] transition-all cursor-pointer disabled:opacity-50"
        >
          {isUpdating ? (
            'Patching...'
          ) : (
            <>
              <FiSave size={18} /> Update Category
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 font-mono text-xs uppercase">
          Error: {typeof error === 'object' ? 'Update failed' : error}
        </div>
      )}

      {/* Form Container - Full Width */}
      <div className="bg-white border border-gray-100 p-8 space-y-8 shadow-none">
        <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest border-b border-gray-50 pb-4 flex items-center gap-2 text-[#1B1B1B]">
          <FiGrid className="text-[#3A5A40]" /> Category Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2">
            <label className={labelClass}>Category Name</label>
            <input
              name="name"
              required
              className={inputClass}
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className={labelClass}>URL Slug Identifier</label>
            <input
              name="slug"
              required
              className={inputClass}
              value={formData.slug}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className={labelClass}>Display Order</label>
            <input
              name="order"
              type="number"
              className={inputClass}
              value={formData.order}
              onChange={handleInputChange}
            />
          </div>

          <div className="pt-4">
            <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 border border-gray-100 group">
              <input
                type="checkbox"
                name="is_active"
                className="w-5 h-5 accent-[#3A5A40]"
                checked={formData.is_active}
                onChange={handleInputChange}
              />
              <span className="font-mono text-[11px] font-bold text-[#1B1B1B] uppercase tracking-widest group-hover:text-[#3A5A40] transition-colors">
                Active in Sidebar
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
