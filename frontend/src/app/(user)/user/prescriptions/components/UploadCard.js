'use client';
import React, { useRef } from 'react';
import { FiPlus } from 'react-icons/fi';

export default function UploadCard({ onUpload, isLoading }) {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    if (!isLoading) fileInputRef.current.click();
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) onUpload(file);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative cursor-pointer aspect-[4/3] rounded-2xl border-2 border-dashed 
        transition-all duration-300 flex flex-col items-center justify-center gap-3
        bg-green-50/30 border-green-200
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-green-500 hover:bg-green-50/50'}
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,.pdf"
        onChange={handleFileChange}
      />

      {/* Multi-layered Shaded Icon Effect */}
      <div className="relative flex items-center justify-center w-16 h-16">
        {/* Layer 1: Outer Glow */}
        <div className="absolute inset-0 rounded-full bg-green-100 opacity-40" />
        {/* Layer 2: Middle Shade */}
        <div className="absolute inset-2 rounded-full border border-green-200 bg-green-50/50" />
        {/* Layer 3: Inner Border */}
        <div className="absolute inset-4 rounded-full border border-green-300" />
        {/* Layer 4: Center Icon Circle */}
        <div className="relative w-7 h-7 bg-white rounded-full flex items-center justify-center">
          <FiPlus className="text-green-600" size={18} strokeWidth={3} />
        </div>
      </div>

      <div className="text-center space-y-0.5">
        <p className="text-sm font-bold text-green-600">Click to upload</p>
        <p className="text-xs font-medium text-gray-400">or drag and drop</p>
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-2xl">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
