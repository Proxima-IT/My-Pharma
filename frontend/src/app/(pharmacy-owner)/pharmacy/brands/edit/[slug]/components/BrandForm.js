'use client';
import React, { useState, useEffect } from 'react';

/**
 * BrandForm Component - Refactored for "Sharp" Design
 * Language simplified for Bangladeshi Pharmacy Owners.
 */
const BrandForm = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    is_active: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        is_active: initialData.is_active ?? true,
      });
    }
  }, [initialData]);

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(formData);
  };

  const labelClass =
    'font-mono text-[11px] font-bold text-(--color-text-secondary) uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-12 px-4 bg-white border border-(--color-admin-border) rounded-none text-sm font-mono focus:outline-none focus:border-(--color-admin-accent) transition-all uppercase placeholder:text-gray-300';

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col gap-10 items-stretch"
    >
      {/* Brand Name Input */}
      <div className="w-full">
        <label className={labelClass}>BRAND NAME / COMPANY NAME</label>
        <input
          type="text"
          placeholder="E.G. SQUARE PHARMA OR BEXIMCO"
          className={inputClass}
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      {/* Status Toggle Area - Sharp Square Design */}
      <div className="w-full flex items-center justify-between px-6 py-6 bg-white border border-(--color-admin-border) rounded-none">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[13px] font-bold text-(--color-admin-navy) uppercase tracking-tight">
            ACTIVE STATUS
          </span>
          <span className="font-mono text-[10px] text-(--color-text-secondary) uppercase tracking-wide">
            SHOW THIS BRAND TO CUSTOMERS IN THE SHOP?
          </span>
        </div>

        <div className="relative flex items-center">
          <input
            type="checkbox"
            id="is_active"
            className="w-8 h-8 border-2 border-(--color-admin-border) rounded-none bg-white accent-(--color-admin-primary) cursor-pointer"
            checked={formData.is_active}
            onChange={e =>
              setFormData({ ...formData, is_active: e.target.checked })
            }
          />
        </div>
      </div>

      {/* Submit Button - Sharp Action */}
      <div className="w-full">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-16 bg-(--color-admin-primary) text-white font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-(--color-admin-accent) transition-all duration-300 cursor-pointer border border-(--color-admin-border) rounded-none disabled:opacity-50"
        >
          {isLoading ? (
            <span className="animate-pulse font-mono">
              SAVING... PLEASE WAIT
            </span>
          ) : (
            <span className="font-mono">
              {initialData ? 'SAVE CHANGES' : 'SAVE BRAND'}
            </span>
          )}
        </button>
      </div>

      {/* System Note */}
      <p className="font-mono text-[9px] text-(--color-text-secondary) text-center uppercase tracking-[0.2em]">
        NOTE: ALL CHANGES ARE SAVED SECURELY IN THE SYSTEM.
      </p>
    </form>
  );
};

export default BrandForm;
