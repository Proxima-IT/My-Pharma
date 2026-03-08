'use client';
import React from 'react';
import Link from 'next/link';
import { FiChevronRight } from 'react-icons/fi';
import { formatCurrency } from '@/app/(user)/lib/formatters';

export default function OrderedProductCard({ item }) {
  const unitPrice = parseFloat(item.price_at_order || 0);
  const productPath = `/product/${item.product_slug || item.product}`;

  return (
    <div className="bg-(--color-admin-card) border border-(--color-admin-border) flex flex-col sm:flex-row items-stretch rounded-none transition-all duration-300 hover:bg-white group">
      {/* Product Image Container */}
      <div className="w-full sm:w-[160px] h-[140px] bg-white border-b sm:border-b-0 sm:border-r border-(--color-admin-border) flex items-center justify-center p-4 shrink-0">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.product_name}
            className="max-w-full max-h-full object-contain mix-blend-multiply"
          />
        ) : (
          <div className="font-mono text-[10px] font-bold text-(--color-gray-300) uppercase">
            NO_IMAGE
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 p-6 flex flex-col justify-center border-r border-(--color-admin-border)">
        <h3 className="text-lg font-black text-(--color-admin-navy) uppercase tracking-tight mb-1">
          {item.product_name}
        </h3>
        <p className="text-xs text-(--color-text-secondary) font-bold uppercase tracking-wide mb-4">
          {item.product_unit_label || 'Standard Unit'}
        </p>

        <div className="flex flex-wrap gap-4 font-mono text-[11px] font-bold text-(--color-text-secondary) uppercase">
          <div className="bg-(--color-admin-bg) px-2 py-1 border border-(--color-admin-border)">
            QTY:{' '}
            <span className="text-(--color-admin-navy)">{item.quantity}</span>
          </div>

          {/* Displaying the specific dosage ordered */}
          {(item.dosage || item.product_dosage) && (
            <div className="bg-(--color-admin-bg) px-2 py-1 border border-(--color-admin-border)">
              DOSAGE:{' '}
              <span className="text-(--color-admin-navy)">
                {item.dosage || item.product_dosage}
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
          href={productPath}
          className="flex items-center gap-2 bg-(--color-admin-primary) text-white px-3 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-(--color-admin-accent) transition-all duration-300"
        >
          VIEW_DETAILS <FiChevronRight />
        </Link>
      </div>
    </div>
  );
}
