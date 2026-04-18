'use client';
import React, { useState, useEffect, useRef } from 'react';
import { FiImage } from 'react-icons/fi';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';

const CategoryForm = ({ initialData, categoryTree, onSubmit, isLoading }) => {
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    parent: '',
    is_active: true,
    image: null,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        parent: initialData.parent || '',
        is_active: initialData.is_active ?? true,
        image: null,
      });
      if (initialData.image) {
        setPreviewImage(getMediaUrl(initialData.image));
      }
    }
  }, [initialData]);

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = e => {
    e.preventDefault();

    // Create FormData for multipart submission (required for images)
    const data = new FormData();
    data.append('name', formData.name);
    data.append('is_active', formData.is_active);

    if (formData.parent !== '' && formData.parent !== null) {
      data.append('parent', formData.parent);
    }

    if (formData.image) {
      data.append('image', formData.image);
    }

    onSubmit(data);
  };

  const renderOptions = (nodes, depth = 0) => {
    if (!nodes || !Array.isArray(nodes)) return null;
    return nodes.map(node => (
      <React.Fragment key={node.id}>
        <option value={node.id}>
          {'\u00A0'.repeat(depth * 4)}
          {depth > 0 ? '↳ ' : ''}
          {node.name.toUpperCase()}
        </option>
        {node.children && renderOptions(node.children, depth + 1)}
      </React.Fragment>
    ));
  };

  const labelClass =
    'font-mono text-[11px] font-bold text-(--color-text-secondary) uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-12 px-4 bg-white border border-(--color-admin-border) rounded-none text-sm font-mono focus:outline-none focus:border-(--color-admin-accent) transition-all uppercase';

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col gap-10 items-stretch"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Category Name */}
        <div>
          <label className={labelClass}>CATEGORY NAME / TYPE</label>
          <input
            type="text"
            placeholder="E.G. TABLETS OR SYRUP"
            className={inputClass}
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        {/* Parent Selection */}
        <div>
          <label className={labelClass}>UNDER WHICH CATEGORY? (OPTIONAL)</label>
          <select
            value={formData.parent}
            onChange={e => setFormData({ ...formData, parent: e.target.value })}
            className={inputClass + ' cursor-pointer appearance-none'}
          >
            <option value="">NONE (THIS IS A MAIN CATEGORY)</option>
            {renderOptions(categoryTree)}
          </select>
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="space-y-4">
        <label className={labelClass}>CATEGORY ICON / IMAGE</label>
        <div
          onClick={() => fileInputRef.current.click()}
          className="aspect-square max-w-[200px] border-2 border-dashed border-(--color-admin-border) bg-white flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 transition-all group overflow-hidden relative rounded-none shadow-none"
        >
          {previewImage ? (
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-full object-contain p-4"
            />
          ) : (
            <>
              <FiImage
                size={32}
                className="text-gray-300 group-hover:text-(--color-admin-primary)"
              />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                UPLOAD ICON
              </span>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleImageChange}
        />
        <p className="text-[10px] text-(--color-text-secondary) font-medium uppercase">
          RECOMMENDED SIZE: 64X64PX (PNG/SVG)
        </p>
      </div>

      {/* Status Toggle */}
      <div className="w-full flex items-center justify-between px-6 py-6 bg-white border border-(--color-admin-border) rounded-none shadow-none">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[13px] font-bold text-(--color-admin-navy) uppercase">
            SHOW IN SHOP?
          </span>
          <span className="font-mono text-[10px] text-(--color-text-secondary) uppercase">
            IF OFF, CUSTOMERS CANNOT SEE THIS CATEGORY
          </span>
        </div>
        <input
          type="checkbox"
          className="w-8 h-8 border-2 border-(--color-admin-border) rounded-none bg-white accent-(--color-admin-primary) cursor-pointer"
          checked={formData.is_active}
          onChange={e =>
            setFormData({ ...formData, is_active: e.target.checked })
          }
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-16 bg-(--color-admin-primary) text-white font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-(--color-admin-accent) transition-all duration-300 cursor-pointer border border-(--color-admin-border) rounded-none shadow-none disabled:opacity-50"
      >
        {isLoading ? (
          <span className="animate-pulse font-mono">SAVING...</span>
        ) : (
          <span className="font-mono">
            {initialData ? 'SAVE CHANGES' : 'CREATE CATEGORY'}
          </span>
        )}
      </button>
    </form>
  );
};

export default CategoryForm;
