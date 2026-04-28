'use client';
import React, { useRef } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';

// Tailwind style constants
const labelClass =
  'block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3';

export default function AssetsTab({
  mainImage,
  setMainImage,
  galleryImages,
  setGalleryImages,
}) {
  const mainImageRef = useRef(null);
  const galleryRef = useRef(null);

  const handleMainImage = e => {
    const file = e.target.files[0];
    if (file) setMainImage({ file, preview: URL.createObjectURL(file) });
  };

  const handleGalleryImages = e => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setGalleryImages(prev => [...prev, ...newPreviews]);
  };

  const removeGalleryImage = index => {
    setGalleryImages(galleryImages.filter((_, idx) => idx !== index));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 animate-in slide-in-from-left-2">
      <div className="space-y-6">
        <label className={labelClass}>Primary Product Photo</label>
        <div
          onClick={() => mainImageRef.current.click()}
          className="aspect-square border-4 border-dashed border-gray-100 flex items-center justify-center cursor-pointer hover:border-black transition-all bg-gray-50 relative overflow-hidden"
        >
          {mainImage ? (
            <img
              src={mainImage.preview}
              alt="Primary product preview"
              className="w-full h-full object-contain"
            />
          ) : (
            <FiPlus size={48} className="text-gray-200" />
          )}
        </div>
        <input
          ref={mainImageRef}
          type="file"
          className="hidden"
          onChange={handleMainImage}
        />
      </div>
      <div className="space-y-6">
        <label className={labelClass}>Product Gallery (Multiple)</label>
        <div className="grid grid-cols-3 gap-4">
          {galleryImages.map((img, i) => (
            <div
              key={i}
              className="aspect-square border border-gray-100 relative group"
            >
              <img
                src={img.preview}
                alt={`Gallery image ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeGalleryImage(i)}
                className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
              >
                <FiX size={24} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => galleryRef.current.click()}
            className="aspect-square border-4 border-dashed border-gray-100 flex items-center justify-center text-gray-200 hover:text-black transition-all"
          >
            <FiPlus size={32} />
          </button>
        </div>
        <input
          ref={galleryRef}
          type="file"
          className="hidden"
          multiple
          onChange={handleGalleryImages}
        />
      </div>
    </div>
  );
}
