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
const BundlePreviewCard = ({ bundle }) => {
  const displayPrice = getComboDisplayPrice(bundle);

  const displayOriginalPrice = getComboDisplayOriginalPrice(bundle);
  const hasDiscount = getComboHasDiscount(bundle);

  return (
    <Link href={`/combo/${bundle.id}`} className="block group">
      <div
        className="relative rounded-[24px] w-full h-full flex flex-col overflow-hidden transition-all group-hover:shadow-lg"
        style={{ backgroundColor: bundle.bgColor }}
      >
        {/* Top Content */}
        <div className="p-6 pb-3 w-full flex flex-col items-start gap-2 z-10">
          {/* Title & Description */}
          <div className="w-full space-y-0.5">
            <h3 className="text-lg font-bold text-gray-900 leading-tight tracking-tight line-clamp-1">
              {bundle.title}
            </h3>
          </div>

          {/* Pricing — display price from combo database fields */}
          <div className="flex items-center gap-2">
            <div className="flex items-center text-xl font-bold text-gray-900">
              <TbCurrencyTaka className="text-2xl -ml-0.5" />
              <span>{displayPrice.toLocaleString()}</span>
            </div>
            {hasDiscount && (
              <div className="flex items-center text-sm text-gray-400 line-through font-medium">
                <TbCurrencyTaka />
                <span>{displayOriginalPrice.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Image */}
        <div className="w-full mt-auto pointer-events-none">
          {bundle.image_url ? (
            <Image
              src={bundle.image_url}
              alt={bundle.title}
              width={400}
              height={260}
              className="w-full h-auto block object-contain object-bottom"
              unoptimized
            />
          ) : (
            <div className="w-full h-24 bg-black/5 flex items-center justify-center">
              <span className="text-gray-400 font-mono text-[10px] uppercase">
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
