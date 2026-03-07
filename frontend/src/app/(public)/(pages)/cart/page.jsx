'use client';

import Image from 'next/image';
import LinkComponent from 'next/link';
import React from 'react';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { FiShoppingBag } from 'react-icons/fi';
import CartCard from './components/CartCard';
import DealsSection from '../home/components/DealsSection';
import SmartHealthBundle from '../home/components/SmartHealthBundle';
import ShippingAddressCard from './components/ShippingAddressCard';
import OrderSummaryCard from './components/OrderSummaryCard';
import { useCart } from '../../hooks/useCart';

const Cart = () => {
  const {
    items,
    summary,
    isLoading,
    error,
    updateQuantity,
    removeItem,
    refresh,
  } = useCart();

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-4 md:px-7 pt-7 pb-28 text-center">
        <div className="bg-red-50 border border-red-100 rounded-[32px] p-12 max-w-2xl mx-auto">
          <p className="text-red-600 font-bold">Error loading cart: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-(--color-primary-500) font-bold underline cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-7 pt-7 pb-28">
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

      {items.length > 0 ? (
        <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-[58%] flex flex-col gap-4">
            {items.map((item, index) => (
              <CartCard
                key={item.id || `cart-item-${index}`} // Fixed unique key warning
                item={item}
                onUpdate={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          <div className="w-full lg:w-[42%] flex flex-col gap-8">
            <ShippingAddressCard />
            <OrderSummaryCard
              summary={summary}
              items={items}
              refresh={refresh}
            />
          </div>
        </div>
      ) : (
        <div className="w-full py-20 flex flex-col items-center justify-center bg-white border border-gray-100 rounded-[32px] text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
            <FiShoppingBag size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Your cart is empty
            </h2>
            <p className="text-gray-500 max-w-xs mx-auto">
              Looks like you haven&apos;t added any medicines yet.
            </p>
          </div>
          <LinkComponent href="/products">
            <button className="bg-(--color-primary-500) text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-(--color-primary-600) transition-all cursor-pointer">
              Start Shopping
            </button>
          </LinkComponent>
        </div>
      )}

      <div className="mt-20 space-y-20">
        <DealsSection />
        <SmartHealthBundle />
      </div>
    </div>
  );
};

export default Cart;
