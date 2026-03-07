'use client';

import Image from 'next/image';
import React from 'react';
import { FiMinus, FiPlus, FiBox } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';
import { formatCurrency } from '@/app/(user)/lib/formatters';

const CartCard = ({ item, onUpdate, onRemove }) => {
  const unitPrice = parseFloat(item.current_price || 0);
  const originalPrice = parseFloat(item.product_original_price || 0);

  return (
    <div className="bg-white border border-gray-100 rounded-[24px] p-4 flex flex-col sm:flex-row items-start gap-6 transition-all relative group animate-in fade-in slide-in-from-left-4 duration-500">
      {/* 1. Image Wrapper with Conditional Icon */}
      <div className="w-full sm:w-[140px] h-[140px] bg-(--color-imageBG) rounded-[18px] flex items-center justify-center p-4 shrink-0 border border-gray-50">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.product_name || 'Product'}
            width={120}
            height={120}
            className="max-w-full max-h-full object-contain mix-blend-multiply"
            priority
            unoptimized={true}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-300">
            <FiBox size={40} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              No Photo
            </span>
          </div>
        )}
      </div>

      {/* 2. Content Area */}
      <div className="flex-1 w-full flex flex-col justify-between min-h-[140px] py-1">
        <div className="space-y-1 pr-12">
          <h3 className="text-[18px] font-bold text-gray-900 leading-tight">
            {item.product_name}
          </h3>

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

        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <span className="text-[14px] font-bold text-gray-900 mr-1">
            Quantity:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdate(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-9 h-9 rounded-full border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 cursor-pointer transition-colors"
            >
              <FiMinus size={16} />
            </button>
            <div className="w-10 h-9 rounded-full border border-gray-100 flex items-center justify-center text-sm font-bold text-gray-900 bg-white">
              {item.quantity}
            </div>
            <button
              onClick={() => onUpdate(item.id, item.quantity + 1)}
              className="w-9 h-9 rounded-full border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <FiPlus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Delete Button */}
      <button
        onClick={() => onRemove(item.id)}
        className="absolute top-4 right-4 w-11 h-11 rounded-full border border-red-100 bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all cursor-pointer"
      >
        <RiDeleteBinLine size={20} />
      </button>
    </div>
  );
};

export default CartCard;
