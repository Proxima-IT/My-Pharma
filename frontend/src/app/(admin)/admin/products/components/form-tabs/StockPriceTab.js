'use client';
import React, { useEffect } from 'react';

/**
 * StockPriceTab Component
 * Industrial "Sharp" design for managing product financials and inventory levels.
 * Updated: Added "show_on_home" flag to trigger homepage section linking.
 */

// Tailwind style constants
const inputClass =
  'w-full h-14 px-5 bg-white border-2 border-gray-100 rounded-none text-sm font-mono focus:outline-none focus:border-black transition-all uppercase placeholder:text-gray-200 text-black';
const labelClass =
  'block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3';

export default function StockPriceTab({ formData, handleInputChange }) {
  useEffect(() => {
    if (formData.is_generic !== true) {
      handleInputChange({
        target: {
          name: 'is_generic',
          type: 'checkbox',
          checked: true,
          value: true,
        },
      });
    }
  }, [formData.is_generic, handleInputChange]);

  // Use 'is_featured_home' to sync with the backend property provided in the product detail response
  const flags = ['requires_prescription', 'is_active', 'show_on_home'];

  return (
    <div className="space-y-10 animate-in slide-in-from-left-2 text-black">
      {/* Price and Stock Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <label className={labelClass}>Original Price (৳)</label>
          <input
            name="original_price"
            type="number"
            step="0.01"
            className={inputClass}
            value={formData.original_price}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label className={labelClass}>Discounted Price (৳)</label>
          <input
            name="price"
            type="number"
            step="0.01"
            className={inputClass}
            value={formData.price}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Current Inventory Count</label>
          <input
            name="quantity_in_stock"
            type="number"
            className={inputClass}
            value={formData.quantity_in_stock}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Low Stock Alert</label>
          <input
            name="low_stock_threshold"
            type="number"
            className={inputClass}
            value={formData.low_stock_threshold}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Product Visibility and Type Flags */}
      <div className="p-8 bg-gray-50 border border-gray-100 flex flex-wrap gap-8 rounded-none">
        {flags.map(flag => (
          <label
            key={flag}
            className="flex items-center gap-4 cursor-pointer group"
          >
            <input
              name={flag}
              type="checkbox"
              className="w-6 h-6 border-2 border-gray-200 rounded-none bg-white accent-black cursor-pointer shadow-none"
              checked={!!formData[flag]} // Force boolean to ensure checkmark displays
              onChange={handleInputChange}
            />
            <span className="text-[11px] font-black text-gray-500 group-hover:text-black uppercase tracking-widest transition-colors">
              {flag.replace(/_/g, ' ')}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
