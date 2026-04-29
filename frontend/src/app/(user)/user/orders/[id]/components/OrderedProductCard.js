'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiChevronRight } from 'react-icons/fi';
import { formatCurrency } from '../../../../lib/formatters';
import { getMediaUrl, getProductImageUrl } from '@/app/(shared)/lib/apiConfig';

/**
 * OrderedProductCard Component
 * Fixed: Reduced widths and font sizes for the 1280px range to prevent text bleeding.
 */
export default function OrderedProductCard({ item, productInfo }) {
  const router = useRouter();

  const slug = productInfo?.slug || item.product_slug || item.product;
  const productPath = `/product/${slug}`;
  const unitPrice = parseFloat(item.price_at_order || 0);
  const imageUrl = productInfo
    ? getProductImageUrl(productInfo)
    : (item.image_url ? getMediaUrl(item.image_url) : null);

  const genericName =
    productInfo?.ingredient_name ||
    item.product_description ||
    'Generic Information';
  const unitLabel =
    productInfo?.unit_name || item.product_unit_name || 'Standard Pack';
  const displayDosage =
    item.dosage || item.product_dosage || productInfo?.dosage;

  return (
    <div className="bg-white border border-gray-100 rounded-[20px] p-3 md:p-4 flex flex-col sm:flex-row items-center sm:items-start gap-3 md:gap-4 transition-all hover:border-gray-200 group w-full overflow-hidden">
      {/* 1. Product Image */}
      <div
        className="w-full sm:w-[80px] md:w-[110px] h-[80px] md:h-[100px] bg-gray-50 rounded-[14px] flex items-center justify-center p-2 shrink-0 cursor-pointer"
        onClick={() => router.push(productPath)}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.product_name}
            className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="text-gray-300 text-[9px] font-bold uppercase">
            No Image
          </div>
        )}
      </div>

      {/* 2. Product Details */}
      <div className="flex-1 min-w-0 w-full flex flex-col justify-center text-center sm:text-left">
        <Link href={productPath}>
          <h3 className="text-[15px] md:text-[17px] font-bold text-black mb-0.5 hover:text-(--color-primary-500) transition-colors truncate">
            {item.product_name}
          </h3>
        </Link>
        <p className="text-[11px] md:text-[13px] text-gray-500 mb-2 font-medium truncate">
          {genericName}
        </p>
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-[11px] md:text-[13px] font-bold text-black">
          <span className="whitespace-nowrap">
            {unitLabel}{' '}
            <span className="text-gray-400 font-normal">
              (Qty: {item.quantity})
            </span>
          </span>
          {displayDosage && (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-gray-200 font-light">
                |
              </span>
              <span className="text-gray-400 font-medium">
                Dosage: <span className="text-black">{displayDosage}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Price and Actions */}
      <div className="flex flex-col items-center sm:items-end justify-between shrink-0 w-full sm:w-auto gap-2 border-t sm:border-none border-gray-50 pt-3 sm:pt-0">
        <span className="text-[16px] md:text-[18px] font-bold text-black">
          {formatCurrency(unitPrice * item.quantity)}
        </span>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <Link
            href={productPath}
            className="text-[11px] md:text-[13px] font-bold text-black hover:underline flex items-center gap-0.5"
          >
            View <FiChevronRight />
          </Link>
          <Link href={productPath}>
            <button className="bg-gray-50 text-black text-[11px] md:text-[12px] font-bold px-4 py-1.5 rounded-full border border-gray-100 cursor-pointer">
              Buy Again
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
