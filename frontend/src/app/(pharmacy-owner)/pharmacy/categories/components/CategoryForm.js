'use client';
import React, { useState, useEffect } from 'react';
import UiInput from '@/app/(public)/components/UiInput';
import UiButton from '@/app/(public)/components/UiButton';

/**
 * CategoryForm Component
 * Shared between New and Edit category pages.
 * Handles hierarchical parent selection and active status.
 */
const CategoryForm = ({ initialData, categoryTree, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    parent: '',
    is_active: true,
  });

  // Sync initialData when editing - Optimized to prevent cascading renders
  useEffect(() => {
    if (initialData) {
      const normalizedInitial = {
        name: initialData.name || '',
        parent: initialData.parent || '',
        is_active: initialData.is_active ?? true,
      };

      setFormData(prev => {
        if (
          prev.name === normalizedInitial.name &&
          prev.parent === normalizedInitial.parent &&
          prev.is_active === normalizedInitial.is_active
        ) {
          return prev;
        }
        return normalizedInitial;
      });
    }
  }, [initialData]);

  const handleSubmit = e => {
    e.preventDefault();
    // Convert empty string parent to null for API compatibility
    const payload = {
      ...formData,
      parent: formData.parent === '' ? null : parseInt(formData.parent),
    };
    onSubmit(payload);
  };

  /**
   * Recursive helper to render the category tree into a flat select list
   * with visual indentation to show hierarchy.
   */
  const renderOptions = (nodes, depth = 0) => {
    if (!nodes || !Array.isArray(nodes)) return null;

    return nodes.map(node => (
      <React.Fragment key={node.id}>
        <option value={node.id}>
          {'\u00A0'.repeat(depth * 4)}
          {depth > 0 ? '↳ ' : ''}
          {node.name}
        </option>
        {node.children &&
          Array.isArray(node.children) &&
          renderOptions(node.children, depth + 1)}
      </React.Fragment>
    ));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col gap-8 items-stretch"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Name */}
        <UiInput
          label="Category Name"
          placeholder="e.g. Prescription Medicines"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          required
        />

        {/* Parent Category Selection */}
        <div className="flex flex-col gap-2 w-full group">
          <label className="text-[13px] font-bold text-gray-600 group-focus-within:text-(--color-primary-500) transition-colors duration-300 ml-5">
            Parent Category (Optional)
          </label>
          <div className="relative">
            <select
              value={formData.parent}
              onChange={e =>
                setFormData({ ...formData, parent: e.target.value })
              }
              className="w-full py-3.5 pl-6 pr-10 rounded-full outline-none text-sm text-gray-900 bg-white border border-gray-200 focus:ring-4 focus:ring-primary-50/50 focus:border-(--color-primary-500) transition-all duration-300 appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='C19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1.25rem center',
                backgroundSize: '1.25rem',
              }}
            >
              <option value="">None (Root Category)</option>
              {renderOptions(categoryTree)}
            </select>
          </div>
        </div>
      </div>

      {/* Status Toggle Area */}
      <div className="w-full flex items-center justify-between px-6 py-5 bg-gray-50/50 rounded-[24px] border border-gray-100">
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-gray-700">
            Active Status
          </span>
          <span className="text-[11px] text-gray-500 font-medium">
            Toggle whether this category is visible in the shop
          </span>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={formData.is_active}
            onChange={e =>
              setFormData({ ...formData, is_active: e.target.checked })
            }
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--color-primary-500)"></div>
        </label>
      </div>

      {/* Submit Button */}
      <div className="w-full mt-2">
        <UiButton type="submit" isLoading={isLoading}>
          {initialData ? 'Update Category' : 'Create Category'}
        </UiButton>
      </div>
    </form>
  );
};

export default CategoryForm;
