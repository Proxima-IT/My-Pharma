'use client';

import React from 'react';
import Link from 'next/link';
import { MdArrowForwardIos } from 'react-icons/md';
import PopularProductCard from './PopularProductCard';
import { useProductData } from '@/app/(public)/hooks/useProductData';

/**
 * UnileverDeals Component
 * Custom section for Unilever branded products/deals.
 * Background Color: #E0F6FA
 * Heading/Accent Color: #4CCBE0
 * Design: Public Zone (rounded-[32px], no shadows).
 */
const UnileverDeals = () => {
  // Fetching available products - in a real scenario, we'd filter by Unilever brand ID
  const { isLoading, products } = useProductData({ available: 'true' });

  if (isLoading) {
    return (
      <div className="w-full py-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#E0F6FA] rounded-[32px] py-12 px-4 md:px-8 lg:px-10 animate-in fade-in duration-700 shadow-none">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-bold text-lg lg:text-2xl text-[#4CCBE0] tracking-tight">
          Unilever: Deals you can't miss
        </h1>
        <Link href="/products?search=unilever">
          <button className="border border-gray-200 bg-white rounded-full px-5 lg:px-8 py-2.5 lg:py-3.5 text-[#4CCBE0] flex gap-2 lg:gap-3 items-center text-xs lg:text-[14px] font-bold cursor-pointer hover:border-[#4CCBE0] transition-all active:scale-95 shadow-none">
            Explore Deals
            <MdArrowForwardIos size={14} />
          </button>
        </Link>
      </div>

      {/* 
        Product Grid - Standard 4 Breakpoint Layout
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products?.slice(0, 4).map(product => (
          <PopularProductCard product={product} key={product.id} />
        ))}
      </div>

      {products?.length === 0 && (
        <div className="w-full py-32 text-center bg-white rounded-[32px] border border-gray-100 shadow-none">
          <p className="text-gray-400 font-bold text-lg uppercase tracking-widest">
            No Unilever deals available
          </p>
        </div>
      )}
    </div>
  );
};

export default UnileverDeals;
