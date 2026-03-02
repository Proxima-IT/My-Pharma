'use client';
import React, { useState, useEffect } from 'react';
import UiInput from '@/app/(public)/components/UiInput';
import UiButton from '@/app/(public)/components/UiButton';

/**
 * BrandForm Component
 * Handles both Create and Edit logic for Brands.
 * Uses the "Relaxing Vibe" design system: no shadows, high rounding.
 */
const BrandForm = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    is_active: true,
  });

  // Sync initialData when editing - Optimized to prevent cascading renders
  useEffect(() => {
    if (initialData) {
      const normalizedInitial = {
        name: initialData.name || '',
        is_active: initialData.is_active ?? true,
      };

      setFormData(prev => {
        if (
          prev.name === normalizedInitial.name &&
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
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col gap-8 items-stretch"
    >
      {/* Brand Name Input - Explicitly w-full */}
      <UiInput
        label="Brand Name"
        placeholder="e.g. Square Pharmaceuticals Ltd."
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
        required
      />

      {/* Status Toggle Area - Full Width */}
      <div className="w-full flex items-center justify-between px-6 py-5 bg-gray-50/50 rounded-[24px] border border-gray-100">
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-gray-700">
            Active Status
          </span>
          <span className="text-[11px] text-gray-500 font-medium">
            Toggle whether this brand is visible in the shop
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

      {/* Submit Button - Explicitly w-full */}
      <div className="w-full mt-2">
        <UiButton type="submit" isLoading={isLoading}>
          {initialData ? 'Update Brand Details' : 'Save New Brand'}
        </UiButton>
      </div>
    </form>
  );
};

export default BrandForm;
