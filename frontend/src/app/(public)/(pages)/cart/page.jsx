'use client';

import Link from 'next/image';
import LinkComponent from 'next/link';
import React from 'react';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import CartCard from './components/CartCard';
import DealsSection from '../home/components/DealsSection';
import SmartHealthBundle from '../home/components/SmartHealthBundle';
import ShippingAddressCard from './components/ShippingAddressCard';
import OrderSummaryCard from './components/OrderSummaryCard';

const Cart = () => {
  return (
    <div className="w-full px-4 md:px-7 pt-7 pb-28">
      {/* Page Heading */}
      <div className="flex items-center gap-5 mb-8">
        <LinkComponent href="/products">
          <button className="border border-gray-100 bg-white rounded-full px-6 py-2 text-center text-(--color-primary-500) flex gap-2 items-center text-sm font-bold cursor-pointer hover:bg-gray-50 transition-all">
            <MdKeyboardArrowLeft size={20} />
            Back
          </button>
        </LinkComponent>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Your Cart
        </h1>
      </div>

      {/* Cart Content Grid */}
      <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Cart Items */}
        <div className="w-full lg:w-[58%] flex flex-col gap-4">
          <CartCard />
          <CartCard />
        </div>

        {/* Right Column: Address & Summary */}
        <div className="w-full lg:w-[42%] flex flex-col gap-8">
          <ShippingAddressCard />
          <OrderSummaryCard />
        </div>
      </div>

      {/* home page sections */}
      <div className="mt-20 space-y-20">
        <DealsSection />
        <SmartHealthBundle />
      </div>
    </div>
  );
};

export default Cart;
