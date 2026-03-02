'use client';

import { useState } from 'react';
import { GoStarFill } from 'react-icons/go';
import { TbCurrencyTaka } from 'react-icons/tb';
import { BsCart3 } from 'react-icons/bs';
import { MdArrowForwardIos } from 'react-icons/md';
import { FiMinus, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { useCart } from '../../../../hooks/useCart';

const ProductSummaryCard = ({ product }) => {
  const { addItem, isUpdating } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Fallback values for missing data
  const categoryName = product?.category_name || 'Not Available';
  const productName = product?.name || 'Not Available';
  const ingredientName = product?.ingredient_name || 'Not Available';
  const brandName = product?.brand_name || 'Not Available';
  const unitLabel = product?.unit_label || 'Not Available';
  const dosage = product?.dosage || 'Not Available';
  const stockCount = product?.quantity_in_stock ?? 0;
  const isOutOfStock = stockCount <= 0;

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < stockCount) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = async () => {
    const productId = product?.id;

    if (!productId) {
      alert('Product information is missing.');
      return;
    }

    if (isOutOfStock) {
      alert('This product is currently out of stock.');
      return;
    }

    const success = await addItem(productId, quantity);
    if (success) {
      // Success feedback is handled by CartContext/Badge updates,
      // but we can add a local toast/alert if needed.
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 p-6 sm:p-8 w-full space-y-6 transition-all">
      {/* Category */}
      <p className="text-[12px] font-black text-(--color-success-500) uppercase tracking-[0.15em]">
        {categoryName}
      </p>

      {/* Product Name & Brand */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
          {productName}
        </h1>
        <div className="flex flex-col gap-1">
          <p className="text-base text-gray-500 font-medium">
            {ingredientName}
          </p>
          <button className="flex items-center gap-1.5 text-sm font-bold text-(--color-primary-500) hover:underline cursor-pointer w-fit">
            {brandName}
            <MdArrowForwardIos size={12} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg">
          <GoStarFill className="text-[#FFC831]" />
          <span className="font-bold text-gray-900 text-sm">
            {parseFloat(product?.rating_avg || 0).toFixed(1)}
          </span>
        </div>
        <span className="text-sm text-gray-400 font-medium">
          ({product?.review_count || 0} Reviews)
        </span>
      </div>

      {/* Price Section */}
      <div className="space-y-1 pt-2">
        <div className="flex items-baseline gap-3">
          <span className="flex items-center text-4xl font-black text-gray-900">
            <TbCurrencyTaka className="text-4xl -ml-1" />
            {parseFloat(product?.price || 0).toLocaleString()}
          </span>
          {product?.original_price &&
            parseFloat(product.original_price) > parseFloat(product.price) && (
              <span className="flex items-center text-lg text-gray-400 line-through font-medium">
                <TbCurrencyTaka />
                {parseFloat(product.original_price).toLocaleString()}
              </span>
            )}
        </div>
        <p className="text-sm text-gray-500 font-bold">{unitLabel}</p>
      </div>

      <div className="h-px bg-gray-50 w-full" />

      {/* Dosage Info (Real API Data) */}
      <div className="space-y-3">
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
          Product Strength
        </p>
        <div className="flex gap-2 flex-wrap">
          <span className="px-6 py-2.5 rounded-full text-sm font-bold bg-(--color-primary-500) text-white border border-(--color-primary-500)">
            {dosage}
          </span>
        </div>
      </div>

      {/* Quantity Selector & Stock Info */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
            Quantity
          </p>
          {isOutOfStock ? (
            <span className="text-xs font-bold text-red-500 flex items-center gap-1">
              <FiAlertCircle /> Out of Stock
            </span>
          ) : (
            <span className="text-xs font-bold text-(--color-success-500)">
              {stockCount} units available
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-3 p-1.5 rounded-full border border-gray-100 ${isOutOfStock ? 'bg-gray-100 opacity-50' : 'bg-gray-50'}`}
          >
            <button
              type="button"
              onClick={handleDecrease}
              disabled={isOutOfStock || quantity <= 1}
              className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <FiMinus size={18} />
            </button>
            <span className="text-lg font-bold text-gray-900 w-8 text-center">
              {isOutOfStock ? 0 : quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              disabled={isOutOfStock || quantity >= stockCount}
              className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <FiPlus size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          onClick={handleAddToCart}
          disabled={isUpdating || isOutOfStock}
          className="flex-1 min-h-[60px] py-4 flex items-center justify-center gap-3 bg-(--color-primary-500) hover:brightness-110 text-white rounded-full text-[15px] font-bold uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          <BsCart3 size={20} className={isUpdating ? 'animate-bounce' : ''} />
          <span>
            {isUpdating
              ? 'Processing...'
              : isOutOfStock
                ? 'Out of Stock'
                : 'Add to Cart'}
          </span>
        </button>

        <button
          disabled={isOutOfStock}
          className="flex-1 min-h-[60px] py-4 flex items-center justify-center gap-2 border-2 border-gray-100 rounded-full text-[15px] font-bold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Buy Now</span>
          <MdArrowForwardIos size={14} />
        </button>
      </div>
    </div>
  );
};

export default ProductSummaryCard;
