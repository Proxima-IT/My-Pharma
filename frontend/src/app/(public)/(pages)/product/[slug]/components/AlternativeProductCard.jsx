'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { BsCart3 } from 'react-icons/bs';
import { FiChevronRight } from 'react-icons/fi';

const AlternativeProductCard = ({ product }) => {
  return (
    <div className="relative bg-white border border-gray-100 rounded-[24px] p-4 flex items-center gap-6 transition-all hover:border-gray-200 group">
      {/* 1. Image Wrapper - Square with subtle border */}
      <div className="w-[140px] h-[140px] bg-white border border-gray-100 rounded-[20px] flex items-center justify-center p-4 shrink-0">
        <Image
          src={product.image || '/assets/images/cart1.png'}
          alt={product.name}
          width={110}
          height={110}
          className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform group-hover:scale-105"
          priority
        />
      </div>

      {/* 2. Content Area */}
      <div className="flex-1 flex flex-col justify-center py-1">
        {/* Product Name */}
        <h3 className="text-[22px] font-bold text-gray-900 leading-tight">
          {product.name}
        </h3>

        {/* Generic Name */}
        <p className="text-[16px] text-gray-500 font-medium mt-1">
          {product.generic || 'Diciolenac Sorum BP 50mg'}
        </p>

        {/* Brand Link */}
        <Link
          href={`/brand/${product.brand?.toLowerCase()}`}
          className="flex items-center gap-1 text-[15px] font-bold text-(--color-primary-500) uppercase mt-2 hover:underline"
        >
          {product.brand || 'ACME'}
          <FiChevronRight size={18} strokeWidth={3} />
        </Link>

        {/* Price Section */}
        <div className="flex items-baseline gap-3 mt-4">
          <div className="flex items-center text-[24px] font-bold text-gray-900">
            <span className="text-[26px] mr-0.5">৳</span>
            <span>{product.price || '620'}</span>
          </div>
          <div className="flex items-center text-[18px] text-gray-400 line-through font-medium">
            <span>৳</span>
            <span>{product.oldPrice || '1,230'}</span>
          </div>
        </div>
      </div>

      {/* 3. Action Button - Circular Blue Theme at Bottom Right */}
      <button
        onClick={e => {
          e.preventDefault();
          // Add to cart logic
        }}
        className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-(--color-primary-25) border border-(--color-primary-50) flex items-center justify-center text-(--color-primary-500) cursor-pointer hover:bg-(--color-primary-500) hover:text-white transition-all shadow-none"
      >
        <BsCart3 size={20} />
      </button>
    </div>
  );
};

export default AlternativeProductCard;
