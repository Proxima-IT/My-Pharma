'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BsCart3 } from 'react-icons/bs';
import { GoStarFill } from 'react-icons/go';
import { TbCurrencyTaka } from 'react-icons/tb';
import { FiTrash2 } from 'react-icons/fi';
import { getProductImageUrl } from '@/app/(shared)/lib/apiConfig';
import { useCart } from '@/app/(public)/hooks/useCart';
import toast from 'react-hot-toast';

export default function ProductCard({ product, onRemove }) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async e => {
    e.stopPropagation();
    setIsAdding(true);
    try {
      await addItem(product, 1);
      toast.success(`${product.name || 'Item'} added to cart!`);
    } catch (err) {
      toast.error(err.message || 'Failed to add item to cart');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group bg-white rounded-[24px] p-3 border border-gray-100 transition-all hover:border-primary-200 hover:shadow-sm flex flex-col h-full relative">
      {/* Image Wrapper */}
      <div className="relative bg-[#F7F7F9] rounded-2xl w-full aspect-square flex items-center justify-center overflow-hidden p-4">
        {/* Discount badge */}
        {product.discount && (
          <span className="absolute top-3 right-3 bg-success-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10">
            -{product.discount}% off
          </span>
        )}

        {/* Remove from Wishlist Button */}
        <button
          onClick={e => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-3 left-3 w-7 h-7 bg-white/80 backdrop-blur-md text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center transition-colors shadow-sm z-10 cursor-pointer"
        >
          <FiTrash2 size={12} />
        </button>

        {/* Product image */}
        <Link href={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center cursor-pointer z-0">
          {getProductImageUrl(product) ? (
            <Image
              src={getProductImageUrl(product)}
              alt={product.name}
              width={300}
              height={300}
              className="max-w-[85%] max-h-[85%] object-contain group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="text-gray-200 uppercase font-black text-xs tracking-widest">
              No Image
            </div>
          )}
        </Link>
      </div>

      {/* Product Details */}
      <div className="px-1 py-4 flex flex-col flex-grow">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-bold text-gray-900 text-sm md:text-base leading-snug line-clamp-2 mb-2 hover:text-(--color-primary-500) transition-colors cursor-pointer">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex gap-1.5 items-center mb-4">
          <GoStarFill className="text-[#FFC831]" size={16} />
          <span className="text-sm font-bold text-gray-900">
            {product.rating || '5.0'}
          </span>
          <p className="text-xs text-gray-400 font-medium">
            ({product.reviews || '1.2k+'} Reviews)
          </p>
        </div>

        {/* Price & Cart Row */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1">
            <div className="flex items-center text-lg font-bold text-gray-900">
              <TbCurrencyTaka className="text-xl" />
              <span>{product.price}</span>
            </div>
            {product.oldPrice && (
              <div className="flex items-center text-xs text-gray-400 line-through decoration-gray-300">
                <TbCurrencyTaka />
                <span>{product.oldPrice}</span>
              </div>
            )}
          </div>

          {/* Modern Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="w-10 h-10 rounded-full bg-primary-50/50 text-primary-500 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all active:scale-90 disabled:opacity-50 cursor-pointer"
          >
            {isAdding ? (
              <svg className="animate-spin h-5 w-5 text-current" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <BsCart3 size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
