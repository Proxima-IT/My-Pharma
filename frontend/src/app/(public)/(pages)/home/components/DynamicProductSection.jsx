'use client';

import React from 'react';
import Link from 'next/link';
import { MdArrowForwardIos } from 'react-icons/md';
import PopularProductCard from './PopularProductCard';
import { useProductData } from '@/app/(public)/hooks/useProductData';

/**
 * DynamicProductSection Component
 * A generic component that renders a product grid for a specific category.
 * Props:
 * - category: The category object { name, slug }
 * - index: The loop index to determine background color
 */
const DynamicProductSection = ({ category, index }) => {
  // Fetch first 4 available products for this specific category slug
  const { isLoading, products } = useProductData({
    category: category.slug,
    available: 'true',
    page_size: 4,
  });

  // Pre-defined color combinations for business branding
  const colorThemes = [
    {
      bg: 'bg-[#E9EBF4]',
      text: 'text-(--color-primary-500)',
      btn: 'hover:border-(--color-primary-500)',
    }, // Default/Popular
    {
      bg: 'bg-[#B0E5C799]',
      text: 'text-[#009C42]',
      btn: 'hover:border-[#009C42]',
    }, // Natura Care Style
    {
      bg: 'bg-[#E0F6FA]',
      text: 'text-[#4CCBE0]',
      btn: 'hover:border-[#4CCBE0]',
    }, // Unilever Style
    {
      bg: 'bg-[#F9E6D5]',
      text: 'text-[#E2822C]',
      btn: 'hover:border-[#E2822C]',
    }, // Boost & Balance Style
  ];

  // Cycle through themes based on index
  const theme = colorThemes[index % colorThemes.length];

  if (isLoading) {
    return (
      <div className="w-full py-10 flex items-center justify-center bg-gray-50 rounded-[32px]">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  // Only show section if products exist
  if (!products || products.length === 0) return null;

  return (
    <div
      className={`${theme.bg} rounded-[32px] py-12 px-4 md:px-8 lg:px-10 animate-in fade-in duration-700 shadow-none`}
    >
      <div className="flex justify-between items-center mb-8">
        <h2
          className={`font-bold text-lg lg:text-2xl ${theme.text} tracking-tight uppercase`}
        >
          {category.name}
        </h2>
        <Link href={`/category/${category.slug}`}>
          <button
            className={`border border-gray-200 bg-white rounded-full px-5 lg:px-8 py-2.5 lg:py-3.5 ${theme.text} flex gap-2 lg:gap-3 items-center text-xs lg:text-[14px] font-bold cursor-pointer ${theme.btn} transition-all active:scale-95 shadow-none`}
          >
            See More
            <MdArrowForwardIos size={14} />
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.slice(0, 4).map(product => (
          <PopularProductCard product={product} key={product.id} />
        ))}
      </div>
    </div>
  );
};

export default DynamicProductSection;
