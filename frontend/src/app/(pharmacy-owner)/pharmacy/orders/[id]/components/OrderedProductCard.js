'use client';
import React from 'react';
import Link from 'next/link';
import { FiChevronRight, FiPackage } from 'react-icons/fi';
import { formatCurrency } from '@/app/(user)/lib/formatters';
import { getMediaUrl, getProductImageUrl } from '@/app/(shared)/lib/apiConfig';

/**
 * OrderedProductCard Component (Pharmacy Owner)
 * Updated: Supports both PRODUCT and COMBO order items.
 * Combo items show a "COMBO" badge, link to /combo/[id], hide dosage, show "Combo Pack" unit.
 */
export default function OrderedProductCard({ item, productInfo }) {
  const isCombo = item.item_type === 'COMBO';
  const unitPrice = parseFloat(item.price_at_order || 0);
  const detailPath = isCombo
    ? `/combo/${item.combo_id}`
    : `/product/${productInfo?.slug || item.product_slug || item.product}`;

  const imageUrl = isCombo
    ? item.image_url
      ? getMediaUrl(item.image_url)
      : null
    : productInfo
      ? getProductImageUrl(productInfo)
      : item.image_url
        ? getMediaUrl(item.image_url)
        : null;

  const unitLabel = isCombo
    ? 'Combo Pack'
    : productInfo?.unit_name || item.product_unit_name || 'Standard Unit';

  return (
    <div className="bg-(--color-admin-card) border border-(--color-admin-border) flex flex-col sm:flex-row items-stretch rounded-none transition-all duration-300 hover:bg-white group">
      {/* Product Image Container */}
      <div className="relative w-full sm:w-[160px] h-[140px] bg-white border-b sm:border-b-0 sm:border-r border-(--color-admin-border) flex items-center justify-center p-4 shrink-0">
        {isCombo && (
          <span className="absolute top-2 left-2 z-10 bg-(--color-admin-primary) text-white font-mono text-[8px] font-bold px-2 py-0.5 uppercase tracking-widest flex items-center gap-1">
            <FiPackage size={9} /> COMBO
          </span>
        )}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.product_name}
            className="max-w-full max-h-full object-contain mix-blend-multiply"
          />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <FiPackage size={20} className="text-(--color-gray-300)" />
            <div className="font-mono text-[10px] font-bold text-(--color-gray-300) uppercase">
              {isCombo ? 'COMBO' : 'NO_IMAGE'}
            </div>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 p-6 flex flex-col justify-center border-r border-(--color-admin-border)">
        <h3 className="text-lg font-black text-(--color-admin-navy) uppercase tracking-tight mb-1">
          {isCombo ? item.combo_title || item.product_name : item.product_name}
        </h3>
        <p className="text-xs text-(--color-text-secondary) font-bold uppercase tracking-wide mb-4">
          {unitLabel}
        </p>

        <div className="flex flex-wrap gap-4 font-mono text-[11px] font-bold text-(--color-text-secondary) uppercase">
          <div className="bg-(--color-admin-bg) px-2 py-1 border border-(--color-admin-border)">
            QTY:{' '}
            <span className="text-(--color-admin-navy)">{item.quantity}</span>
          </div>

          {/* Displaying the specific dosage ordered — hidden for combo items */}
          {!isCombo &&
            (item.dosage || item.product_dosage || productInfo?.dosage) && (
              <div className="bg-(--color-admin-bg) px-2 py-1 border border-(--color-admin-border)">
                DOSAGE:{' '}
                <span className="text-(--color-admin-navy)">
                  {item.dosage || item.product_dosage || productInfo?.dosage}
                </span>
              </div>
            )}
        </div>
      </div>

      {/* Price and Action */}
      <div className="w-full sm:w-[180px] p-6 flex flex-col justify-between items-end bg-(--color-admin-bg)/30">
        <span className="font-mono text-xl font-bold text-(--color-admin-navy)">
          {formatCurrency(unitPrice * item.quantity)}
        </span>

        <Link
          href={detailPath}
          className="flex items-center gap-2 bg-(--color-admin-primary) text-white px-3 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-(--color-admin-accent) transition-all duration-300"
        >
          VIEW_DETAILS <FiChevronRight />
        </Link>
      </div>
    </div>
  );
}
