'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { TbCurrencyTaka } from 'react-icons/tb';
import {
  getComboDisplayOriginalPrice,
  getComboDisplayPrice,
  getComboHasDiscount,
} from '@/app/(public)/lib/comboPricing';

/**
 * BundlePreviewCard
 * A minimal, button-less variant of BundleCard designed exclusively
 * for the Product Single page's Bundle Slider sidebar.
 * The entire card is a single clickable link to the combo detail page.
 */
// Helper to determine pricing colors based on background color theme
const getThemeColors = (bgColor) => {
  const bg = (bgColor || '').toLowerCase().trim();
  
  if (bg.startsWith('bg-')) {
    if (bg.includes('red') || bg.includes('rose') || bg.includes('pink')) {
      return {
        priceColor: 'text-red-600',
        originalPriceColor: 'text-red-400/70',
      };
    }
    if (bg.includes('blue') || bg.includes('indigo') || bg.includes('purple')) {
      return {
        priceColor: 'text-indigo-600',
        originalPriceColor: 'text-indigo-400/70',
      };
    }
    if (bg.includes('green') || bg.includes('emerald') || bg.includes('teal')) {
      return {
        priceColor: 'text-[#00A78E]',
        originalPriceColor: 'text-[#00A78E]/50',
      };
    }
    return {
      priceColor: 'text-gray-900',
      originalPriceColor: 'text-gray-400',
    };
  }
  
  if (bg.startsWith('#')) {
    const r = parseInt(bg.slice(1, 3), 16) || 0;
    const g = parseInt(bg.slice(3, 5), 16) || 0;
    const b = parseInt(bg.slice(5, 7), 16) || 0;
    
    // Indigo dominant
    if (b > g && b > r && b > 150) {
      return {
        priceColor: 'text-indigo-600',
        originalPriceColor: 'text-indigo-400/70',
      };
    }
    // Red dominant
    if (r > g && r > b && r > 150) {
      return {
        priceColor: 'text-red-600',
        originalPriceColor: 'text-red-400/70',
      };
    }
    // Green dominant / Default
    return {
      priceColor: 'text-[#00A78E]',
      originalPriceColor: 'text-[#00A78E]/50',
    };
  }
  
  return {
    priceColor: 'text-[#00A78E]',
    originalPriceColor: 'text-[#00A78E]/50',
  };
};

const BundlePreviewCard = ({ bundle }) => {
  const displayPrice = getComboDisplayPrice(bundle);
  const displayOriginalPrice = getComboDisplayOriginalPrice(bundle);
  const hasDiscount = getComboHasDiscount(bundle);

  const isTailwindBg = typeof bundle.bgColor === 'string' && bundle.bgColor.startsWith('bg-');
  const themeColors = getThemeColors(bundle.bgColor);

  return (
    <Link href={`/combo/${bundle.id}`} className="block group h-[185px] sm:h-[205px]">
      <div
        className={`relative rounded-[20px] w-full h-full flex flex-col overflow-hidden transition-all duration-300 group-hover:shadow-md border border-black/[0.03] ${
          isTailwindBg ? bundle.bgColor : ''
        }`}
        style={isTailwindBg ? {} : { backgroundColor: bundle.bgColor }}
      >
        {/* Top Content */}
        <div className="p-3.5 pb-1.5 w-full flex flex-col items-start gap-1 z-10">
          {/* Title */}
          <div className="w-full">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug tracking-tight line-clamp-2 min-h-[34px] sm:min-h-[40px]">
              {bundle.title}
            </h3>
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[13px] sm:text-sm font-extrabold ${themeColors.priceColor}`}>
              ৳{displayPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className={`text-[10px] sm:text-xs line-through font-semibold ${themeColors.originalPriceColor}`}>
                ৳{displayOriginalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Image Container */}
        <div className="w-full h-24 sm:h-28 mt-auto px-2.5 sm:px-3.5 pb-2.5 sm:pb-3 flex items-center justify-center pointer-events-none z-10">
          {bundle.image_url ? (
            <Image
              src={bundle.image_url}
              alt={bundle.title}
              width={200}
              height={120}
              className="max-h-full max-w-full object-contain object-bottom transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-black/[0.04] rounded-xl flex items-center justify-center">
              <span className="text-gray-400 font-mono text-[9px] uppercase">
                No Image
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default BundlePreviewCard;
