'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiArrowLeft,
  FiSave,
  FiUpload,
  FiX,
  FiImage,
  FiPlus,
  FiBox,
  FiSearch,
} from 'react-icons/fi';
import { useComboAdmin } from '@/app/(admin)/hooks/useComboAdmin';
import { useProductAdmin } from '@/app/(admin)/hooks/useProductAdmin';
import { searchProducts } from '@/app/(public)/lib/productSearchEngine';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Super Admin - Create New Combo Page
 * Design: Sharp & Authoritative, rounded-none, border-2, high contrast.
 * Updated: Replaced External Link with Product Selection UI as per client requirement.
 */
export default function NewComboPage() {
  const router = useRouter();
  const { addCombo, isUpdating, error } = useComboAdmin();
  const { products: availableProducts, fetchProducts } = useProductAdmin();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    original_price: '',
    bg_color: '#B0E5C7',
    order: 0,
    is_active: true,
  });

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchProducts({ page_size: 2000, is_active: true });
  }, [fetchProducts]);

  useEffect(() => {
    if (searchQuery.length >= 2 && availableProducts?.results) {
      setSearchResults(
        searchProducts(availableProducts.results, searchQuery, { limit: 10 }),
      );
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, availableProducts]);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleProductSelect = product => {
    if (product && !selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts(prev => [...prev, product]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeProduct = id => {
    setSelectedProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      // Append selected product IDs for the ManyToMany relation
      selectedProducts.forEach(p => {
        data.append('product_ids', p.id);
      });

      if (imageFile) {
        data.append('image', imageFile);
      }

      await addCombo(data);
      router.push('/admin/combos');
    } catch (err) {
      console.error('Creation failed:', err);
    }
  };

  const labelClass =
    'font-mono text-[11px] font-bold text-[#8A8A78] uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-12 px-4 bg-white border border-gray-200 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase placeholder:text-gray-300 text-[#1B1B1B]';
  const textareaClass =
    'w-full p-4 bg-white border border-gray-200 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase placeholder:text-gray-300 text-[#1B1B1B] min-h-[120px]';

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 text-black">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/combos"
            className="p-2 hover:bg-gray-50 text-[#8A8A78] transition-colors border border-transparent hover:border-gray-100"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-[#1B1B1B] tracking-tighter uppercase leading-none">
              New Combo Asset
            </h1>
            <p className="text-[11px] font-mono text-[#8A8A78] mt-1 uppercase tracking-widest">
              Registering bundle to system core
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 font-mono text-xs uppercase">
          System Error:{' '}
          {typeof error === 'object' ? 'Validation Failed' : error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-10"
      >
        {/* Left Column: Primary Data */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-gray-100 p-8 space-y-6 shadow-none">
            <h3 className="font-mono text-xs font-bold text-[#1B1B1B] uppercase tracking-widest border-b border-gray-50 pb-4 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#3A5A40]"></span> General Information
            </h3>

            <div>
              <label className={labelClass}>Combo Title</label>
              <input
                required
                name="title"
                className={inputClass}
                placeholder="E.G. FAMILY HEALTH PACK"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className={labelClass}>Description / Marketing Copy</label>
              <textarea
                name="description"
                className={textareaClass}
                placeholder="DETAILED DESCRIPTION OF THE BUNDLE CONTENTS..."
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Product Selection Section */}
          <div className="bg-white border border-gray-100 p-8 space-y-6 shadow-none">
            <h3 className="font-mono text-xs font-bold text-[#1B1B1B] uppercase tracking-widest border-b border-gray-50 pb-4 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#3A5A40]"></span> Included Products
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Search Selection */}
              <div className="space-y-4">
                <label className={labelClass}>Search & Select Medicines</label>
                <div className="relative">
                  <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      className={inputClass + ' pl-12'}
                      placeholder="TYPE MEDICINE NAME..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 z-50 max-h-60 overflow-y-auto shadow-xl">
                      {searchResults.map(product => (
                        <div
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          className="p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex flex-col"
                        >
                          <span className="text-[11px] font-bold text-[#1B1B1B] uppercase">
                            {product.name}
                          </span>
                          <span className="text-[9px] font-mono text-gray-400 uppercase">
                            {product.brand_name} • {product.ingredient_name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-mono text-[#8A8A78] uppercase leading-tight">
                  Add multiple products that belong to this combo package.
                </p>
              </div>

              {/* Selected List */}
              <div className="space-y-4">
                <label className={labelClass}>
                  Selected Items ({selectedProducts.length})
                </label>
                <div className="border border-gray-100 min-h-[150px] bg-gray-50/50 p-2 space-y-2">
                  {selectedProducts.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-gray-300 gap-2">
                      <FiBox size={24} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        No Products Assigned
                      </span>
                    </div>
                  ) : (
                    selectedProducts.map(product => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between bg-white p-3 border border-gray-100 group animate-in slide-in-from-right-2"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="w-1.5 h-1.5 bg-[#3A5A40] shrink-0"></span>
                          <span className="text-[11px] font-bold text-gray-700 uppercase truncate">
                            {product.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeProduct(product.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-8 space-y-6 shadow-none">
            <h3 className="font-mono text-xs font-bold text-[#1B1B1B] uppercase tracking-widest border-b border-gray-50 pb-4 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#3A5A40]"></span> Pricing & Logic
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Sale Price (BDT)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  name="price"
                  className={inputClass}
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className={labelClass}>Original Price (BDT)</label>
                <input
                  type="number"
                  step="0.01"
                  name="original_price"
                  className={inputClass}
                  placeholder="0.00"
                  value={formData.original_price}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Container Color (Public Card)
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="bg_color"
                    className="w-12 h-12 border border-gray-200 p-1 bg-white cursor-pointer"
                    value={formData.bg_color}
                    onChange={handleInputChange}
                  />
                  <input
                    name="bg_color"
                    className={inputClass}
                    placeholder="#FFFFFF"
                    value={formData.bg_color}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Display Order</label>
                <input
                  type="number"
                  name="order"
                  className={inputClass}
                  value={formData.order}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer h-12 px-4 bg-gray-50 border border-gray-100 w-full shadow-none">
                  <input
                    type="checkbox"
                    name="is_active"
                    className="w-5 h-5 accent-[#3A5A40]"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                  <span className="font-mono text-[11px] font-bold text-[#1B1B1B] uppercase tracking-widest">
                    Visible on Site
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Media & Submission */}
        <div className="space-y-8">
          <div className="bg-white border border-gray-100 p-8 shadow-none">
            <h3 className="font-mono text-xs font-bold text-[#1B1B1B] uppercase tracking-widest border-b border-gray-50 pb-4 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#3A5A40]"></span> Media Asset
            </h3>

            <div
              onClick={() => fileInputRef.current.click()}
              className="w-full aspect-square border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 transition-all relative overflow-hidden group shadow-none"
            >
              {previewUrl ? (
                <>
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiUpload className="text-white" size={32} />
                  </div>
                </>
              ) : (
                <>
                  <FiImage size={48} className="text-gray-200 mb-4" />
                  <span className="font-mono text-[10px] text-gray-400 uppercase font-bold">
                    Select Combo Image
                  </span>
                  <span className="font-mono text-[9px] text-gray-300 uppercase mt-1">
                    1080x1080 Recommended
                  </span>
                </>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />

            {previewUrl && (
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setPreviewUrl(null);
                }}
                className="w-full mt-4 py-2 text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <FiX /> Remove Image
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full h-20 bg-[#3A5A40] text-white font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-[#1B1B1B] transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-none border-none"
          >
            {isUpdating ? (
              'INITIALIZING...'
            ) : (
              <>
                <FiPlus size={20} /> CREATE COMBO
              </>
            )}
          </button>

          <div className="p-4 bg-[#F1F1E6] border border-[#DAD7CD] font-mono text-[9px] text-[#8A8A78] uppercase leading-relaxed">
            Note: All products added to this combo will be automatically bundled
            at the specified price.
          </div>
        </div>
      </form>
    </div>
  );
}
