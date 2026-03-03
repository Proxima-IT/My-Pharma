'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiChevronRight } from 'react-icons/fi';
import { formatCurrency } from '../../../../lib/formatters';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';

export default function OrderedProductCard({ item, productInfo }) {
  const router = useRouter();

  // 1. Data Mapping with Real Product Table Lookup
  const slug = productInfo?.slug || item.product_slug || item.product;
  const productPath = `/product/${slug}`;

  const unitPrice = parseFloat(item.price_at_order || 0);
  const imageUrl = getMediaUrl(productInfo?.image || item.image_url);

  // 2. Fallback Logic for Metadata
  const genericName =
    productInfo?.ingredient_name ||
    productInfo?.description ||
    item.product_description ||
    'Generic Information';
  const unitLabel =
    productInfo?.unit_label || item.product_unit_label || 'Standard Pack';
  const dosage = productInfo?.dosage || item.product_dosage;

  return (
    <div className="bg-white border border-gray-100 rounded-[24px] p-4 flex flex-col sm:flex-row items-start sm:items-stretch gap-6 transition-all hover:border-(--color-primary-100) group">
      {/* 1. Product Image - Fetched from Real Product Table */}
      <div
        className="w-full sm:w-[140px] h-[120px] bg-(--color-imageBG) rounded-[18px] flex items-center justify-center p-4 shrink-0 cursor-pointer"
        onClick={() => router.push(productPath)}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.product_name}
            className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="text-(--color-gray-300) text-[10px] font-bold uppercase text-center">
            No Image
          </div>
        )}
      </div>

      {/* 2. Product Details (Middle Column) */}
      <div className="flex-1 w-full flex flex-col justify-center">
        <Link href={productPath}>
          <h3 className="text-[18px] font-bold text-gray-900 mb-1 hover:text-(--color-primary-500) transition-colors">
            {item.product_name}
          </h3>
        </Link>

        <p className="text-[14px] text-gray-500 mb-3 font-medium line-clamp-1">
          {genericName}
        </p>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] font-bold text-gray-700">
          <span>
            {unitLabel}{' '}
            <span className="text-gray-400 font-normal ml-1">
              (Qty: {item.quantity})
            </span>
          </span>
          {dosage && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-medium">Dosage:</span>
              <span>{dosage}</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Right Column: Price and Actions */}
      <div className="flex flex-col items-end justify-between shrink-0 w-full sm:w-auto gap-4 sm:gap-0 border-t sm:border-none border-gray-50 pt-4 sm:pt-0">
        {/* Total Price for this item */}
        <span className="text-[20px] font-bold text-gray-900">
          {formatCurrency(unitPrice * item.quantity)}
        </span>

        {/* Action Buttons */}
        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
          <Link
            href={productPath}
            className="flex items-center gap-1 text-[14px] font-bold text-(--color-primary-500) hover:underline transition-all cursor-pointer"
          >
            View Product <FiChevronRight />
          </Link>

          <Link href={productPath}>
            <button className="bg-(--color-primary-25) text-(--color-primary-500) text-[13px] font-bold px-6 py-2.5 rounded-full hover:bg-(--color-primary-500) hover:text-white transition-all border border-(--color-primary-50) cursor-pointer">
              Buy Again
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
