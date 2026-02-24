'use client';

import React from 'react';
import Link from 'next/link';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import CartCard from '../cart/components/CartCard';
import ShippingAddressCard from '../cart/components/ShippingAddressCard';
import OrderSummaryCard from '../cart/components/OrderSummaryCard';
import PaymentMethodCard from '../cart/components/PaymentMethodCard';

const Checkout = () => {
  return (
    <div className="w-full px-4 md:px-7 pt-7 pb-28 animate-in fade-in duration-700">
      {/* 1. Page Header */}
      <div className="flex items-center gap-5 mb-8">
        <Link href="/cart">
          <button className="border border-gray-100 bg-white rounded-full px-6 py-2 text-center text-(--color-primary-500) flex gap-2 items-center text-sm font-bold cursor-pointer hover:bg-gray-50 transition-all">
            <MdKeyboardArrowLeft size={20} />
            Back
          </button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Check Out
        </h1>
      </div>

      {/* 2. Main Checkout Grid */}
      <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Shipping & Payment (Stacked on mobile, 42% width on desktop) */}
        <div className="w-full lg:w-[42%] flex flex-col gap-8">
          <ShippingAddressCard />
          <PaymentMethodCard />
        </div>

        {/* Right Column: Cart Review & Summary (Stacked on mobile, 58% width on desktop) */}
        <div className="w-full lg:w-[58%] flex flex-col gap-8">
          {/* Cart Products Review Container */}
          <div className="bg-white rounded-[32px] border border-gray-100 p-6 sm:p-8 transition-all">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">
              Cart Product
            </h2>
            <div className="flex flex-col gap-4">
              <CartCard />
              <CartCard />
            </div>
          </div>

          {/* Order Summary / Pricing Details */}
          <OrderSummaryCard />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
