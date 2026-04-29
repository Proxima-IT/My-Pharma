'use client';

import React from 'react';
import Link from 'next/link';
import { MdArrowForwardIos } from 'react-icons/md';
import PopularProductCard from './PopularProductCard';
import { useProductData } from '@/app/(public)/hooks/useProductData';

/**
 * BoostBalance Component
 * Custom section for health supplements and wellness products.
 * Background Color: #F9E6D5
 * Heading/Accent Color: #E2822C
 * Typography: Medium weight with slightly increased letter spacing.
 * Design: Public Zone (rounded-[32px], no shadows).
 */
const BoostBalance = () => {
  const { isLoading, products } = useProductData({ available: 'true' });

  if (isLoading) {
    return (
      <div className="w-full py-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#F9E6D5] rounded-[32px] py-12 px-4 md:px-8 lg:px-10 animate-in fade-in duration-700 shadow-none">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-medium text-lg lg:text-2xl text-[#E2822C] tracking-wide uppercase">
          Boost & Balance
        </h1>
        <Link href="/products?category=wellness">
          <button className="border border-gray-200 bg-white rounded-full px-5 lg:px-8 py-2.5 lg:py-3.5 text-[#E2822C] flex gap-2 lg:gap-3 items-center text-xs lg:text-[14px] font-medium tracking-wider cursor-pointer hover:border-[#E2822C] transition-all active:scale-95 shadow-none">
            View Collection
            <MdArrowForwardIos size={14} />
          </button>
        </Link>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products?.slice(4, 8).map(product => (
          <PopularProductCard product={product} key={product.id} />
        ))}
      </div>

      {products?.length === 0 && (
        <div className="w-full py-32 text-center bg-white rounded-[32px] border border-gray-100 shadow-none">
          <p className="text-gray-400 font-medium text-lg uppercase tracking-widest">
            No items in this collection
          </p>
        </div>
      )}
    </div>
  );
};

export default BoostBalance;
