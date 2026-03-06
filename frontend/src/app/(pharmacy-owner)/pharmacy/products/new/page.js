'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiArrowLeft,
  FiPlus,
  FiImage,
  FiInfo,
  FiDollarSign,
  FiLayers,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import { usePharmacyProducts } from '../../../hooks/usePharmacyProducts';

export default function AddProductPage() {
  const router = useRouter();
  const { createProduct, isUpdating, error, brands, categories, ingredients } =
    usePharmacyProducts();

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    ingredient: '',
    category: '',
    brand: '',
    price: '',
    original_price: '',
    quantity_in_stock: '',
    low_stock_threshold: '10',
    description: '',
    requires_prescription: false,
    is_active: true,
  });

  const [productImages, setProductImages] = useState([]);

  const handleImageChange = e => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substring(2, 9),
      }));
      setProductImages(prev => [...prev, ...newImages]);
    }
    e.target.value = '';
  };

  const removeImage = id => {
    setProductImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData();

    Object.keys(formData).forEach(key => {
      const value = formData[key];
      if (value !== '' && value !== null && value !== undefined) {
        data.append(key, value);
      }
    });

    productImages.forEach(img => {
      data.append('images', img.file);
    });

    const success = await createProduct(data);
    if (success) {
      router.push('/pharmacy/products');
    }
  };

  const sectionTitleClass =
    'text-xs font-black text-(--color-admin-primary) uppercase tracking-[0.2em] mb-8 flex items-center gap-3 border-b border-(--color-admin-border) pb-4';
  const cardClass =
    'bg-(--color-admin-card) border border-(--color-admin-border) p-6 sm:p-8 rounded-none';
  const labelClass =
    'font-mono text-[11px] font-bold text-(--color-text-secondary) uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-12 px-4 bg-white border border-(--color-admin-border) rounded-none text-sm font-mono focus:outline-none focus:border-(--color-admin-accent) transition-all uppercase placeholder:text-gray-300';
  const selectClass =
    'w-full h-12 px-4 bg-white border border-(--color-admin-border) rounded-none text-sm font-mono focus:outline-none focus:border-(--color-admin-accent) transition-all appearance-none cursor-pointer uppercase';

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20 bg-(--color-admin-bg)">
      {/* Header */}
      <div className="flex items-center gap-6 border-b-4 border-(--color-admin-border) pb-6">
        <Link
          href="/pharmacy/products"
          className="p-2 bg-(--color-admin-navy) text-white hover:bg-(--color-admin-accent) transition-colors rounded-none"
        >
          <FiArrowLeft size={20} />
        </Link>
        <div>
          <span className="font-mono text-xs font-bold text-(--color-admin-primary) uppercase tracking-widest">
            Inventory / Action / Create
          </span>
          <h1 className="text-4xl font-black text-(--color-admin-navy) tracking-tighter uppercase">
            Add New Product
          </h1>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-10"
      >
        <div className="lg:col-span-2 space-y-10">
          {/* Basic Information */}
          <div className={cardClass}>
            <h3 className={sectionTitleClass}>
              <FiInfo /> BASIC_INFORMATION_LOG
            </h3>
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Product_Name</label>
                <input
                  className={inputClass}
                  placeholder="E.G. NAPA_EXTEND_500MG"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className={labelClass}>Category_ID</label>
                  <div className="relative">
                    <select
                      className={selectClass}
                      value={formData.category}
                      onChange={e =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      required
                    >
                      <option value="">SELECT_CATEGORY</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Brand_ID</label>
                  <div className="relative">
                    <select
                      className={selectClass}
                      value={formData.brand}
                      onChange={e =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                      required
                    >
                      <option value="">SELECT_BRAND</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Generic_Ingredient (Optional)
                </label>
                <select
                  className={selectClass}
                  value={formData.ingredient}
                  onChange={e =>
                    setFormData({ ...formData, ingredient: e.target.value })
                  }
                >
                  <option value="">SELECT_INGREDIENT</option>
                  {ingredients.map(ing => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Technical_Description</label>
                <textarea
                  className="w-full min-h-[150px] p-4 bg-white border border-(--color-admin-border) rounded-none text-sm font-mono focus:outline-none focus:border-(--color-admin-accent) transition-all resize-none uppercase"
                  placeholder="ENTER_DETAILED_SPECIFICATIONS..."
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className={cardClass}>
            <h3 className={sectionTitleClass}>
              <FiDollarSign /> PRICING_&_INVENTORY_METRICS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className={labelClass}>Selling_Price (৳)</label>
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  placeholder="0.00"
                  value={formData.price}
                  onChange={e =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className={labelClass}>MRP_Price (৳)</label>
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  placeholder="0.00"
                  value={formData.original_price}
                  onChange={e =>
                    setFormData({ ...formData, original_price: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Current_Stock_Units</label>
                <input
                  type="number"
                  className={inputClass}
                  placeholder="0"
                  value={formData.quantity_in_stock}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      quantity_in_stock: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Low_Stock_Threshold</label>
                <input
                  type="number"
                  className={inputClass}
                  placeholder="10"
                  value={formData.low_stock_threshold}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      low_stock_threshold: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {/* Media Upload */}
          <div className={cardClass}>
            <h3 className={sectionTitleClass}>
              <FiImage /> MEDIA_ASSETS
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {productImages.map((img, index) => (
                <div
                  key={img.id}
                  className="relative aspect-square border border-(--color-admin-border) bg-white overflow-hidden group"
                >
                  <img
                    src={img.preview}
                    alt={`Preview ${index}`}
                    className="w-full h-full object-contain p-2 mix-blend-multiply"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-0 right-0 w-8 h-8 bg-(--color-admin-error) text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <FiX size={16} />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 py-1 bg-(--color-admin-navy) text-white text-[8px] font-black uppercase text-center tracking-widest">
                      PRIMARY_IMAGE
                    </div>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="aspect-square border-2 border-dashed border-(--color-admin-border) bg-white flex flex-col items-center justify-center gap-3 hover:bg-(--color-admin-accent) hover:text-white transition-all duration-300 cursor-pointer group"
              >
                <FiPlus
                  size={24}
                  className="text-(--color-admin-primary) group-hover:text-white"
                />
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest">
                  UPLOAD_FILE
                </span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
          </div>

          {/* System Settings */}
          <div className={cardClass}>
            <h3 className={sectionTitleClass}>
              <FiLayers /> SYSTEM_FLAGS
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 border border-(--color-admin-border) bg-white cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="font-mono text-[11px] font-bold text-(--color-admin-navy) uppercase">
                  Prescription_Required
                </span>
                <input
                  type="checkbox"
                  className="w-5 h-5 border-(--color-admin-border) accent-(--color-admin-primary)"
                  checked={formData.requires_prescription}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      requires_prescription: e.target.checked,
                    })
                  }
                />
              </label>
              <label className="flex items-center justify-between p-4 border border-(--color-admin-border) bg-white cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="font-mono text-[11px] font-bold text-(--color-admin-navy) uppercase">
                  Operational_Status
                </span>
                <input
                  type="checkbox"
                  className="w-5 h-5 border-(--color-admin-border) accent-(--color-admin-primary)"
                  checked={formData.is_active}
                  onChange={e =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                />
              </label>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full h-20 bg-(--color-admin-primary) text-white font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-(--color-admin-accent) transition-all duration-300 cursor-pointer disabled:opacity-50 border border-(--color-admin-border)"
            >
              {isUpdating ? (
                <span className="animate-pulse">PROCESSING_REQUEST...</span>
              ) : (
                <>
                  <FiCheck size={24} />
                  <span>Commit_to_Database</span>
                </>
              )}
            </button>
            {error && (
              <div className="mt-6 p-4 border border-(--color-admin-error) bg-red-50 text-(--color-admin-error) font-mono text-[10px] font-bold uppercase text-center">
                CRITICAL_ERROR: {error}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
