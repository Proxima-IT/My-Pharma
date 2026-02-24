'use client';

import Image from 'next/image';
import React from 'react';
import { FiMinus, FiPlus } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';
import { formatCurrency } from '@/app/(user)/lib/formatters';

const CartCard = () => {
  // Mock data for UI consistency
  const product = {
    name: 'A-fenac 50',
    generic: 'Diclofenac Sodium BP 50mg',
    unit: '10 Tablets (1 Strip)',
    price: 1250,
    originalPrice: 1900.99,
    quantity: 2,
    image: '/assets/images/cart1.png',
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[24px] p-4 flex flex-col sm:flex-row items-start gap-6 transition-all relative group">
      {/* 1. Image Wrapper */}
      <div className="w-full sm:w-[140px] h-[140px] bg-(--color-imageBG) rounded-[18px] flex items-center justify-center p-4 shrink-0 border border-gray-50">
        <Image
          src={product.image}
          alt={product.name}
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
          {' '}
          {/* Padding right to avoid overlap with delete button */}
          <h3 className="text-[18px] font-bold text-gray-900 leading-tight">
            {product.name}
          </h3>
          {/* Price placed under the Name */}
          <div className="flex items-center gap-3">
            <span className="text-[18px] font-bold text-gray-900">
              {formatCurrency(product.price)}
            </span>
            <span className="text-[13px] text-gray-400 line-through font-medium">
              {formatCurrency(product.originalPrice)}
            </span>
          </div>
          <p className="text-[14px] text-gray-500 font-medium pt-1">
            {product.generic}
          </p>
          <p className="text-[14px] text-gray-700 font-bold">{product.unit}</p>
        </div>

        {/* Bottom Section: Quantity Selector */}
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <span className="text-[14px] font-bold text-gray-900 mr-1">
            Quantity:
          </span>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
              <FiMinus size={16} />
            </button>
            <div className="w-10 h-9 rounded-full border border-gray-100 flex items-center justify-center text-sm font-bold text-gray-900">
              {product.quantity}
            </div>
            <button className="w-9 h-9 rounded-full border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
              <FiPlus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Delete Button - Positioned at Top-Right */}
      <button className="absolute top-4 right-4 w-11 h-11 rounded-full border border-red-100 bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all cursor-pointer">
        <RiDeleteBinLine size={20} />
      </button>
    </div>
  );
};

export default CartCard;
