'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiSave, FiGrid, FiHash, FiCheck } from 'react-icons/fi';
import { useBlogAdmin } from '../../../../hooks/useBlogAdmin';

/**
 * Admin Blog Category Create Page
 * Design: Super Admin Sharp Minimalist.
 */
export default function NewBlogCategoryPage() {
  const router = useRouter();
  const { createCategory, isUpdating, error } = useBlogAdmin();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    order: 0,
    is_active: true,
  });

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setFormData(prev => {
      const newData = { ...prev, [name]: val };
      if (name === 'name' && !prev.slug) {
        newData.slug = value
          .toLowerCase()
          .replace(/ /g, '-')
          .replace(/[^\w-]+/g, '');
      }
      return newData;
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const success = await createCategory(formData);
    if (success) {
      router.push('/admin/blogs');
    }
  };

  const labelClass =
    'font-mono text-[10px] font-bold text-[#8A8A78] uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-11 px-4 bg-white border border-gray-100 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase placeholder:text-gray-200 text-[#1B1B1B]';

  return (
    <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-6">
        <div className="space-y-4">
          <Link
            href="/admin/blogs"
            className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[#8A8A78] hover:text-[#1B1B1B] transition-colors"
          >
            <FiArrowLeft /> Back to Blog List
          </Link>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none text-[#1B1B1B]">
            New Category
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isUpdating}
          className="h-14 px-10 bg-[#1B1B1B] text-white font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3 hover:bg-[#3A5A40] transition-all cursor-pointer disabled:opacity-50"
        >
          {isUpdating ? (
            'Saving...'
          ) : (
            <>
              <FiSave size={18} /> Create Category
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 font-mono text-xs uppercase">
          Error: {typeof error === 'object' ? 'Validation failed' : error}
        </div>
      )}

      <div className="bg-white border border-gray-100 p-8 space-y-8">
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
              placeholder="E.G. HEALTH TIPS"
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
              placeholder="health-tips"
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
