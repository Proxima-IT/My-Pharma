'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import { useCategoryAdmin } from '../../../hooks/useCategoryAdmin';

export default function AdminNewCategoryPage() {
  const router = useRouter();
  const { createCategory, fetchCategoryTree, categoryTree, isUpdating, error } =
    useCategoryAdmin();

  const [formData, setFormData] = useState({
    name: '',
    parent: '',
    is_active: true,
  });

  // ড্রপডাউনের জন্য গ্রুপের তালিকা লোড করা
  useEffect(() => {
    fetchCategoryTree();
  }, [fetchCategoryTree]);

  // গ্রুপের হায়ারার্কি দেখানোর জন্য ফাংশন
  const renderOptions = (nodes, depth = 0) => {
    if (!nodes || !Array.isArray(nodes)) return null;
    return nodes.map(node => (
      <React.Fragment key={node.id}>
        <option value={node.id}>
          {'\u00A0'.repeat(depth * 4)}
          {depth > 0 ? '↳ ' : ''}
          {node.name.toUpperCase()}
        </option>
        {node.children && renderOptions(node.children, depth + 1)}
      </React.Fragment>
    ));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      ...formData,
      parent: formData.parent === '' ? null : parseInt(formData.parent),
    };
    const success = await createCategory(payload);
    if (success) router.push('/admin/categories');
  };

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
            Add New Group
          </h1>
          <p className="text-[13px] text-[#6B6B5E] font-medium">
            Create a new classification for your medicines (e.g. Injections,
            Creams).
          </p>
        </div>
      </div>

      {/* Form Container - Full Width */}
      <div className="bg-white border border-gray-100 p-8 md:p-12 w-full">
        <div className="mb-10 border-b border-gray-50 pb-6">
          <h2 className="font-mono text-sm font-bold text-[#1B1B1B] uppercase tracking-widest">
            Group Details
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Group Name */}
            <div>
              <label className={labelClass}>Group Name / Type</label>
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

            {/* Parent Selection */}
            <div>
              <label className={labelClass}>
                Under Which Group? (Optional)
              </label>
              <select
                className={inputClass + ' cursor-pointer appearance-none'}
                value={formData.parent}
                onChange={e =>
                  setFormData({ ...formData, parent: e.target.value })
                }
              >
                <option value="">NONE (THIS IS A MAIN GROUP)</option>
                {renderOptions(categoryTree)}
              </select>
            </div>
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between p-6 bg-gray-50 border border-gray-100">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[13px] font-bold text-[#1B1B1B] uppercase">
                Active Status
              </span>
              <span className="font-mono text-[10px] text-[#8A8A78] uppercase">
                Show this group to customers in the shop?
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
                <FiCheck size={20} /> SAVE GROUP
              </>
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 font-mono text-[10px] font-bold uppercase text-center">
              Error: {error}
            </div>
          )}
        </form>
      </div>

      {/* Footer */}
      <div className="font-mono text-[10px] text-[#B7B7A4] uppercase tracking-[0.2em]">
        Status: Awaiting_Input
      </div>
    </div>
  );
}
