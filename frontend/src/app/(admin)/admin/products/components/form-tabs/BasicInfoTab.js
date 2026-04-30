'use client';
import React, { useState, useMemo, useEffect } from 'react';
import RichTextEditor from '../RichTextEditor';

// Tailwind style constants for industrial "Sharp" design
const inputClass =
  'w-full h-14 px-5 bg-white border-2 border-gray-100 rounded-none text-sm font-mono focus:outline-none focus:border-black transition-all uppercase placeholder:text-gray-200 text-black';
const labelClass =
  'block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3';

/**
 * BasicInfoTab
 * Updated: Implemented cascading category selection (Main Category -> Optional Sub-category).
 * Logic: Parent ID is sent if no sub-category is selected; otherwise, Sub-category ID is sent.
 */
export default function BasicInfoTab({
  formData,
  handleInputChange,
  brands,
  categories,
  ingredients,
  units,
}) {
  // ── Cascading Category Logic ────────────────────────────────────────
  const [selectedParentId, setSelectedParentId] = useState('');
  const [selectedChildId, setSelectedChildId] = useState('');

  // Main categories (where parent is null)
  const mainCategories = useMemo(() => {
    if (!categories?.results) return [];
    return categories.results.filter(c => c.parent === null);
  }, [categories]);

  // Sub-categories based on the selected main category
  const subCategories = useMemo(() => {
    if (!categories?.results || !selectedParentId) return [];
    return categories.results.filter(
      c => String(c.parent) === String(selectedParentId),
    );
  }, [categories, selectedParentId]);

  // Handle Edit Mode: Initialize parent/child based on the assigned category ID
  useEffect(() => {
    if (formData.category && categories?.results && !selectedParentId) {
      const currentCat = categories.results.find(
        c => c.id === Number(formData.category),
      );
      if (currentCat) {
        if (currentCat.parent) {
          // Assigned category is a child
          setSelectedParentId(String(currentCat.parent));
          setSelectedChildId(String(currentCat.id));
        } else {
          // Assigned category is a main category
          setSelectedParentId(String(currentCat.id));
          setSelectedChildId('');
        }
      }
    }
  }, [formData.category, categories, selectedParentId]);

  const handleParentChange = e => {
    const val = e.target.value;
    setSelectedParentId(val);
    setSelectedChildId(''); // Reset child on parent change

    // Immediately update parent state: send Parent ID to database
    handleInputChange({ target: { name: 'category', value: val } });
  };

  const handleChildChange = e => {
    const val = e.target.value;
    setSelectedChildId(val);

    // If a child is selected, send its ID; if cleared, revert to Parent ID
    const finalId = val || selectedParentId;
    handleInputChange({ target: { name: 'category', value: finalId } });
  };

  // ── Cascading Unit Selection Logic ──────────────────────────────────
  const [selectedUnitType, setSelectedUnitType] = useState('');

  const unitTypes = useMemo(() => {
    if (!units?.results) return [];
    return [...new Set(units.results.map(u => u.unit_type))].sort();
  }, [units]);

  const filteredUnits = useMemo(() => {
    if (!units?.results || !selectedUnitType) return [];
    return units.results.filter(u => u.unit_type === selectedUnitType);
  }, [units, selectedUnitType]);

  useEffect(() => {
    if (formData.unit && units?.results && !selectedUnitType) {
      const match = units.results.find(u => u.id === Number(formData.unit));
      if (match) setSelectedUnitType(match.unit_type);
    }
  }, [formData.unit, units, selectedUnitType]);

  const handleUnitTypeChange = e => {
    const newType = e.target.value;
    setSelectedUnitType(newType);
    handleInputChange({ target: { name: 'unit', value: '' } });
  };

  const handleEditorChange = value => {
    handleInputChange({ target: { name: 'description', value: value } });
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
          <label className={labelClass}>Ingredient</label>
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
          <label className={labelClass}>Brand</label>
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

        {/* Main Category Selection */}
        <div>
          <label className={labelClass}>Main Category</label>
          <select
            value={selectedParentId}
            onChange={handleParentChange}
            required
            className={inputClass}
          >
            <option value="">Select Category</option>
            {mainCategories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Sub-Category Selection (Conditional) */}
        {selectedParentId && subCategories.length > 0 && (
          <div>
            <label className={labelClass}>Sub-Category (Optional)</label>
            <select
              value={selectedChildId}
              onChange={handleChildChange}
              className={inputClass}
            >
              <option value="">No Sub-Category (Keep as Main)</option>
              {subCategories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Packaging Type */}
        <div>
          <label className={labelClass}>Packaging Type</label>
          <select
            className={inputClass}
            value={selectedUnitType}
            onChange={handleUnitTypeChange}
          >
            <option value="">Select Type (Optional)</option>
            {unitTypes.map(type => (
              <option key={type} value={type}>
                {type.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Specific Unit Quantity */}
        <div>
          <label className={labelClass}>Unit Quantity</label>
          <select
            name="unit"
            className={`${inputClass} ${!selectedUnitType ? 'opacity-40 pointer-events-none' : ''}`}
            value={formData.unit}
            onChange={handleInputChange}
            disabled={!selectedUnitType}
          >
            <option value="">
              {selectedUnitType
                ? `Select ${selectedUnitType} Variant`
                : 'Select Type First'}
            </option>
            {filteredUnits.map(u => (
              <option key={u.id} value={u.id}>
                {u.quantity} {u.content_type.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Enterprise WYSIWYG Editor */}
      <div className="space-y-0">
        <label className={labelClass}>Product Description</label>
        <RichTextEditor
          value={formData.description}
          onChange={handleEditorChange}
          placeholder="Enter authoritative product description..."
        />
      </div>
    </div>
  );
}
