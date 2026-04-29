'use client';
import React from 'react';

// Tailwind style constants
const inputClass = 'w-full h-14 px-5 bg-white border-2 border-gray-100 rounded-none text-sm font-mono focus:outline-none focus:border-black transition-all uppercase placeholder:text-gray-200';
const labelClass = 'block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3';

export default function StockPriceTab({ formData, handleInputChange }) {
  return (
    <div className="space-y-10 animate-in slide-in-from-left-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <label className={labelClass}>Selling Price (৳)</label>
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
          <label className={labelClass}>MRP / Original Price (৳)</label>
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
          <label className={labelClass}>Low Stock Threshold</label>
          <input
            name="low_stock_threshold"
            type="number"
            className={inputClass}
            value={formData.low_stock_threshold}
            onChange={handleInputChange}
          />
        </div>
      </div>
      <div className="p-8 bg-gray-50 border border-gray-100 flex flex-wrap gap-8">
        {['is_generic', 'requires_prescription', 'is_active'].map(
          flag => (
            <label
              key={flag}
              className="flex items-center gap-4 cursor-pointer"
            >
              <input
                name={flag}
                type="checkbox"
                className="w-6 h-6 accent-black"
                checked={formData[flag]}
                onChange={handleInputChange}
              />
              <span className="text-xs font-black uppercase tracking-widest">
                {flag.replace(/_/g, ' ')}
              </span>
            </label>
          ),
        )}
      </div>
    </div>
  );
}
