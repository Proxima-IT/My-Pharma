'use client';

import Image from 'next/image';
import React from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { TbCurrencyTaka } from 'react-icons/tb';

const BundleCard = ({ bundle }) => {
  return (
    <div
      className={`relative rounded-[40px] w-full h-full flex flex-col overflow-hidden transition-all ${bundle.bgColor}`}
    >
      {/* 1. Top Content Section: Padding keeps text safe from edges */}
      <div className="p-8 sm:p-10 pb-6 w-full flex flex-col items-start gap-4 z-10">
        {/* Text Content */}
        <div className="w-full space-y-1">
          <h3 className="text-2xl sm:text-[32px] font-bold text-gray-900 leading-tight tracking-tight">
            {bundle.title}
          </h3>
          <p className="text-sm sm:text-lg text-gray-600 font-medium opacity-80">
            {bundle.description}
          </p>
        </div>

        {/* Pricing Section */}
        <div className="flex items-center gap-3">
          <div className="flex items-center text-3xl sm:text-[36px] font-bold text-gray-900">
            <TbCurrencyTaka className="text-4xl -ml-1" />
            <span>{bundle.price}</span>
          </div>
          <div className="flex items-center text-lg sm:text-xl text-gray-400 line-through font-medium">
            <TbCurrencyTaka />
            <span>{bundle.oldPrice}</span>
          </div>
        </div>

        {/* Action Button: Fixed background and text color */}
        <button className="relative z-10 mt-6 bg-white rounded-full px-8 py-4 text-(--color-primary-500) flex items-center gap-2 text-sm sm:text-base font-bold cursor-pointer hover:bg-gray-50 transition-all border border-transparent">
          <span>See Package</span>
          {/* Replaced Md icon with FiChevronRight to remove the "square" look */}
          <FiChevronRight size={20} strokeWidth={3} />
        </button>
      </div>

      {/* 
        2. Full-Width Dynamic Image Section: 
        - mt-auto: Pushes the image to the bottom of the card.
        - w-full: Spans the entire width.
      */}
      <div className="w-full mt-auto pointer-events-none">
        <Image
          src={bundle.image}
          alt={bundle.title}
          width={600}
          height={400}
          className="w-full h-auto block object-contain object-bottom"
          priority
        />
      </div>
    </div>
  );
};

export default BundleCard;
