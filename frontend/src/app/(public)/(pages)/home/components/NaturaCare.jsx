'use client';

import React from 'react';
import Link from 'next/link';
import { MdArrowForwardIos } from 'react-icons/md';
import PopularProductCard from './PopularProductCard';
import { useProductData } from '@/app/(public)/hooks/useProductData';

/**
 * NaturaCare Component
 * A carbon copy of PopularProduct with customized "Pure for you" branding.
 * Background Color: #B0E5C799 (Light transparent green)
 * Heading Color: #009C42
 * Design: Public Zone (rounded-[32px], no shadows).
 */
const NaturaCare = () => {
  // Fetching available products (same logic as PopularProduct)
  const { isLoading, products } = useProductData({ available: 'true' });

  if (isLoading) {
    return (
      <div className="w-full py-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#B0E5C799] rounded-[32px] py-12 px-4 md:px-8 lg:px-10 animate-in fade-in duration-700 shadow-none">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-bold text-lg lg:text-2xl text-[#009C42] tracking-tight">
          Natura Care - Pure for you
        </h1>
        <Link href="/products?category=natura-care">
          <button className="border border-gray-200 bg-white rounded-full px-5 lg:px-8 py-2.5 lg:py-3.5 text-[#009C42] flex gap-2 lg:gap-3 items-center text-xs lg:text-[14px] font-bold cursor-pointer hover:border-[#009C42] transition-all active:scale-95 shadow-none">
            See More Natura
            <MdArrowForwardIos size={14} />
          </button>
        </Link>
      </div>

      {/* 
        Product Grid - 4 Breakpoint Strategy:
        1. Large Screen (xl): grid-cols-4 (4 Cards)
        2. Laptop Screen (lg): grid-cols-3 (3 Cards)
        3. Tab Screen (md): grid-cols-2 (2 Cards)
        4. Phone Screen (base): grid-cols-1 (1 Card)
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products?.map(product => (
          <PopularProductCard product={product} key={product.id} />
        ))}
      </div>

      {products?.length === 0 && (
        <div className="w-full py-32 text-center bg-white rounded-[32px] border border-gray-100 shadow-none">
          <p className="text-gray-400 font-bold text-lg uppercase tracking-widest">
            No herbal products found
          </p>
        </div>
      )}
    </div>
  );
};

export default NaturaCare;
