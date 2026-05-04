'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { TbCurrencyTaka } from 'react-icons/tb';

/**
 * BundleCard Component
 * Updated: Uses inline styles to apply the dynamic hex color selected by the Super Admin.
 */
const BundleCard = ({ bundle }) => {
  return (
    <div
      className="relative rounded-[40px] w-full h-full flex flex-col overflow-hidden transition-all"
      style={{ backgroundColor: bundle.bgColor }}
    >
      {/* 1. Top Content Section */}
      <div className="p-8 sm:p-10 pb-6 w-full flex flex-col items-start gap-4 z-10">
        {/* Text Content */}
        <div className="w-full space-y-1">
          <h3 className="text-2xl sm:text-[32px] font-bold text-gray-900 leading-tight tracking-tight">
            {bundle.title}
          </h3>
          <p className="text-sm sm:text-lg text-gray-600 font-medium opacity-80">
            {bundle.description}
          </p>

          {/* Render list of products associated with this combo bundle */}
          {bundle.products && bundle.products.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {bundle.products.map(product => (
                <span
                  key={product.id}
                  className="px-3 py-1 bg-white/30 backdrop-blur-md rounded-full text-[11px] font-bold text-gray-900 uppercase border border-white/20"
                >
                  {product.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing Section */}
        <div className="flex items-center gap-3">
          <div className="flex items-center text-3xl sm:text-[36px] font-bold text-gray-900">
            <TbCurrencyTaka className="text-4xl -ml-1" />
            <span>{bundle.price}</span>
          </div>
          {bundle.original_price && (
            <div className="flex items-center text-lg sm:text-xl text-gray-400 line-through font-medium">
              <TbCurrencyTaka />
              <span>{bundle.original_price}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Link href={`/combo/${bundle.id}`}>
          <button className="relative z-10 mt-6 bg-white rounded-full px-8 py-4 text-(--color-primary-500) flex items-center gap-2 text-sm sm:text-base font-bold cursor-pointer hover:bg-gray-50 transition-all border border-transparent">
            <span>See Bundle</span>
            <FiChevronRight size={20} strokeWidth={3} />
          </button>
        </Link>
      </div>

      {/* 2. Full-Width Dynamic Image Section */}
      <div className="w-full mt-auto pointer-events-none">
        {bundle.image_url ? (
          <Image
            src={bundle.image_url}
            alt={bundle.title}
            width={600}
            height={400}
            className="w-full h-auto block object-contain object-bottom"
            priority
            unoptimized
          />
        ) : (
          <div className="w-full h-40 bg-black/5 flex items-center justify-center">
            <span className="text-gray-400 font-mono text-xs uppercase">
              No Image
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BundleCard;
