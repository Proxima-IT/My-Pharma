'use client';
import React, { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiArrowLeft,
  FiImage,
  FiCheck,
  FiX,
  FiBox,
  FiPlus,
} from 'react-icons/fi';
import { useProductAdmin } from '@/app/(admin)/hooks/useProductAdmin';
import { useBrands } from '@/app/(pharmacy-owner)/hooks/useBrands';
import { useCategories } from '@/app/(pharmacy-owner)/hooks/useCategories';
import { useIngredientAdmin } from '@/app/(admin)/hooks/useIngredientAdmin';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';
import { productAdminApi } from '@/app/(admin)/api/productAdminApi';

export default function AdminEditProductPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const {
    productDetails,
    fetchProductBySlug,
    updateProduct,
    isUpdating,
    loading: productLoading,
    error,
  } = useProductAdmin();
  const { brands, getBrands } = useBrands();
  const { categories, getCategories } = useCategories();
  const { ingredients, fetchIngredients } = useIngredientAdmin();

  const mainImageRef = useRef(null);
  const galleryRef = useRef(null);

  const [newMainImage, setNewMainImage] = useState(null);
  const [newGalleryImages, setNewGalleryImages] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    ingredient: '',
    dosages: '', // New Field: Comma separated string for UI
    price: '',
    original_price: '',
    quantity_in_stock: '',
    low_stock_threshold: '',
    description: '',
    requires_prescription: false,
    is_active: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    getBrands(token);
    getCategories(token);
    fetchIngredients({ page_size: 100 });
    if (slug) fetchProductBySlug(slug);
  }, [slug, getBrands, getCategories, fetchIngredients, fetchProductBySlug]);

  useEffect(() => {
    if (productDetails) {
      setFormData({
        name: productDetails.name || '',
        category: productDetails.category || '',
        brand: productDetails.brand || '',
        ingredient: productDetails.ingredient || '',
        // Convert Array ["6mg", "12mg"] -> String "6mg, 12mg"
        dosages: Array.isArray(productDetails.dosages)
          ? productDetails.dosages.join(', ')
          : productDetails.dosages || '',
        price: productDetails.price || '',
        original_price: productDetails.original_price || '',
        quantity_in_stock: productDetails.quantity_in_stock || '',
        low_stock_threshold: productDetails.low_stock_threshold || '10',
        description: productDetails.description || '',
        requires_prescription: productDetails.requires_prescription || false,
        is_active: productDetails.is_active || true,
      });
      setExistingGallery(productDetails.images_data || []);
    }
  }, [productDetails]);

  const handleMainImage = e => {
    const file = e.target.files[0];
    if (file) setNewMainImage({ file, preview: URL.createObjectURL(file) });
  };

  const handleNewGalleryImages = e => {
    const files = Array.from(e.target.files);
    const previews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewGalleryImages(prev => [...prev, ...previews]);
  };

  const removeNewGalleryImage = index => {
    setNewGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const deleteExistingImage = async imagePk => {
    if (confirm('Are you sure you want to delete this image?')) {
      const token = localStorage.getItem('access_token');
      const ok = await productAdminApi.deleteGalleryImage(token, slug, imagePk);
      if (ok)
        setExistingGallery(prev => prev.filter(img => img.id !== imagePk));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData();

    Object.keys(formData).forEach(key => {
      if (key === 'dosages') {
        // Convert "6mg, 12mg" -> ["6mg", "12mg"] for API
        const dosageArray = formData.dosages
          .split(',')
          .map(d => d.trim())
          .filter(d => d !== '');

        dosageArray.forEach(val => data.append('dosages', val));
      } else if (formData[key] !== '' && formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    if (newMainImage?.file) data.append('image', newMainImage.file);

    const success = await updateProduct(slug, data);

    if (success && newGalleryImages.length > 0) {
      const token = localStorage.getItem('access_token');
      for (const img of newGalleryImages) {
        await productAdminApi.uploadGalleryImage(token, slug, img.file);
      }
    }

    if (success) router.push('/admin/products');
  };

  if (productLoading && !productDetails) {
    return (
      <div className="py-40 text-center font-mono animate-pulse">
        LOADING_DATA...
      </div>
    );
  }

  const labelClass =
    'font-mono text-[11px] font-bold text-[#8A8A78] uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-12 px-4 bg-white border border-gray-200 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase';

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col items-start gap-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-3 bg-[#3A5A40] text-white px-6 py-3 hover:bg-[#F59E0B] transition-all cursor-pointer border border-transparent"
        >
          <FiArrowLeft size={16} />{' '}
          <span className="font-mono text-[11px] font-bold uppercase">
            Go Back
          </span>
        </button>
        <h1 className="text-4xl font-black text-[#1B1B1B] tracking-tighter uppercase leading-none">
          Edit Medicine
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-10"
      >
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-gray-100 p-8">
            <h3 className="font-mono text-xs font-bold text-[#1B1B1B] uppercase tracking-widest border-b border-gray-50 pb-4 mb-6">
              General Info
            </h3>
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Medicine Name</label>
                <input
                  className={inputClass}
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Generic Name (Ingredient)</label>
                <select
                  className={inputClass}
                  value={formData.ingredient}
                  onChange={e =>
                    setFormData({ ...formData, ingredient: e.target.value })
                  }
                >
                  <option value="">Select Generic</option>
                  {(Array.isArray(ingredients)
                    ? ingredients
                    : ingredients?.results || []
                  ).map(ing => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dosages Field */}
              <div>
                <label className={labelClass}>
                  Available Dosages (Comma Separated)
                </label>
                <input
                  className={inputClass}
                  placeholder="E.G. 6MG, 12MG, 24MG"
                  value={formData.dosages}
                  onChange={e =>
                    setFormData({ ...formData, dosages: e.target.value })
                  }
                />
                <p className="text-[10px] text-[#8A8A78] mt-2 uppercase">
                  Separate multiple dosages with a comma (,)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Group</label>
                  <select
                    className={inputClass}
                    value={formData.category}
                    onChange={e =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Group</option>
                    {(Array.isArray(categories)
                      ? categories
                      : categories?.results || []
                    ).map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Company</label>
                  <select
                    className={inputClass}
                    value={formData.brand}
                    onChange={e =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Company</option>
                    {(Array.isArray(brands)
                      ? brands
                      : brands?.results || []
                    ).map(brand => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  className="w-full min-h-[120px] p-4 bg-white border border-gray-200 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all resize-none uppercase"
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-8">
            <h3 className="font-mono text-xs font-bold text-[#1B1B1B] uppercase tracking-widest border-b border-gray-50 pb-4 mb-6">
              Price & Stock
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Price (৳)</label>
                <input
                  type="number"
                  className={inputClass}
                  value={formData.price}
                  onChange={e =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className={labelClass}>MRP (৳)</label>
                <input
                  type="number"
                  className={inputClass}
                  value={formData.original_price}
                  onChange={e =>
                    setFormData({ ...formData, original_price: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Stock</label>
                <input
                  type="number"
                  className={inputClass}
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
                <label className={labelClass}>Low Stock Alert</label>
                <input
                  type="number"
                  className={inputClass}
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

        <div className="space-y-8">
          <div className="bg-white border border-gray-100 p-8">
            <h3 className={labelClass}>Main Photo</h3>
            <div
              onClick={() => mainImageRef.current.click()}
              className="aspect-square border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-[#E8F0EA] transition-all overflow-hidden"
            >
              {newMainImage ? (
                <img
                  src={newMainImage.preview}
                  className="w-full h-full object-contain p-2"
                />
              ) : productDetails?.image ? (
                <img
                  src={getMediaUrl(productDetails.image)}
                  className="w-full h-full object-contain p-2 mix-blend-multiply"
                />
              ) : (
                <FiBox size={32} className="text-gray-300" />
              )}
            </div>
            <input
              ref={mainImageRef}
              type="file"
              className="hidden"
              onChange={handleMainImage}
            />
          </div>

          <div className="bg-white border border-gray-100 p-8">
            <h3 className={labelClass}>Gallery Photos</h3>
            <div className="grid grid-cols-3 gap-2">
              {existingGallery.map(img => (
                <div
                  key={img.id}
                  className="relative aspect-square border border-gray-200 bg-white"
                >
                  <img
                    src={getMediaUrl(img.image)}
                    className="w-full h-full object-contain p-1"
                  />
                  <button
                    type="button"
                    onClick={() => deleteExistingImage(img.id)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5"
                  >
                    <FiX size={10} />
                  </button>
                </div>
              ))}
              {newGalleryImages.map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square border border-[#3A5A40] bg-[#E8F0EA]"
                >
                  <img
                    src={img.preview}
                    className="w-full h-full object-contain p-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewGalleryImage(i)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5"
                  >
                    <FiX size={10} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => galleryRef.current.click()}
                className="aspect-square border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:text-[#3A5A40] hover:border-[#3A5A40] transition-all"
              >
                <FiPlus size={20} />
              </button>
            </div>
            <input
              ref={galleryRef}
              type="file"
              className="hidden"
              multiple
              onChange={handleNewGalleryImages}
            />
          </div>

          <div className="bg-white border border-gray-100 p-8 space-y-4">
            <h3 className={labelClass}>Settings</h3>
            <label className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 cursor-pointer">
              <span className="text-[11px] font-bold text-[#1B1B1B] uppercase">
                Need Prescription?
              </span>
              <input
                type="checkbox"
                className="w-6 h-6 accent-[#3A5A40]"
                checked={formData.requires_prescription}
                onChange={e =>
                  setFormData({
                    ...formData,
                    requires_prescription: e.target.checked,
                  })
                }
              />
            </label>
            <label className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 cursor-pointer">
              <span className="text-[11px] font-bold text-[#1B1B1B] uppercase">
                Active Status
              </span>
              <input
                type="checkbox"
                className="w-6 h-6 accent-[#3A5A40]"
                checked={formData.is_active}
                onChange={e =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full h-20 bg-[#3A5A40] text-white font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-[#F59E0B] transition-all disabled:opacity-50"
          >
            {isUpdating ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </div>
      </form>
    </div>
  );
}
