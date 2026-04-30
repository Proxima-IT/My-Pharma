'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiChevronRight,
  FiRotateCcw,
  FiPackage,
  FiInfo,
  FiTag,
} from 'react-icons/fi';
import { formatCurrency } from '../../../../lib/formatters';
import { getMediaUrl, getProductImageUrl } from '@/app/(shared)/lib/apiConfig';

/**
 * OrderedProductCard Component
 * Optimized for high-density displays (1280x800) and ultra-responsive mobile stacking.
 * Logic:
 * - Desktop: Clean two-row horizontal layout.
 * - Mobile: Full vertical stack where every detail (Price, Unit, Buttons) gets its own row.
 */
export default function OrderedProductCard({ item, productInfo }) {
  const router = useRouter();

  const slug = productInfo?.slug || item.product_slug || item.product;
  const productPath = `/product/${slug}`;
  const unitPrice = parseFloat(item.price_at_order || 0);

  const imageUrl = productInfo
    ? getProductImageUrl(productInfo)
    : item.image_url
      ? getMediaUrl(item.image_url)
      : null;

  const genericName =
    productInfo?.ingredient_name ||
    item.product_description ||
    'Medical Information';

  const unitLabel =
    productInfo?.unit_name || item.product_unit_name || 'Standard Pack';

  const displayDosage =
    item.dosage || item.product_dosage || productInfo?.dosage;

  return (
    <div className="bg-white border border-gray-100 rounded-[28px] p-5 lg:p-6 flex flex-col gap-5 2xl:gap-6 transition-all hover:border-(--color-primary-200) group w-full overflow-hidden shadow-none">
      {/* SECTION 1: IDENTITY (Img + Title) */}
      <div className="flex flex-col items-center gap-4 2xl:flex-row 2xl:items-start 2xl:gap-6">
        {/* Visual Container */}
        <div className="w-full max-w-[112px] mx-auto 2xl:mx-0 2xl:w-auto">
          <div
            className="w-full h-24 rounded-[20px] bg-gray-50 flex items-center justify-center p-3 cursor-pointer border border-gray-100/50 transition-transform active:scale-95 sm:h-20 lg:h-28"
            onClick={() => router.push(productPath)}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.product_name}
                className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform group-hover:scale-110"
              />
            ) : (
              <FiPackage size={24} className="text-gray-300" />
            )}
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 text-center 2xl:text-left">
          <div className="flex flex-wrap items-center justify-center gap-3 2xl:justify-start">
            <Link href={productPath}>
              <h3 className="text-[16px] lg:text-[18px] font-bold text-gray-900 leading-tight hover:text-(--color-primary-500) transition-colors truncate uppercase tracking-tight">
                {item.product_name}
              </h3>
            </Link>
            <div className="flex items-center gap-2 text-gray-400">
              <FiInfo size={12} className="shrink-0" />
              <p className="text-[11px] lg:text-[12px] font-medium truncate uppercase tracking-wide">
                {genericName}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 2xl:justify-start">
            <div className="flex items-center justify-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
                {unitLabel}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-(--color-primary-25) px-3 py-1.5 rounded-full border border-(--color-primary-50)">
              <span className="text-[10px] font-black text-(--color-primary-600) uppercase tracking-widest">
                QTY: {item.quantity}
              </span>
            </div>
            {displayDosage && (
              <div className="flex items-center justify-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                  {displayDosage}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: PRICING & ACTIONS (Row on Desktop, Stack on Mobile) */}
      <div className="flex flex-col items-stretch justify-between pt-5 border-t border-gray-100 gap-4 2xl:flex-row 2xl:items-center">
        {/* Pricing Rows */}
        <div className="flex flex-wrap items-center justify-between gap-4 w-full">
          <div className="min-w-[170px] flex-1 flex flex-col items-start">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Total Payable
            </span>
            <span className="text-[18px] lg:text-[20px] font-black text-gray-900 leading-none">
              {formatCurrency(unitPrice * item.quantity)}
            </span>
          </div>
          <div className="min-w-[170px] flex-1 flex flex-col items-start">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Price Per Unit
            </span>
            <span className="text-[12px] lg:text-[13px] font-bold text-gray-500 leading-none">
              {formatCurrency(unitPrice)}
            </span>
          </div>
        </div>

        {/* Action Rows */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full 2xl:justify-end">
          <Link
            href={productPath}
            className="min-w-[160px] flex-1 sm:flex-none h-11 px-6 border border-gray-100 rounded-full flex items-center justify-center text-[11px] font-black text-gray-500 hover:text-black hover:border-gray-900 uppercase tracking-widest transition-all"
          >
            View Details <FiChevronRight className="ml-1" />
          </Link>

          <button
            onClick={() => router.push(productPath)}
            className="min-w-[160px] flex-1 sm:flex-none h-11 px-8 bg-gray-900 hover:bg-black text-white text-[11px] font-black rounded-full transition-all cursor-pointer uppercase tracking-[0.2em] flex items-center justify-center gap-2 border-none active:scale-95 shadow-none"
          >
            <FiRotateCcw size={14} />
            Buy Again
          </button>
        </div>
      </div>
    </div>
  );
}
