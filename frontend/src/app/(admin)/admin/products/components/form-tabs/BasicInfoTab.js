'use client';
import React from 'react';
import RichTextEditor from '../RichTextEditor';

// Tailwind style constants for industrial "Sharp" design
const inputClass =
  'w-full h-14 px-5 bg-white border-2 border-gray-100 rounded-none text-sm font-mono focus:outline-none focus:border-black transition-all uppercase placeholder:text-gray-200 text-black';
const labelClass =
  'block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3';

/**
 * BasicInfoTab
 * Updated: Integrated the professional RichTextEditor for the product description.
 * Data is saved in Markdown (README) format via the editor's internal storage.
 */
export default function BasicInfoTab({
  formData,
  handleInputChange,
  brands,
  categories,
  ingredients,
}) {
  /**
   * Adapts the RichTextEditor's direct value change to the parent's
   * generic handleInputChange event-based logic.
   */
  const handleEditorChange = value => {
    handleInputChange({
      target: {
        name: 'description',
        value: value,
      },
    });
  };

  return (
    <div className="space-y-10 animate-in slide-in-from-left-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Medicine Name */}
        <div>
          <label className={labelClass}>Medicine Name</label>
          <input
            name="name"
            className={inputClass}
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="E.G. NAPA 500MG"
          />
        </div>

        {/* Ingredient Selection */}
        <div>
          <label className={labelClass}>Generic / Active Ingredient</label>
          <select
            name="ingredient"
            className={inputClass}
            value={formData.ingredient}
            onChange={handleInputChange}
            required
          >
            <option value="">Select DNA Match</option>
            {ingredients?.results?.map(ing => (
              <option key={ing.id} value={ing.id}>
                {ing.name.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Brand Selection */}
        <div>
          <label className={labelClass}>Company Brand</label>
          <select
            name="brand"
            className={inputClass}
            value={formData.brand}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Brand</option>
            {brands?.results?.map(b => (
              <option key={b.id} value={b.id}>
                {b.name.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Category Selection */}
        <div>
          <label className={labelClass}>Group / Category</label>
          <select
            name="category"
            className={inputClass}
            value={formData.category}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Category</option>
            {categories?.results?.map(c => (
              <option key={c.id} value={c.id}>
                {c.name.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Professional WYSIWYG Editor */}
      <div className="space-y-0">
        <label className={labelClass}>
          General Product Overview (Visual Editor)
        </label>

        <RichTextEditor
          value={formData.description}
          onChange={handleEditorChange}
          placeholder="Enter a detailed product description here..."
        />

        <p className="text-[9px] font-bold text-gray-400 mt-3 uppercase tracking-widest">
          Formatting applied here is saved as high-fidelity Markdown.
        </p>
      </div>
    </div>
  );
}
