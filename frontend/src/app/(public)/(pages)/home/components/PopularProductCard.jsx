'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { BsCart3 } from 'react-icons/bs';
import { GoStarFill } from 'react-icons/go';
import { TbCurrencyTaka } from 'react-icons/tb';
import { useCart } from '../../../hooks/useCart';
import { formatCurrency } from '@/app/(user)/lib/formatters';

const PopularProductCard = ({ product }) => {
  const { addItem, isUpdating } = useCart();

  const handleAddToCart = async e => {
    // Prevent the Link from navigating to the product details page
    e.preventDefault();
    e.stopPropagation();

    if (product?.id) {
      await addItem(product.id, 1);
    }
  };

  return (
    <div className="group">
      <Link href={`/product/${product?.slug}`}>
        <div className="relative bg-white rounded-[24px] border border-gray-100 p-3 transition-all">
          {/* 1. Image wrapper */}
          <div className="relative bg-(--color-imageBG) rounded-[18px] w-full aspect-square flex items-center justify-center overflow-hidden p-5 border border-gray-50">
            {/* Dynamic Discount badge */}
            {product?.discount_percentage > 0 && (
              <span className="absolute top-3 right-3 bg-(--success-500) text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10 uppercase tracking-wider">
                -{product.discount_percentage}% off
              </span>
            )}

            {/* Product image */}
            {product?.image ? (
              <Image
                src={product.image}
                alt={product.name}
                width={300}
                height={300}
                className="max-w-[80%] max-h-[80%] object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                priority
              />
            ) : (
              <div className="text-gray-300 text-[10px] font-bold uppercase">
                No Image
              </div>
            )}
          </div>

          {/* 2. Product Information */}
          <div className="px-1">
            <h1 className="font-bold text-base lg:text-lg text-gray-900 mt-4 leading-tight truncate">
              {product?.name}
            </h1>

            <div className="flex gap-1.5 items-center mt-2">
              <GoStarFill className="text-[#FFC831]" size={14} />
              <span className="text-sm font-bold text-gray-900">
                {product?.rating_avg || '0.0'}
              </span>
              <p className="text-xs text-gray-400 font-medium">
                ({product?.review_count || 0} Reviews)
              </p>
            </div>

            {/* 3. Price and Buy Section */}
            <div className="flex items-center justify-between mt-5 pt-1">
              <div className="flex flex-col">
                {/* current price */}
                <div className="flex items-center text-lg font-bold text-gray-900">
                  <TbCurrencyTaka className="text-xl" />
                  <span>{parseFloat(product?.price).toLocaleString()}</span>
                </div>

                {/* original price - only shown if there is a discount */}
                {product?.original_price &&
                  parseFloat(product.original_price) >
                    parseFloat(product.price) && (
                    <span className="flex items-center text-xs text-gray-400 line-through font-medium ml-1">
                      <TbCurrencyTaka />
                      <span>
                        {parseFloat(product.original_price).toLocaleString()}
                      </span>
                    </span>
                  )}
              </div>

              {/* Buy Button - Connected to useCart */}
              <button
                onClick={handleAddToCart}
                disabled={isUpdating}
                className="w-10 h-10 bg-(--color-primary-25) rounded-full border border-(--color-primary-50) flex items-center justify-center text-(--color-primary-500) cursor-pointer hover:bg-(--color-primary-500) hover:text-white transition-all disabled:opacity-50"
                title="Add to Cart"
              >
                <BsCart3
                  size={18}
                  className={isUpdating ? 'animate-pulse' : ''}
                />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PopularProductCard;
