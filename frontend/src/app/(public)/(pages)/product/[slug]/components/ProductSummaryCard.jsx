'use client';

import { useState } from 'react';
import { GoStarFill } from 'react-icons/go';
import { TbCurrencyTaka } from 'react-icons/tb';
import { BsCart3 } from 'react-icons/bs';
import { MdArrowForwardIos } from 'react-icons/md';
import { FiMinus, FiPlus } from 'react-icons/fi';

const dosages = ['6mg', '12mg', '24mg', '36mg'];

const ProductSummaryCard = () => {
  const [selectedDosage, setSelectedDosage] = useState('12mg');
  const [quantity, setQuantity] = useState(2);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 p-6 sm:p-8 w-full space-y-6 transition-all">
      {/* Category */}
      <p className="text-[12px] font-bold text-(--success-500) uppercase tracking-widest">
        Body Lotion & Cream
      </p>

      {/* Product Name & Brand */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">
          Scabo 12 Tablets
        </h1>
        <p className="text-base text-gray-500 font-medium">
          Ivermectin BP 12 mg
        </p>
        <button className="flex items-center gap-1.5 text-sm font-bold text-(--color-primary-500) hover:underline cursor-pointer">
          Delta Pharma Limited
          <MdArrowForwardIos size={12} strokeWidth={2} />
        </button>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
          <GoStarFill className="text-[#FFC831]" />
          <span className="font-bold text-gray-900 text-sm">5.0</span>
        </div>
        <span className="text-sm text-gray-400 font-medium">
          (1.2k+ Reviews)
        </span>
      </div>

      {/* Price Section */}
      <div className="space-y-1 pt-2">
        <div className="flex items-baseline gap-3">
          <span className="flex items-center text-3xl font-bold text-gray-900">
            <TbCurrencyTaka className="text-4xl" />
            1250
          </span>
          <span className="flex items-center text-lg text-gray-400 line-through font-medium">
            <TbCurrencyTaka />
            1900.99
          </span>
        </div>
        <p className="text-sm text-gray-500 font-medium">
          10 Tablets (1 Strip)
        </p>
      </div>

      <div className="h-px bg-gray-50 w-full" />

      {/* Dosage Selection */}
      <div className="space-y-3">
        <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Available Dosage
        </p>
        <div className="flex gap-2 flex-wrap">
          {dosages.map(dose => (
            <button
              key={dose}
              onClick={() => setSelectedDosage(dose)}
              className={`px-5 py-2 rounded-full text-sm font-bold border transition-all cursor-pointer ${
                selectedDosage === dose
                  ? 'bg-(--color-primary-500) text-white border-(--color-primary-500)'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-(--color-primary-500) hover:text-(--color-primary-500)'
              }`}
            >
              {dose}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="space-y-3">
        <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Quantity
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-full border border-gray-100">
            <button
              onClick={handleDecrease}
              className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
            >
              <FiMinus size={18} />
            </button>
            <span className="text-lg font-bold text-gray-900 w-6 text-center">
              {quantity}
            </span>
            <button
              onClick={handleIncrease}
              className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
            >
              <FiPlus size={18} />
            </button>
          </div>
          <p className="text-sm text-gray-400 font-medium">
            {quantity} Strip ({quantity * 10} Tablets)
          </p>
        </div>
      </div>

      {/* Action Buttons - Fixed mobile padding and ensured equal width */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button className="flex-1 min-h-[56px] py-4 flex items-center justify-center gap-3 bg-(--color-primary-500) hover:bg-(--color-primary-600) text-white rounded-full text-[15px] font-bold uppercase tracking-widest transition-all cursor-pointer">
          <BsCart3 size={20} />
          <span>Add to Cart</span>
        </button>
        <button className="flex-1 min-h-[56px] py-4 flex items-center justify-center gap-2 border-2 border-gray-100 rounded-full text-[15px] font-bold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer">
          <span>Buy Now</span>
          <MdArrowForwardIos size={14} />
        </button>
      </div>
    </div>
  );
};

export default ProductSummaryCard;
