'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BsCart3 } from 'react-icons/bs';
import { TbCurrencyTaka } from 'react-icons/tb';
import { useCart } from '../../../hooks/useCart';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';

const PopularBundleCard = ({ bundle }) => {
  const { addItem, isUpdating } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const getImageUrl = image => getMediaUrl(image);

  const originalPrice = parseFloat(bundle.original_price || bundle.price || 0);
  const discountedPrice = parseFloat(
    bundle.discount_price || bundle.price || 0,
  );
  const hasDiscount = originalPrice > discountedPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    : 0;

  const items = bundle.products || bundle.items || [];
  const bundleImage =
    bundle.image ||
    (items.length > 0 ? items[0].product_image || items[0].image : null);

  const stripFormats = text => {
    if (!text) return '';
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/(\**|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/#+\s/g, '')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
      .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '')
      .replace(/`{1,3}.*?`{1,3}/g, '')
      .trim();
  };

  const handleAddToCart = async e => {
    e.preventDefault();
    e.stopPropagation();

    if (items && items.length > 0) {
      setIsAdding(true);
      try {
        for (const item of items) {
          await addItem(item, 1);
        }
      } catch (err) {
        console.error('Failed to add combo items:', err);
      } finally {
        setIsAdding(false);
      }
    }
  };

  return (
    <div className="group">
      <Link href={`/combo/${bundle.slug || bundle.id}`}>
        <div className="relative bg-white rounded-[24px] border border-gray-100 p-3 transition-all hover:border-(--color-primary-100) shadow-none">
          {/* Image Container */}
          <div className="relative bg-(--color-imageBG) rounded-[18px] w-full aspect-square flex items-center justify-center overflow-hidden border border-gray-50 shadow-none">
            {hasDiscount && (
              <span className="absolute top-3 right-3 bg-(--success-500) text-white text-[10px] font-black px-2.5 py-1 rounded-full z-10 uppercase tracking-wider">
                -{discountPercentage}% off
              </span>
            )}

            {bundleImage ? (
              <Image
                src={getImageUrl(bundleImage)}
                alt={bundle.name || bundle.title || 'Combo'}
                fill
                className="object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110 p-2"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                unoptimized
              />
            ) : (
              <div className="text-gray-300 text-[10px] font-black uppercase tracking-widest">
                No Image
              </div>
            )}

            {/* Item Count Badge */}
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-100 text-[10px] font-bold text-gray-600 shadow-sm">
              {items.length} Items
            </div>
          </div>

          {/* Bundle Info */}
          <div className="px-1">
            <h1 className="font-bold text-base lg:text-lg text-gray-900 mt-4 leading-tight truncate uppercase">
              {bundle.name || bundle.title || 'Combo Name'}
            </h1>

            <p className="text-[11px] text-gray-500 mt-1 line-clamp-1 font-medium leading-tight">
              {stripFormats(bundle.description || bundle.title)}
            </p>

            <div className="flex gap-1.5 items-center mt-2">
              <span className="text-[11px] font-bold text-(--color-primary-500) uppercase tracking-wider">
                Health Combo
              </span>
            </div>

            <div className="flex items-center justify-between mt-5 pt-1">
              <div className="flex flex-col">
                <div className="flex items-center text-lg font-black text-gray-900">
                  <TbCurrencyTaka className="text-xl -ml-1" />
                  <span>{discountedPrice.toLocaleString()}</span>
                </div>

                {hasDiscount && (
                  <span className="flex items-center text-xs text-gray-400 line-through font-bold ml-1">
                    <TbCurrencyTaka />
                    <span>{originalPrice.toLocaleString()}</span>
                  </span>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isUpdating || isAdding}
                className="w-11 h-11 bg-(--color-primary-25) rounded-full border border-(--color-primary-50) flex items-center justify-center text-(--color-primary-500) cursor-pointer hover:bg-(--color-primary-500) hover:text-white transition-all active:scale-90 disabled:opacity-50 shadow-none"
                title="Add to Cart"
              >
                <BsCart3
                  size={18}
                  className={isUpdating || isAdding ? 'animate-bounce' : ''}
                />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PopularBundleCard;
