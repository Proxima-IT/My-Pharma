'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { GoStarFill } from 'react-icons/go';
import { BsCart3 } from 'react-icons/bs';
import { MdArrowForwardIos } from 'react-icons/md';
import { FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '../../../../hooks/useCart';

const ProductSummaryCard = ({ product }) => {
  const { addItem, isUpdating } = useCart();
  const [selectedDosage, setSelectedDosage] = useState('');
  const [quantity, setQuantity] = useState(1);

  const availableDosages = useMemo(() => {
    if (!product?.dosages) return [];
    if (Array.isArray(product.dosages)) return product.dosages;
    return product.dosages
      .split(',')
      .map(d => d.trim())
      .filter(Boolean);
  }, [product?.dosages]);

  useEffect(() => {
    if (availableDosages.length > 0 && !selectedDosage) {
      setSelectedDosage(availableDosages[0]);
    }
  }, [availableDosages, selectedDosage]);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = async () => {
    if (product?.id) {
      // FIX: Attach the selectedDosage state to the product object
      const productWithSelection = {
        ...product,
        selected_dosage: selectedDosage,
      };
      await addItem(productWithSelection, quantity);
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 p-8 w-full space-y-5 transition-all shadow-sm">
      <p className="text-[15px] font-bold text-[#10B981] leading-none">
        {product?.category_name || 'General Healthcare'}
      </p>

      <div className="space-y-2">
        <h1 className="text-[32px] font-bold text-gray-900 leading-tight tracking-tight">
          {product?.name || 'Product Name'}
        </h1>
        <p className="text-[20px] text-[#4B5563] font-medium">
          {product?.ingredient_name || 'Generic Name N/A'}
        </p>

        {product?.brand_name ? (
          <Link
            href={`/products?brand=${product?.brand}`}
            className="flex items-center gap-2 text-[15px] font-bold text-[#1D3583] uppercase tracking-wide hover:underline cursor-pointer w-fit"
          >
            {product.brand_name}
            <MdArrowForwardIos size={14} strokeWidth={2} />
          </Link>
        ) : (
          <span className="text-[14px] font-bold text-gray-400 uppercase tracking-widest">
            No Brand Information
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <GoStarFill className="text-[#FFC831] text-xl" />
        <span className="font-bold text-gray-900 text-[18px]">
          {parseFloat(product?.rating_avg || 0).toFixed(1)}
        </span>
        <span className="text-[16px] text-[#9CA3AF] font-medium">
          ({product?.review_count || 0} Reviews)
        </span>
      </div>

      <div className="h-px bg-gray-100 w-full !mt-6" />

      <div className="space-y-2 pt-1">
        <div className="flex items-center gap-3">
          <span className="text-[32px] font-bold text-gray-900 flex items-center">
            <span className="text-[28px] mr-0.5">৳</span>
            {parseFloat(product?.price || 0).toLocaleString()}
          </span>
          {product?.original_price &&
            parseFloat(product.original_price) > parseFloat(product.price) && (
              <span className="text-[20px] text-[#9CA3AF] line-through font-medium flex items-center">
                <span className="mr-0.5">৳</span>
                {parseFloat(product.original_price).toLocaleString()}
              </span>
            )}
        </div>
        <p className="text-[16px] text-[#4B5563] font-medium">
          {product?.unit_label || 'Per Unit'}
        </p>
      </div>

      <div className="h-px bg-gray-100 w-full !mt-6" />

      {availableDosages.length > 0 && (
        <div className="space-y-4 pt-1">
          <p className="text-[16px] font-bold text-[#6B7280]">
            Available Dosage
          </p>
          <div className="flex gap-3 flex-wrap">
            {availableDosages.map(dose => (
              <button
                key={dose}
                onClick={() => setSelectedDosage(dose)}
                className={`px-8 py-3.5 rounded-full text-[16px] font-bold border transition-all cursor-pointer ${
                  selectedDosage === dose
                    ? 'bg-[#EEF2FF] text-[#1D3583] border-[#EEF2FF]'
                    : 'bg-white text-gray-900 border-gray-100 hover:border-gray-300'
                }`}
              >
                {dose}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4 pt-2">
        <p className="text-[16px] font-bold text-[#6B7280]">Quantity</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleDecrease}
              className="w-12 h-12 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#1D3583] hover:brightness-95 transition-all cursor-pointer"
            >
              <FiMinus size={20} strokeWidth={3} />
            </button>
            <div className="w-28 h-12 bg-white border border-gray-50 rounded-[20px] flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
              <span className="text-[18px] font-bold text-gray-900">
                {quantity}
              </span>
            </div>
            <button
              type="button"
              onClick={handleIncrease}
              className="w-12 h-12 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#1D3583] hover:brightness-95 transition-all cursor-pointer"
            >
              <FiPlus size={20} strokeWidth={3} />
            </button>
          </div>
        </div>
        <p className="text-[16px] text-[#6B7280] font-medium uppercase tracking-wide">
          {quantity} {product?.unit_label?.split(' ')[1] || 'Unit'}(s) Selected
        </p>
      </div>

      <div className="h-px bg-gray-100 w-full !mt-6" />

      <div className="flex gap-4 pt-2">
        <button
          onClick={handleAddToCart}
          disabled={isUpdating}
          className="flex-1 h-[72px] flex items-center justify-center gap-3 bg-[#1D3583] hover:brightness-110 text-white rounded-[40px] text-[18px] font-bold transition-all cursor-pointer disabled:opacity-70 active:scale-[0.98]"
        >
          <BsCart3 size={24} />
          <span>Add to Cart</span>
        </button>
        <button
          onClick={() => router.push('/cart')}
          className="flex-1 h-[72px] flex items-center justify-center gap-2 bg-[#F5F8FF] border border-[#E0E7FF] rounded-[40px] text-[18px] font-bold text-[#1D3583] hover:bg-[#EEF2FF] transition-all cursor-pointer active:scale-[0.98]"
        >
          <span>Buy Now</span>
          <MdArrowForwardIos size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default ProductSummaryCard;
