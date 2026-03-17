'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IoPricetagOutline } from 'react-icons/io5';
import { FiChevronRight, FiCheck, FiX } from 'react-icons/fi';
import { formatCurrency } from '@/app/(user)/lib/formatters';
import { useCart } from '../../../hooks/useCart';

/**
 * OrderSummaryCard Component
 * Updated: Integrated with stateful backend coupon persistence.
 * Features: Displays subtotal_before_discount and handles server-side coupon removal.
 */
const OrderSummaryCard = ({
  summary: propSummary,
  items = [],
  onPlaceOrder,
}) => {
  const router = useRouter();
  const {
    applyCoupon,
    removeCoupon,
    appliedCoupon,
    isApplyingCoupon,
    error: hookError,
    summary: cartSummary,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [loginError, setLoginError] = useState('');

  // 1. Manual Calculation Fallback (Used for Guest/Initial states)
  const calculatedValues = useMemo(() => {
    const subtotal = items.reduce(
      (acc, item) =>
        acc + parseFloat(item.current_price || 0) * (item.quantity || 0),
      0,
    );
    return { subtotal, deliveryFee: 150 };
  }, [items]);

  // Prioritize the hook's summary (which now maps subtotal_before_discount)
  const activeSummary = cartSummary || propSummary;

  useEffect(() => {
    if (appliedCoupon) {
      setCouponCode(appliedCoupon.code);
    } else {
      setCouponCode('');
    }
  }, [appliedCoupon]);

  const isApplied = !!appliedCoupon;

  // 2. Map display data using persisted backend fields
  const displayData = {
    // sub_total in hook is mapped to backend's subtotal_before_discount
    subtotal: parseFloat(
      activeSummary?.sub_total || calculatedValues.subtotal || 0,
    ),
    discount: parseFloat(activeSummary?.discount_amount || 0),
    deliveryFee: parseFloat(
      activeSummary?.shipping_charge || calculatedValues.deliveryFee || 0,
    ),
    total: parseFloat(
      activeSummary?.total_amount ||
        calculatedValues.subtotal + calculatedValues.deliveryFee,
    ),
    discountLabel: isApplied ? `Discount (${appliedCoupon.code})` : 'Discount',
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || isApplyingCoupon) return;
    await applyCoupon(couponCode.trim());
  };

  const handleRemoveCoupon = async () => {
    await removeCoupon();
    setCouponCode('');
  };

  const handleAction = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoginError('Please Login your account to order the product');
      setTimeout(() => setLoginError(''), 5000);
      return;
    }
    if (onPlaceOrder) {
      onPlaceOrder();
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-6 sm:p-8 w-full transition-all shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">
        Order Summary
      </h2>

      <div className="space-y-4 mb-6">
        {/* Row 1: Subtotal (Original Price) */}
        <SummaryRow
          label="Subtotal"
          value={formatCurrency(displayData.subtotal)}
        />

        {/* Row 2: Discount (Persisted Savings) */}
        {displayData.discount > 0 && (
          <SummaryRow
            label={displayData.discountLabel}
            value={`-${formatCurrency(displayData.discount)}`}
            isDiscount
          />
        )}

        {/* Row 3: Delivery Fee */}
        <SummaryRow
          label="Delivery Fee"
          value={formatCurrency(displayData.deliveryFee)}
        />
      </div>

      <div className="h-px bg-gray-100 w-full my-6" />

      {/* Final Total: ((Subtotal - Discount) + Delivery) */}
      <div className="flex items-center justify-between mb-8">
        <span className="text-lg font-bold text-gray-900 uppercase tracking-wider">
          Total
        </span>
        <span className="text-3xl font-bold text-(--color-primary-500)">
          {formatCurrency(displayData.total)}
        </span>
      </div>

      {/* Coupon Management Section */}
      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-3 flex-1 bg-gray-50 border rounded-full px-5 py-3 transition-all ${hookError ? 'border-red-200' : 'border-gray-100'}`}
          >
            <IoPricetagOutline
              className={`-rotate-90 ${isApplied ? 'text-(--color-success-500)' : 'text-gray-400'}`}
              size={20}
            />
            <input
              type="text"
              placeholder="Enter Coupon Code"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value)}
              disabled={isApplied || isApplyingCoupon}
              className="bg-transparent text-[15px] font-medium text-gray-900 placeholder-gray-400 outline-none w-full disabled:opacity-50"
            />
          </div>

          {isApplied ? (
            <button
              onClick={handleRemoveCoupon}
              disabled={isUpdating}
              className="h-[52px] w-[52px] flex items-center justify-center rounded-full bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-all cursor-pointer disabled:opacity-50"
            >
              <FiX size={20} />
            </button>
          ) : (
            <button
              onClick={handleApplyCoupon}
              disabled={!couponCode || isApplyingCoupon}
              className="h-[52px] px-8 rounded-full text-sm font-bold uppercase tracking-widest transition-all cursor-pointer bg-(--color-primary-25) text-(--color-primary-500) border border-(--color-primary-50) hover:bg-(--color-primary-500) hover:text-white disabled:opacity-50"
            >
              {isApplyingCoupon ? '...' : 'Apply'}
            </button>
          )}
        </div>

        {hookError && (
          <p className="text-xs font-bold text-red-500 ml-5 animate-in fade-in">
            {hookError}
          </p>
        )}
        {isApplied && !hookError && (
          <p className="text-xs font-bold text-(--color-success-500) ml-5 uppercase tracking-tighter flex items-center gap-1">
            <FiCheck /> Coupon Applied Successfully!
          </p>
        )}
      </div>

      <div className="space-y-3">
        <button
          onClick={handleAction}
          className="w-full h-14 bg-(--color-primary-500) hover:bg-(--color-primary-600) transition-all text-white text-[15px] font-bold uppercase tracking-[0.1em] rounded-full flex items-center justify-center gap-3 cursor-pointer"
        >
          <span>{onPlaceOrder ? 'Confirm Order' : 'Place Order'}</span>
          <FiChevronRight size={20} strokeWidth={3} />
        </button>
        {loginError && (
          <p className="text-[13px] font-bold text-red-500 text-center animate-in fade-in">
            {loginError}
          </p>
        )}
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value, isDiscount = false }) => (
  <div className="flex items-center justify-between w-full">
    <span className="text-[14px] font-medium text-gray-500 uppercase tracking-wide">
      {label}
    </span>
    <div className="flex items-center gap-3">
      <span className="text-gray-300 font-light">-</span>
      <span
        className={`text-[18px] font-bold ${isDiscount ? 'text-(--color-success-500)' : 'text-gray-900'}`}
      >
        {value}
      </span>
    </div>
  </div>
);

export default OrderSummaryCard;
