'use client';
import React, { useState, useRef } from 'react';
import { FiImage } from 'react-icons/fi';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';

/**
 * CategoryForm Component
 * Updated to support multipart/form-data for category image uploads.
 * Maintains strictly sharp industrial design as per current state.
 */
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

    // Construct FormData for multipart submission (required for file uploads)
    const data = new FormData();
    data.append('name', formData.name);

    // Handle optional parent ID
    if (formData.parent !== '') {
      data.append('parent', formData.parent);
    }

    data.append('is_active', formData.is_active);

    // Only append image if a new file has been selected
    if (formData.image) {
      data.append('image', formData.image);
    }

    await onSubmit(data);
  };

  const labelClass =
    'font-mono text-[11px] font-bold text-[#8A8A78] uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-12 px-4 bg-[#FAF7F2] border border-[#DAD7CD] rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase placeholder:text-[#B7B7A4] text-[#1B1B1B]';
  const selectClass =
    'w-full h-12 px-4 bg-[#FAF7F2] border border-[#DAD7CD] rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase text-[#1B1B1B] cursor-pointer';

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Name and Parent Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className={labelClass}>Category Name / Type</label>
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
          <label className={labelClass}>Parent Category (Optional)</label>
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
          className="aspect-square max-w-[200px] border-2 border-dashed border-[#DAD7CD] bg-[#FAF7F2] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#E8F0EA] hover:border-[#3A5A40] transition-all group overflow-hidden relative rounded-none"
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
                className="text-[#8A8A78] group-hover:text-[#3A5A40]"
              />
              <span className="text-[10px] font-bold text-[#8A8A78] uppercase tracking-widest">
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
        <p className="text-[10px] text-[#B7B7A4] font-medium uppercase">
          Click to {initialData ? 'change' : 'upload'} icon. Recommended size:
          64x64px (PNG/SVG).
        </p>
      </div>

      {/* Status Toggle */}
      <div className="flex items-center justify-between p-6 bg-[#FAF7F2] border border-[#DAD7CD]">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[13px] font-bold text-[#1B1B1B] uppercase">
            Active Status
          </span>
          <span className="font-mono text-[10px] text-[#8A8A78] uppercase">
            Visible to customers in the public store?
          </span>
        </div>
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={e =>
            setFormData({ ...formData, is_active: e.target.checked })
          }
          className="w-8 h-8 border-[#DAD7CD] accent-[#3A5A40] cursor-pointer"
        />
      </div>

      {/* Submit Button Section */}
      <div className="pt-6 border-t border-[#DAD7CD]">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-16 bg-[#3A5A40] text-white font-mono text-xs font-bold uppercase tracking-[0.2em] hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-transparent rounded-none flex items-center justify-center gap-3"
        >
          {isLoading ? 'SAVING_CHANGES...' : <>SAVE CATEGORY DATA</>}
        </button>
      </div>
    </form>
  );
}
