'use client';

import Image from 'next/image';
import React from 'react';
import { FiMinus, FiPlus } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';
import { formatCurrency } from '@/app/(user)/lib/formatters';

const CartCard = ({ item, onUpdate, onRemove }) => {
  // 1. Extract and Clean Data from API
  // We use current_price for the "Real/Live" price and product_original_price for MRP
  const unitPrice = Math.abs(parseFloat(item.current_price || 0));
  const originalPrice = Math.abs(parseFloat(item.product_original_price || 0));

  // 2. Handlers for Quantity
  const handleIncrease = () => onUpdate(item.id, item.quantity + 1);
  const handleDecrease = () => {
    if (item.quantity > 1) onUpdate(item.id, item.quantity - 1);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[24px] p-4 flex flex-col sm:flex-row items-start gap-6 transition-all relative group animate-in fade-in slide-in-from-left-4 duration-500">
      {/* 1. Image Wrapper */}
      <div className="w-full sm:w-[140px] h-[140px] bg-(--color-imageBG) rounded-[18px] flex items-center justify-center p-4 shrink-0 border border-gray-50">
        <Image
          src={item.image_url || '/assets/images/placeholder.png'}
          alt={item.product_name}
          width={120}
          height={120}
          className="max-w-full max-h-full object-contain mix-blend-multiply"
          priority
        />
      </div>

      {/* 2. Content Area */}
      <div className="flex-1 w-full flex flex-col justify-between min-h-[140px] py-1">
        {/* Top Section: Name and Price */}
        <div className="space-y-1 pr-12">
          <h3 className="text-[18px] font-bold text-gray-900 leading-tight">
            {item.product_name}
          </h3>

          {/* Price Section - Showing Unit Price multiplied by Quantity */}
          <div className="flex items-center gap-3">
            <span className="text-[18px] font-bold text-(--color-primary-500)">
              {formatCurrency(unitPrice * item.quantity)}
            </span>
            {originalPrice > unitPrice && (
              <span className="text-[13px] text-gray-400 line-through font-medium">
                {formatCurrency(originalPrice * item.quantity)}
              </span>
            )}
          </div>

          {/* Product Metadata */}
          <p className="text-[14px] text-gray-500 font-medium pt-1 line-clamp-1">
            {item.product_description || 'No description available'}
          </p>

          <div className="flex items-center gap-2 text-[14px] text-gray-700 font-bold">
            <span>{item.product_unit_label || 'Unit N/A'}</span>
            {item.product_dosage && (
              <>
                <span className="text-gray-300 font-light">|</span>
                <span className="text-gray-500 font-medium">
                  {item.product_dosage}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Bottom Section: Quantity Selector */}
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <span className="text-[14px] font-bold text-gray-900 mr-1">
            Quantity:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrease}
              disabled={item.quantity <= 1}
              className="w-9 h-9 rounded-full border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <FiMinus size={16} />
            </button>

            <div className="w-10 h-9 rounded-full border border-gray-100 flex items-center justify-center text-sm font-bold text-gray-900 bg-white">
              {item.quantity}
            </div>

            <button
              onClick={handleIncrease}
              className="w-9 h-9 rounded-full border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <FiPlus size={16} />
            </button>
          </div>

          {/* Unit Price Hint (Optional, helps user understand the math) */}
          <span className="text-[11px] text-gray-400 font-medium ml-2">
            ({formatCurrency(unitPrice)} / unit)
          </span>
        </div>
      </div>

      {/* 3. Delete Button */}
      <button
        onClick={() => onRemove(item.id)}
        className="absolute top-4 right-4 w-11 h-11 rounded-full border border-red-100 bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all cursor-pointer"
        title="Remove from cart"
      >
        <RiDeleteBinLine size={20} />
      </button>
    </div>
  );
};

export default CartCard;
