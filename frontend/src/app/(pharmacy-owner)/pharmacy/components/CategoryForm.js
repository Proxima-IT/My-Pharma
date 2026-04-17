'use client';
import React, { useState, useRef } from 'react';
import { FiImage } from 'react-icons/fi';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';

export default function CategoryForm({
  onSubmit,
  isLoading,
  categoryTree,
  initialData = null,
}) {
  const imageInputRef = useRef(null);

  const [previewImage, setPreviewImage] = useState(
    initialData?.image ? getMediaUrl(initialData.image) : null,
  );
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    parent: initialData?.parent || '',
    is_active: initialData?.is_active ?? true,
    image: null,
  });

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
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

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      ...formData,
      parent: formData.parent === '' ? null : parseInt(formData.parent),
    };
    await onSubmit(payload);
  };

  const labelClass =
    'font-mono text-[11px] font-bold text-(--color-admin-primary) uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-12 px-4 bg-(--color-admin-card) border border-(--color-admin-border) rounded-none text-sm font-mono focus:outline-none focus:border-(--color-admin-accent) transition-all uppercase placeholder:text-(--color-text-secondary)';
  const selectClass =
    'w-full h-12 px-4 bg-(--color-admin-card) border border-(--color-admin-border) rounded-none text-sm font-mono focus:outline-none focus:border-(--color-admin-accent) transition-all uppercase';

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Name Field */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Category Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className={inputClass}
            placeholder="Enter category name"
            required
          />
        </div>

        <div>
          <label className={labelClass}>Parent Category</label>
          <select
            value={formData.parent}
            onChange={e => setFormData({ ...formData, parent: e.target.value })}
            className={selectClass}
          >
            <option value="">No Parent (Root Category)</option>
            {renderOptions(categoryTree)}
          </select>
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="space-y-4">
        <label className={labelClass}>Category Icon / Image</label>
        <div
          onClick={() => imageInputRef.current.click()}
          className="aspect-square max-w-[200px] border-2 border-dashed border-(--color-admin-border) bg-(--color-admin-bg) flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-(--color-admin-accent) hover:border-(--color-admin-navy) transition-all group overflow-hidden relative rounded-none"
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
                className="text-(--color-admin-primary) group-hover:text-(--color-admin-navy)"
              />
              <span className="text-[10px] font-bold text-(--color-admin-primary) uppercase tracking-widest">
                {initialData ? 'Change Icon' : 'Upload Icon'}
              </span>
            </>
          )}
        </div>
        <input
          ref={imageInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleImageChange}
        />
        <p className="text-[10px] text-(--color-text-secondary) font-medium uppercase">
          Click to {initialData ? 'change' : 'upload'} icon. Recommended size:
          64x64px (PNG/SVG).
        </p>
      </div>

      {/* Status Toggle */}
      <div className="flex items-center gap-4">
        <label className={labelClass}>Status</label>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={e =>
              setFormData({ ...formData, is_active: e.target.checked })
            }
            className="w-4 h-4 text-(--color-admin-accent) bg-(--color-admin-card) border-(--color-admin-border) rounded focus:ring-(--color-admin-accent) focus:ring-2"
          />
          <label
            htmlFor="is_active"
            className="font-mono text-[11px] font-bold text-(--color-admin-primary) uppercase tracking-widest cursor-pointer"
          >
            Active
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-6 border-t border-(--color-admin-border)">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full md:w-auto px-8 py-3 bg-(--color-admin-navy) text-white font-mono text-[11px] font-bold uppercase tracking-widest hover:bg-(--color-admin-accent) transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-(--color-admin-border)"
        >
          {isLoading
            ? 'Saving...'
            : initialData
              ? 'Update Category'
              : 'Create Category'}
        </button>
      </div>
    </form>
  );
}
