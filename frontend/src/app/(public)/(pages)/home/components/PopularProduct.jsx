'use client';

import React from 'react';
import Link from 'next/link';
import { MdArrowForwardIos } from 'react-icons/md';
import PopularProductCard from './PopularProductCard';
import { useProductData } from '@/app/(public)/hooks/useProductData';

const PopularProduct = () => {
  const { loading, products } = useProductData();

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-[70px] px-4">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-lg lg:text-2xl text-gray-900">
          Popular Products
        </h1>
        <Link href="/products">
          <button className="border border-gray-100 bg-white rounded-full px-4 lg:px-6 py-2 lg:py-3 text-(--color-primary-500) flex gap-2 lg:gap-3 items-center text-xs lg:text-sm font-bold cursor-pointer hover:bg-gray-50 transition-all">
            See More Product{' '}
            <span>
              <MdArrowForwardIos />
            </span>
          </button>
        </Link>
      </div>

      {/* product card grid - Updated to 5 columns on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mt-7">
        {products.map(product => (
          <PopularProductCard product={product} key={product.id} />
        ))}
      </div>
    </div>
  );
};

export default PopularProduct;
