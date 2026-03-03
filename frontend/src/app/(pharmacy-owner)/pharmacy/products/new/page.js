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
import UiInput from '@/app/(public)/components/UiInput';
import UiButton from '@/app/(public)/components/UiButton';
import { usePharmacyProducts } from '../../../hooks/usePharmacyProducts';

export default function AddProductPage() {
  const router = useRouter();
  const { createProduct, isUpdating, error, brands, categories, ingredients } =
    usePharmacyProducts();

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    ingredient: '', // Generic Name ID
    category: '', // Category ID
    brand: '', // Brand ID
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
    'text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2';
  const cardClass = 'bg-white border border-gray-100 rounded-[32px] p-6 sm:p-8';
  const selectClass =
    'w-full h-[56px] px-6 bg-gray-50 border border-gray-100 rounded-full text-sm outline-none focus:border-(--color-primary-500) transition-all appearance-none cursor-pointer';

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center gap-4">
        <Link
          href="/pharmacy/products"
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Add New Product
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 space-y-8">
          <div className={cardClass}>
            <h3 className={sectionTitleClass}>
              <FiInfo /> Basic Information
            </h3>
            <div className="space-y-6">
              <UiInput
                label="Product Name"
                placeholder="e.g. Napa Extend"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-gray-600 ml-5 uppercase">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      className={selectClass}
                      value={formData.category}
                      onChange={e =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-gray-600 ml-5 uppercase">
                    Brand
                  </label>
                  <div className="relative">
                    <select
                      className={selectClass}
                      value={formData.brand}
                      onChange={e =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Brand</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Generic Name (Ingredient) - Now Optional */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-gray-600 ml-5 uppercase">
                  Generic Name (Ingredient) - Optional
                </label>
                <div className="relative">
                  <select
                    className={selectClass}
                    value={formData.ingredient}
                    onChange={e =>
                      setFormData({ ...formData, ingredient: e.target.value })
                    }
                  >
                    <option value="">Select Ingredient</option>
                    {ingredients.map(ing => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-gray-600 ml-5 uppercase">
                  Description
                </label>
                <textarea
                  className="w-full min-h-[120px] p-6 bg-gray-50 border border-gray-100 rounded-[24px] text-sm outline-none focus:border-(--color-primary-500) transition-all resize-none"
                  placeholder="Enter detailed product description..."
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <h3 className={sectionTitleClass}>
              <FiDollarSign /> Pricing & Inventory
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UiInput
                label="Selling Price (৳)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={e =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
              />
              <UiInput
                label="Original Price / MRP (৳)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.original_price}
                onChange={e =>
                  setFormData({ ...formData, original_price: e.target.value })
                }
              />
              <UiInput
                label="Current Stock"
                type="number"
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
              <UiInput
                label="Low Stock Alert Level"
                type="number"
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

        <div className="space-y-8">
          <div className={cardClass}>
            <h3 className={sectionTitleClass}>
              <FiImage /> Product Images
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {productImages.map((img, index) => (
                <div
                  key={img.id}
                  className="relative aspect-square rounded-[20px] border border-gray-100 bg-gray-50 overflow-hidden group"
                >
                  <img
                    src={img.preview}
                    alt={`Preview ${index}`}
                    className="w-full h-full object-contain p-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white border border-gray-100 flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                  >
                    <FiX size={14} />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-(--color-primary-500) text-white text-[8px] font-black uppercase rounded-full">
                      Main
                    </div>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="aspect-square rounded-[20px] border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 hover:bg-gray-100 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 group-hover:text-(--color-primary-500) transition-colors">
                  <FiPlus size={20} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Add Photo
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
            <p className="text-[10px] text-gray-400 mt-4 font-medium text-center">
              You can upload multiple images. The first image will be used as
              the primary thumbnail.
            </p>
          </div>

          <div className={cardClass}>
            <h3 className={sectionTitleClass}>
              <FiLayers /> Settings
            </h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 bg-gray-25/50 cursor-pointer group">
                <span className="text-sm font-bold text-gray-700">
                  Requires Prescription
                </span>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500 accent-primary-500"
                  checked={formData.requires_prescription}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      requires_prescription: e.target.checked,
                    })
                  }
                />
              </label>
              <label className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 bg-gray-25/50 cursor-pointer group">
                <span className="text-sm font-bold text-gray-700">
                  Active Status
                </span>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500 accent-primary-500"
                  checked={formData.is_active}
                  onChange={e =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                />
              </label>
            </div>
          </div>

          <div className="pt-4">
            <UiButton
              type="submit"
              className="w-full h-16 text-lg"
              isLoading={isUpdating}
            >
              <div className="flex items-center gap-2">
                <FiCheck strokeWidth={3} />
                <span>Publish Product</span>
              </div>
            </UiButton>
            {error && (
              <p className="text-xs font-bold text-red-500 mt-4 text-center bg-red-50 p-3 rounded-xl border border-red-100">
                {error}
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
