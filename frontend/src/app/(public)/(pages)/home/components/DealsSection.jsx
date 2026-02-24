'use client';

import { getProducts } from '@/data/productInfo';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { BsCart3 } from 'react-icons/bs';
import { GoStarFill } from 'react-icons/go';
import { MdArrowForwardIos } from 'react-icons/md';
import { TbCurrencyTaka } from 'react-icons/tb';

const DealsSection = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await getProducts();
      setProducts(response);
    };
    fetchProducts();
  }, []);

  return (
    <div className="pt-[70px] px-4">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-sm lg:text-2xl text-gray-900">
          Unilever: Deals you can&apos;t miss
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

      {/* product card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-7">
        {products.map(product => (
          <div
            key={product.id}
            className="relative flex flex-col md:flex-row gap-5 bg-white p-3 rounded-[24px] border border-gray-100 transition-all"
          >
            {/* 1. Image wrapper - Constrained size for larger screens */}
            <div className="relative bg-(--color-imageBG) rounded-[18px] w-full md:w-[160px] lg:w-[180px] aspect-square flex items-center justify-center overflow-hidden p-4 shrink-0 border border-gray-50">
              {/* Discount badge */}
              <span className="absolute top-2 right-2 bg-(--success-500) text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 uppercase">
                -27% off
              </span>

              {/* Product image */}
              <Image
                src={product.image}
                alt={product.name}
                width={200}
                height={200}
                className="max-w-[85%] max-h-[85%] object-contain mix-blend-multiply"
                priority
              />
            </div>

            {/* 2. Product Information - Flex column to push price to bottom */}
            <div className="flex flex-col flex-1 py-1 pr-2">
              <div>
                <h1 className="font-bold text-lg text-gray-900 leading-tight">
                  {product.name}
                </h1>
                <div className="flex gap-2 items-center mt-2">
                  <GoStarFill className="text-[#FFC831]" />
                  <span className="text-sm font-bold text-gray-900">5.0</span>
                  <p className="text-xs text-gray-400 font-medium">
                    (1.2k+ Reviews)
                  </p>
                </div>
              </div>

              {/* 3. Price and Buy Section - Pushed to the bottom */}
              <div className="flex items-center justify-between mt-auto pt-4">
                <div className="flex items-baseline gap-1">
                  {/* current price */}
                  <div className="flex items-center text-xl font-bold text-gray-900">
                    <TbCurrencyTaka className="text-2xl" />
                    <span>1,250</span>
                  </div>

                  {/* original price */}
                  <span className="flex items-center text-sm text-gray-400 line-through font-medium">
                    <TbCurrencyTaka />
                    <span>1,250</span>
                  </span>
                </div>

                {/* Cart Button - Lightened background to primary-25 */}
                <button className="w-10 h-10 bg-(--color-primary-25) rounded-full border border-(--color-primary-50) flex items-center justify-center text-(--color-primary-500) cursor-pointer hover:bg-(--color-primary-500) hover:text-white transition-all">
                  <BsCart3 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DealsSection;
