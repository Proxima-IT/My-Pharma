'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IoPricetagOutline } from 'react-icons/io5';
import { FiChevronRight, FiCheck } from 'react-icons/fi';
import { formatCurrency } from '@/app/(user)/lib/formatters';

const OrderSummaryCard = ({ summary, items = [], onPlaceOrder, refresh }) => {
  const router = useRouter();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [loginError, setLoginError] = useState(''); // New state for login requirement

  useEffect(() => {
    if (summary?.coupon_code) {
      setCouponCode(summary.coupon_code);
    }
  }, [summary]);

  const isApplied = !!summary?.coupon_code;

  const calculatedValues = useMemo(() => {
    const subtotal = items.reduce(
      (acc, item) =>
        acc + parseFloat(item.current_price || 0) * (item.quantity || 0),
      0,
    );
    const deliveryFee = 150;
    const total = subtotal + deliveryFee;

    return { subtotal, deliveryFee, total };
  }, [items]);

  const displayData = {
    subtotal: parseFloat(
      summary?.subtotal || summary?.sub_total || calculatedValues.subtotal || 0,
    ),
    deliveryFee: parseFloat(
      summary?.delivery_fee ||
        summary?.shipping_charge ||
        calculatedValues.deliveryFee ||
        0,
    ),
    discount: parseFloat(summary?.discount_amount || 0),
    total: parseFloat(
      summary?.total_payable ||
        summary?.total_amount ||
        calculatedValues.total ||
        0,
    ),
    discountLabel: summary?.discount_display || 'Discount',
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    try {
      await refresh(couponCode.trim());
    } catch (err) {
      setCouponError('Invalid or expired coupon code');
    }
  };

  const handleAction = () => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token');

    if (!token) {
      setLoginError('Please Login your account to order the product');
      // Clear error after 5 seconds
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
        <SummaryRow
          label="Subtotal"
          value={formatCurrency(displayData.subtotal)}
        />
        <SummaryRow
          label="Delivery Fee"
          value={formatCurrency(displayData.deliveryFee)}
        />

        {(isApplied || displayData.discount > 0) && (
          <SummaryRow
            label={displayData.discountLabel}
            value={`-${formatCurrency(displayData.discount)}`}
            isDiscount
          />
        )}
      </div>

      <div className="h-px bg-gray-100 w-full my-6" />

      <div className="flex items-center justify-between mb-8">
        <span className="text-lg font-bold text-gray-900 uppercase tracking-wider">
          Total
        </span>
        <span className="text-3xl font-bold text-(--color-primary-500)">
          {formatCurrency(displayData.total)}
        </span>
      </div>

      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-3 flex-1 bg-gray-50 border rounded-full px-5 py-3 transition-all ${couponError ? 'border-red-200' : 'border-gray-100'}`}
          >
            <IoPricetagOutline
              className={`-rotate-90 ${isApplied ? 'text-(--color-success-500)' : 'text-gray-400'}`}
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
                ? 'bg-(--color-success-50) text-(--color-success-500) border border-(--color-success-100)'
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
          <p className="text-xs font-bold text-(--color-success-500) ml-5 uppercase tracking-tighter">
            Coupon Applied!
          </p>
        )}
      </div>

      {/* Action Button Section */}
      <div className="space-y-3">
        <button
          onClick={handleAction}
          className="w-full h-14 bg-(--color-primary-500) hover:bg-(--color-primary-600) transition-all text-white text-[15px] font-bold uppercase tracking-[0.1em] rounded-full flex items-center justify-center gap-3 cursor-pointer"
        >
          <span>{onPlaceOrder ? 'Confirm Order' : 'Place Order'}</span>
          <FiChevronRight size={20} strokeWidth={3} />
        </button>

        {/* Login Error Message */}
        {loginError && (
          <p className="text-[13px] font-bold text-red-500 text-center animate-in fade-in slide-in-from-top-1 duration-300">
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
