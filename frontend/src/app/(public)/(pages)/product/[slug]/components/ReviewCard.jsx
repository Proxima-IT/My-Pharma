'use client';

import React from 'react';
import { GoStarFill } from 'react-icons/go';
import Image from 'next/image';

/**
 * ReviewCard Component
 * Strictly matches the requested UI: Static display, no interactions, 3-slot gallery overlay.
 */
const ReviewCard = ({ review }) => {
  const images = review.images || [];
  const displayImages = images.slice(0, 3);
  const remainingCount = images.length - 2;

  return (
    <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-[32px] space-y-5">
      {/* Header: User Info & Rating */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden relative border border-gray-50 shrink-0">
            {review.user_avatar ? (
              <Image
                src={review.user_avatar}
                alt={review.user_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl uppercase">
                {review.user_name?.charAt(0) || 'U'}
              </div>
            )}
          </div>

          <div className="space-y-0.5">
            <h4 className="font-bold text-gray-900 text-lg leading-tight">
              {review.user_name || 'Anonymous User'}
            </h4>
            <p className="text-sm text-gray-500 font-medium lowercase first-letter:uppercase">
              {review.location || 'Verified Customer'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <GoStarFill className="text-[#FFC831] text-xl" />
          <span className="font-bold text-gray-900 text-lg">
            {parseFloat(review.rating).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Review Content */}
      <div className="space-y-5">
        <p className="text-[15px] sm:text-[16px] text-gray-600 leading-relaxed font-medium">
          {review.comment}
        </p>

        {/* Gallery Logic: Exactly 3 slots max */}
        {displayImages.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl">
            {displayImages.map((img, idx) => {
              const isLastVisible = idx === 2 && images.length > 3;
              return (
                <div
                  key={img.id || idx}
                  className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100"
                >
                  <Image
                    src={img.image_url || img.image}
                    alt="Review attachment"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {isLastVisible && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        {remainingCount}+
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;
