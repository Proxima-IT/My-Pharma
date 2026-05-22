'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IoPricetagOutline } from 'react-icons/io5';
import { FiChevronRight, FiCheck, FiX } from 'react-icons/fi';
import { formatCurrency } from '@/app/(user)/lib/formatters';
import { useCart } from '../../../hooks/useCart';

/**
 * OrderSummaryCard Component
 * Updated: Prioritizes onPlaceOrder callback to allow external AuthModal triggering.
 * Features: Displays subtotal_before_discount and detailed shipping components.
 */
const OrderSummaryCard = ({
  summary: propSummary,
  items = [],
  onPlaceOrder,
  applyCoupon: customApplyCoupon,
  removeCoupon: customRemoveCoupon,
  appliedCoupon: customAppliedCoupon,
  isApplyingCoupon: customIsApplyingCoupon,
  error: customError,
}) => {
  const router = useRouter();
  const cartHook = useCart();

  const applyCoupon = customApplyCoupon || cartHook.applyCoupon;
  const removeCoupon = customRemoveCoupon || cartHook.removeCoupon;
  const appliedCoupon =
    customAppliedCoupon !== undefined ? customAppliedCoupon : cartHook.appliedCoupon;
  const isApplyingCoupon =
    customIsApplyingCoupon !== undefined
      ? customIsApplyingCoupon
      : cartHook.isApplyingCoupon;
  const hookError = customError !== undefined ? customError : cartHook.error;
  const cartSummary = cartHook.summary;

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

  // 2. Map display data using persisted backend fields including delivery breakdown.
  const hasBackendSummary = activeSummary?.base_delivery_fee != null;
  const displayData = {
    subtotal: parseFloat(
      activeSummary?.sub_total || calculatedValues.subtotal || 0,
    ),
    discount: parseFloat(activeSummary?.discount_amount || 0),
    // Breakdown fields for shipping — trust backend values (including 0) when present
    baseDelivery: hasBackendSummary
      ? parseFloat(activeSummary.base_delivery_fee)
      : parseFloat(calculatedValues.deliveryFee || 0),
    optionCharge: parseFloat(activeSummary?.delivery_option_charge || 0),
    optionName: activeSummary?.delivery_option_name || '',
    // Total delivery = base + option charge (already computed by backend as delivery_fee)
    totalDelivery: hasBackendSummary
      ? parseFloat(activeSummary.delivery_fee || 0)
      : parseFloat(calculatedValues.deliveryFee || 0),
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

  /**
   * handleAction
   * Refactored: Prioritizes onPlaceOrder prop to allow the parent (Cart/Checkout)
   * to handle authentication logic (like showing the AuthModal).
   */
  const handleAction = () => {
    // If a custom action is provided (e.g. from Cart/Checkout pages), execute it.
    // This allows the parent to trigger the Login Modal if needed.
    if (onPlaceOrder) {
      onPlaceOrder();
      return;
    }

    // Fallback logic for standalone use
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoginError('Please Login your account to order the product');
      setTimeout(() => setLoginError(''), 5000);
      return;
    }
    router.push('/checkout');
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-6 sm:p-8 w-full transition-all shadow-none">
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

        {/* Row 3: Delivery Fee (single row — shows selected option's charge) */}
        <SummaryRow
          label={displayData.optionName || 'Delivery Fee'}
          value={
            displayData.totalDelivery > 0
              ? formatCurrency(displayData.totalDelivery)
              : 'FREE'
          }
          isFree={displayData.totalDelivery <= 0}
        />
      </div>

      <div className="h-px bg-gray-100 w-full my-6" />

      {/* Final Total */}
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
              disabled={isApplyingCoupon}
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
          className="w-full h-14 bg-(--color-primary-500) hover:bg-(--color-primary-600) transition-all text-white text-[15px] font-bold uppercase tracking-[0.1em] rounded-full flex items-center justify-center gap-3 cursor-pointer shadow-none"
        >
          <span>{onPlaceOrder ? 'Confirm Order' : 'Place Order'}</span>
          <FiChevronRight size={20} strokeWidth={3} />
        </button>
        {loginError && !onPlaceOrder && (
          <p className="text-[13px] font-bold text-red-500 text-center animate-in fade-in uppercase tracking-tighter">
            {loginError}
          </p>
        )}
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value, isDiscount = false, isFree = false }) => (
  <div className="flex items-center justify-between w-full">
    <span className="text-[14px] font-medium text-gray-500 uppercase tracking-wide">
      {label}
    </span>
    <div className="flex items-center gap-3">
      <span className="text-gray-300 font-light">-</span>
      <span
        className={`text-[18px] font-bold ${isDiscount || isFree ? 'text-(--color-success-500)' : 'text-gray-900'}`}
      >
        {value}
      </span>
    </div>
  </div>
);

export default OrderSummaryCard;
