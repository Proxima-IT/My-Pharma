'use client';

import { useState } from 'react';
import { GoStarFill } from 'react-icons/go';
import { TbCurrencyTaka } from 'react-icons/tb';
import { BsCart3 } from 'react-icons/bs';
import { MdArrowForwardIos } from 'react-icons/md';
import { FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '../../../../hooks/useCart';

// Destructure 'product' from props
const ProductSummaryCard = ({ product }) => {
  const { addItem, isUpdating } = useCart();
  const [selectedDosage, setSelectedDosage] = useState('12mg');
  const [quantity, setQuantity] = useState(1);

  const dosages = ['6mg', '12mg', '24mg', '36mg'];

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = async () => {
    // Ensure we have a valid ID from the product object
    const productId = product?.id || product?.pk;

    if (!productId) {
      console.error('Product Object received:', product);
      alert('Product information is missing. Please refresh the page.');
      return;
    }

    const success = await addItem(productId, quantity);
    if (success) {
      alert(`${product.name} added to cart!`);
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 p-6 sm:p-8 w-full space-y-6 transition-all">
      {/* Category */}
      <p className="text-[12px] font-bold text-(--color-success-500) uppercase tracking-widest">
        {product?.category_name || 'Medicine'}
      </p>

      {/* Product Name & Brand */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">
          {product?.name || 'Loading...'}
        </h1>
        <p className="text-base text-gray-500 font-medium">
          {product?.ingredient_name || product?.dosage || 'Generic Info N/A'}
        </p>
        <button className="flex items-center gap-1.5 text-sm font-bold text-(--color-primary-500) hover:underline cursor-pointer">
          {product?.brand_name || 'Manufacturer N/A'}
          <MdArrowForwardIos size={12} strokeWidth={2} />
        </button>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
          <GoStarFill className="text-[#FFC831]" />
          <span className="font-bold text-gray-900 text-sm">
            {product?.rating_avg || '0.0'}
          </span>
        </div>
        <span className="text-sm text-gray-400 font-medium">
          ({product?.review_count || 0} Reviews)
        </span>
      </div>

      {/* Price Section */}
      <div className="space-y-1 pt-2">
        <div className="flex items-baseline gap-3">
          <span className="flex items-center text-3xl font-bold text-gray-900">
            <TbCurrencyTaka className="text-4xl" />
            {parseFloat(product?.price || 0).toLocaleString()}
          </span>
          {product?.original_price && (
            <span className="flex items-center text-lg text-gray-400 line-through font-medium">
              <TbCurrencyTaka />
              {parseFloat(product?.original_price).toLocaleString()}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 font-medium">
          {product?.unit_label || 'Unit N/A'}
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
              type="button"
              onClick={handleDecrease}
              className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
            >
              <FiMinus size={18} />
            </button>
            <span className="text-lg font-bold text-gray-900 w-6 text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
            >
              <FiPlus size={18} />
            </button>
          </div>
          <p className="text-sm text-gray-400 font-medium">
            {quantity} {product?.unit_label?.split(' ')[1] || 'Units'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          onClick={handleAddToCart}
          disabled={isUpdating}
          className="flex-1 min-h-[56px] py-4 flex items-center justify-center gap-3 bg-(--color-primary-500) hover:bg-(--color-primary-600) text-white rounded-full text-[15px] font-bold uppercase tracking-widest transition-all cursor-pointer disabled:opacity-70"
        >
          <BsCart3 size={20} className={isUpdating ? 'animate-pulse' : ''} />
          <span>{isUpdating ? 'Adding...' : 'Add to Cart'}</span>
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
