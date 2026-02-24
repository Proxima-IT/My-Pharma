'use client';

import React, { useState } from 'react';
import Image from 'next/image';

/**
 * ProductImageViewer Component
 * Handles the display of the main product image and a clickable gallery of thumbnails.
 *
 * @param {string[]} images - Array of image URLs
 */
export default function ProductImageViewer({ images = [] }) {
  // Fallback to a placeholder if no images are provided
  const displayImages =
    images.length > 0 ? images : ['/assets/images/placeholder.png'];
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700">
      {/* 1. Main Image Display Container */}
      <div className="w-full aspect-square bg-white border border-gray-100 rounded-[32px] flex items-center justify-center p-8 sm:p-12 overflow-hidden relative">
        <div className="relative w-full h-full">
          <Image
            src={displayImages[activeIdx]}
            alt="Product Main View"
            fill
            className="object-contain mix-blend-multiply transition-all duration-500 ease-in-out"
            priority
          />
        </div>
      </div>

      {/* 2. Thumbnails Gallery - flex-1 without max-width ensures it matches main container width exactly */}
      <div className="flex w-full gap-4">
        {displayImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={`relative flex-1 aspect-square bg-white rounded-[20px] flex items-center justify-center p-2 cursor-pointer transition-all border-2 overflow-hidden ${
              activeIdx === idx
                ? 'border-(--success-500)'
                : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className="relative w-full h-full">
              <Image
                src={img}
                alt={`Product thumbnail ${idx + 1}`}
                fill
                className="object-contain mix-blend-multiply"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
