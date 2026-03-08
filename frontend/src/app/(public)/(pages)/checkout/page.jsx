'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import {
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiShoppingBag,
} from 'react-icons/fi';
import CartCard from '../cart/components/CartCard';
import ShippingAddressCard from '../cart/components/ShippingAddressCard';
import OrderSummaryCard from '../cart/components/OrderSummaryCard';
import PaymentMethodCard from '../cart/components/PaymentMethodCard';
import { useCart } from '../../hooks/useCart';
import UiButton from '@/app/(public)/components/UiButton';

const Checkout = () => {
  const router = useRouter();
  // Added updateQuantity and removeItem to destructuring
  const {
    items,
    summary,
    isLoading,
    error,
    placeOrder,
    refresh,
    updateQuantity,
    removeItem,
  } = useCart();

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('BKASH');
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    if (!isLoading && items.length === 0 && !orderSuccess) {
      router.replace('/cart');
    }
  }, [items, isLoading, router, orderSuccess]);

  const handleConfirmOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select a shipping address');
      return;
    }

    const orderPayload = {
      shipping_address_id: Number(selectedAddressId),
      payment_method: paymentMethod,
      notes: '',
    };

    if (summary?.coupon_code) {
      orderPayload.coupon_code = summary.coupon_code;
    }

    const result = await placeOrder(orderPayload);
    if (result) {
      setOrderSuccess(result);
    }
  };

  if (isLoading && !orderSuccess) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="w-full px-4 md:px-7 pt-10 pb-28 flex justify-center items-center animate-in fade-in duration-700">
        <div className="bg-white rounded-[32px] border border-gray-100 p-8 md:p-16 max-w-3xl w-full flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-(--success-50) border-2 border-(--success-100) text-(--success-500) rounded-full flex items-center justify-center mb-8">
            <FiCheckCircle size={60} strokeWidth={1.5} />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Order Placed Successfully!
          </h1>

          <p className="text-gray-500 font-medium text-lg leading-relaxed mb-2">
            Thank you for your purchase.
          </p>
          <p className="text-gray-500 font-medium text-lg mb-10">
            Your order ID is{' '}
            <span className="text-gray-900 font-bold">#{orderSuccess.id}</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
            <Link href="/user/orders" className="w-full">
              <UiButton className="w-full h-14">
                <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                  <span>Track Order</span>
                  <FiArrowRight />
                </div>
              </UiButton>
            </Link>
            <Link href="/" className="w-full">
              <UiButton variant="outline" className="w-full h-14">
                <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                  <FiShoppingBag />
                  <span>Continue Shopping</span>
                </div>
              </UiButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-7 pt-7 pb-28 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex items-center gap-5 mb-8">
        <Link href="/cart">
          <button className="border border-gray-100 bg-white rounded-full px-6 py-2 text-center text-(--color-primary-500) flex gap-2 items-center text-sm font-bold cursor-pointer hover:bg-gray-50 transition-all">
            <MdKeyboardArrowLeft size={20} />
            Back to Cart
          </button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Check Out
        </h1>
      </div>

      {/* Error Display Section */}
      {error && (
        <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-[24px] flex items-center gap-4 text-red-600 animate-in slide-in-from-top-2">
          <FiAlertCircle className="shrink-0" size={24} />
          <div>
            <p className="text-sm font-bold uppercase tracking-wider">
              Order Failed
            </p>
            <p className="text-sm font-medium opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Main Checkout Grid */}
      <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Shipping & Payment */}
        <div className="w-full lg:w-[42%] flex flex-col gap-8">
          <ShippingAddressCard
            onAddressSelect={id => setSelectedAddressId(id)}
          />
          <PaymentMethodCard
            selected={paymentMethod}
            onSelect={setPaymentMethod}
          />
        </div>

        {/* Right Column: Cart Review & Summary */}
        <div className="w-full lg:w-[58%] flex flex-col gap-8">
          <div className="bg-white border border-gray-100 rounded-[32px] p-6 sm:p-8 transition-all">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">
              Review Items ({items.length})
            </h2>
            <div className="flex flex-col gap-4">
              {items.map(item => (
                <CartCard
                  key={item.id}
                  item={item}
                  onUpdate={updateQuantity} // Passed function
                  onRemove={removeItem} // Passed function
                />
              ))}
            </div>
          </div>

          <OrderSummaryCard
            summary={summary}
            items={items}
            refresh={refresh}
            onPlaceOrder={handleConfirmOrder}
          />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
