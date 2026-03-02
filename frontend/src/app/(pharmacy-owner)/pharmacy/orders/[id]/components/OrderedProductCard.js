'use client';
import React from 'react';
import Link from 'next/link';
import { FiChevronRight } from 'react-icons/fi';
import { formatCurrency } from '@/app/(user)/lib/formatters';

export default function OrderedProductCard({ item }) {
  const unitPrice = parseFloat(item.price_at_order || 0);
  const productPath = `/product/${item.product_slug || item.product}`;

  return (
    <div className="bg-white border border-gray-100 rounded-[24px] p-4 flex flex-col sm:flex-row items-start sm:items-stretch gap-6 transition-all hover:border-(--color-primary-100) group">
      {/* Product Image */}
      <div className="w-full sm:w-[140px] h-[120px] bg-(--color-imageBG) rounded-[18px] flex items-center justify-center p-4 shrink-0">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.product_name}
            className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="text-(--color-gray-300) text-[10px] font-bold uppercase text-center">
            No Image
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 w-full flex flex-col justify-center">
        <h3 className="text-[18px] font-bold text-gray-900 mb-1">
          {item.product_name}
        </h3>

        <p className="text-[14px] text-gray-500 mb-3 font-medium line-clamp-1">
          {item.product_description || 'Generic Information N/A'}
        </p>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] font-bold text-gray-700">
          <span>
            {item.product_unit_label || 'Unit N/A'}{' '}
            <span className="text-gray-400 font-normal ml-1">
              (Qty: {item.quantity})
            </span>
          </span>
          {item.product_dosage && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-medium">Dosage:</span>
              <span>{item.product_dosage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Price and Actions */}
      <div className="flex flex-col items-end justify-between shrink-0 w-full sm:w-auto gap-4 sm:gap-0 border-t sm:border-none border-gray-50 pt-4 sm:pt-0">
        <span className="text-[20px] font-bold text-gray-900">
          {formatCurrency(unitPrice * item.quantity)}
        </span>

        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
          <Link
            href={productPath}
            className="flex items-center gap-1 text-[14px] font-bold text-(--color-primary-500) hover:underline transition-all cursor-pointer"
          >
            View Product <FiChevronRight />
          </Link>
        </div>
      </div>
    </div>
  );
}
