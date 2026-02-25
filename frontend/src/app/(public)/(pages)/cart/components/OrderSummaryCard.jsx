'use client';

import React, { useState, useMemo } from 'react';
import { IoPricetagOutline } from 'react-icons/io5';
import { FiChevronRight, FiCheck } from 'react-icons/fi';
import { formatCurrency } from '@/app/(user)/lib/formatters';

const OrderSummaryCard = () => {
  // 1. Local State for Coupon
  const [couponCode, setCouponCode] = useState('');
  const [isApplied, setIsApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  // 2. Mock Cart Data (This represents what would be in your global Cart State)
  const cartItems = [
    { id: 1, name: 'A-fenac 50', price: 1250, quantity: 2 },
    { id: 2, name: 'Monalast 10', price: 430, quantity: 1 },
  ];

  const deliveryFee = 150;

  // 3. Dynamic Calculations based on cartItems
  const { subtotal, discountAmount, total } = useMemo(() => {
    // Calculate Subtotal: Sum of (Price * Quantity)
    const calcSubtotal = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    // Calculate Discount (e.g., 15% if coupon "SAVE15" is applied)
    const calcDiscount = isApplied ? calcSubtotal * 0.15 : 0;

    // Final Total
    const calcTotal = calcSubtotal + deliveryFee - calcDiscount;

    return {
      subtotal: calcSubtotal,
      discountAmount: calcDiscount,
      total: calcTotal,
    };
  }, [isApplied]); // In real app, add cartItems to dependency array

  // 4. Handlers
  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'SAVE15') {
      setIsApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code (Try SAVE15)');
      setIsApplied(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-6 sm:p-8 w-full transition-all">
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">
        Order Summary
      </h2>

      {/* Dynamic Line Items */}
      <div className="space-y-4 mb-6">
        <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
        <SummaryRow label="Delivery Fee" value={formatCurrency(deliveryFee)} />

        {isApplied && (
          <SummaryRow
            label="Coupon Discount (15%)"
            value={`-${formatCurrency(discountAmount)}`}
            isDiscount
          />
        )}
      </div>

      <div className="h-px bg-gray-100 w-full my-6" />

      {/* Dynamic Total */}
      <div className="flex items-center justify-between mb-8">
        <span className="text-lg font-bold text-gray-900 uppercase tracking-wider">
          Total
        </span>
        <span className="text-3xl font-bold text-(--color-primary-500)">
          {formatCurrency(total)}
        </span>
      </div>

      {/* Interactive Coupon Section */}
      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-3 flex-1 bg-gray-50 border rounded-full px-5 py-3 transition-all ${couponError ? 'border-red-200' : 'border-gray-100'}`}
          >
            <IoPricetagOutline
              className={`-rotate-90 ${isApplied ? 'text-(--success-500)' : 'text-gray-400'}`}
              size={20}
            />
            <input
              type="text"
              placeholder="Enter Coupon Code"
              value={couponCode}
              onChange={e => {
                setCouponCode(e.target.value);
                setCouponError('');
              }}
              disabled={isApplied}
              className="bg-transparent text-[15px] font-medium text-gray-900 placeholder-gray-400 outline-none w-full disabled:opacity-50"
            />
          </div>
          <button
            onClick={handleApplyCoupon}
            disabled={!couponCode || isApplied}
            className={`h-[52px] px-8 rounded-full text-sm font-bold uppercase tracking-widest transition-all cursor-pointer ${
              isApplied
                ? 'bg-(--success-50) text-(--success-500) border border-(--success-100)'
                : 'bg-(--color-primary-25) text-(--color-primary-500) border border-(--color-primary-50) hover:bg-(--color-primary-500) hover:text-white'
            }`}
          >
            {isApplied ? <FiCheck size={20} /> : 'Apply'}
          </button>
        </div>
        {couponError && (
          <p className="text-xs font-bold text-red-500 ml-5">{couponError}</p>
        )}
        {isApplied && (
          <p className="text-xs font-bold text-(--success-500) ml-5 uppercase tracking-tighter">
            Discount Applied!
          </p>
        )}
      </div>

      {/* Place Order Button */}
      <button className="w-full h-14 bg-(--color-primary-500) hover:bg-(--color-primary-600) transition-all text-white text-[15px] font-bold uppercase tracking-[0.1em] rounded-full flex items-center justify-center gap-3 cursor-pointer">
        <span>Place Order</span>
        <FiChevronRight size={20} strokeWidth={3} />
      </button>
    </div>
  );
};

// Helper Component
const SummaryRow = ({ label, value, isDiscount = false }) => (
  <div className="flex items-center justify-between w-full">
    <span className="text-[14px] font-medium text-gray-500 uppercase tracking-wide">
      {label}
    </span>
    <div className="flex items-center gap-3">
      <span className="text-gray-300 font-light">-</span>
      <span
        className={`text-[18px] font-bold ${isDiscount ? 'text-(--success-500)' : 'text-gray-900'}`}
      >
        {value}
      </span>
    </div>
  </div>
);

export default OrderSummaryCard;