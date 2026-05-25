'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiChevronRight, FiRotateCcw, FiPackage, FiInfo } from 'react-icons/fi';
import { formatCurrency } from '../../../../lib/formatters';
import { getMediaUrl, getProductImageUrl } from '@/app/(shared)/lib/apiConfig';

/**
 * OrderedProductCard Component
 * Updated: Supports both PRODUCT and COMBO order items.
 * Combo items show a "COMBO" badge, link to /combo/[id], hide dosage, show "Combo Pack" unit.
 */
export default function OrderedProductCard({ item, productInfo }) {
  const router = useRouter();

  const isCombo = item.item_type === 'COMBO';

  // Determine the correct detail path and slug
  const detailPath = isCombo
    ? `/combo/${item.combo_id}`
    : `/product/${productInfo?.slug || item.product_slug || item.product}`;

  const unitPrice = parseFloat(item.price_at_order || 0);

  const imageUrl = isCombo
    ? item.image_url
      ? getMediaUrl(item.image_url)
      : null
    : productInfo
      ? getProductImageUrl(productInfo)
      : item.image_url
        ? getMediaUrl(item.image_url)
        : null;

  const genericName = isCombo
    ? 'Combo Bundle'
    : productInfo?.ingredient_name ||
      item.product_description ||
      'Medical Information';

  const unitLabel = isCombo
    ? 'Combo Pack'
    : productInfo?.unit_name || item.product_unit_name || 'Standard Pack';

  const displayDosage = isCombo
    ? null
    : item.dosage || item.product_dosage || productInfo?.dosage;

  return (
    <div className="bg-white border border-gray-100 rounded-[28px] p-5 lg:p-6 flex flex-col gap-5 2xl:gap-6 transition-all hover:border-(--color-primary-200) group w-full overflow-hidden shadow-none">
      {/* SECTION 1: IDENTITY (Img + Title) */}
      <div className="flex flex-col items-center gap-4 2xl:flex-row 2xl:items-start 2xl:gap-6">
        {/* Visual Container */}
        <div className="w-full max-w-[112px] mx-auto 2xl:mx-0 2xl:w-auto">
          <div
            className="relative w-full h-24 rounded-[20px] bg-gray-50 flex items-center justify-center p-3 cursor-pointer border border-gray-100/50 transition-transform active:scale-95 sm:h-20 lg:h-28"
            onClick={() => router.push(detailPath)}
          >
            {isCombo && (
              <span className="absolute -top-1.5 -right-1.5 z-10 bg-(--color-primary-500) text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-0.5">
                <FiPackage size={9} /> Combo
              </span>
            )}
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.product_name}
                className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform group-hover:scale-110"
              />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <FiPackage size={24} className="text-gray-300" />
                {isCombo && (
                  <span className="text-[8px] font-bold text-gray-300 uppercase">
                    Combo
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 text-center 2xl:text-left">
          <div className="flex flex-wrap items-center justify-center gap-3 2xl:justify-start">
            <Link href={detailPath}>
              <h3 className="text-[16px] lg:text-[18px] font-bold text-gray-900 leading-tight hover:text-(--color-primary-500) transition-colors truncate uppercase tracking-tight">
                {isCombo
                  ? item.combo_title || item.product_name
                  : item.product_name}
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
            <div
              className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-full border ${
                isCombo
                  ? 'bg-(--color-primary-50) border-(--color-primary-100)'
                  : 'bg-gray-50 border-gray-100'
              }`}
            >
              {isCombo && (
                <FiPackage size={10} className="text-(--color-primary-600)" />
              )}
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${
                  isCombo ? 'text-(--color-primary-600)' : 'text-gray-700'
                }`}
              >
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
              {isCombo ? 'Price Per Pack' : 'Price Per Unit'}
            </span>
            <span className="text-[12px] lg:text-[13px] font-bold text-gray-500 leading-none">
              {formatCurrency(unitPrice)}
            </span>
          </div>
        </div>

        {/* Action Rows */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full 2xl:justify-end">
          <Link
            href={detailPath}
            className="min-w-[160px] flex-1 sm:flex-none h-11 px-6 border border-gray-100 rounded-full flex items-center justify-center text-[11px] font-black text-gray-500 hover:text-black hover:border-gray-900 uppercase tracking-widest transition-all"
          >
            View Details <FiChevronRight className="ml-1" />
          </Link>

          <button
            onClick={() => router.push(detailPath)}
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
