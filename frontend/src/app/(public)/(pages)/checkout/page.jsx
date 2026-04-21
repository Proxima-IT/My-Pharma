'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MdKeyboardArrowLeft,
  MdTimer,
  MdLocalShipping,
  MdFlashOn,
} from 'react-icons/md';
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
import { useCartContext } from '../../context/CartContext';
import { fetchDeliveryDurationsApi } from '../../api/cartApi';
import UiButton from '@/app/(public)/components/UiButton';
import { formatCurrency } from '@/app/(user)/lib/formatters';

const Checkout = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    items,
    summary,
    isLoading,
    error,
    placeOrder,
    refresh,
    updateQuantity,
    removeItem,
    appliedCoupon,
  } = useCart();

  const { selectedDeliveryId, updateDeliveryOption } = useCartContext();

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('BKASH');
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [callbackMessage, setCallbackMessage] = useState('');

  useEffect(() => {
    const loadDeliveryOptions = async () => {
      try {
        const token = localStorage.getItem('access_token');
        // Passing token to fix 401 Unauthorized error
        const data = await fetchDeliveryDurationsApi(token);
        const activeOptions = Array.isArray(data) ? data : data.results || [];
        setDeliveryOptions(activeOptions.filter(opt => opt.is_active));

        // Default to first option if none selected
        if (!selectedDeliveryId && activeOptions.length > 0) {
          updateDeliveryOption(activeOptions[0].id);
        }
      } catch (err) {
        console.error('Failed to load delivery options', err);
      }
    };
    loadDeliveryOptions();
  }, [selectedDeliveryId, updateDeliveryOption]);

  useEffect(() => {
    const paymentStatus = (
      searchParams.get('payment_status') || ''
    ).toLowerCase();
    if (!paymentStatus) {
      setCallbackMessage('');
      return;
    }

    if (paymentStatus === 'failed') {
      setCallbackMessage(
        'Payment failed. Please try again or choose another payment method.',
      );
      return;
    }
    if (paymentStatus === 'cancelled') {
      setCallbackMessage(
        'Payment was cancelled. You can review your order and try again.',
      );
      return;
    }
    setCallbackMessage('');
  }, [searchParams]);

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
      delivery_duration_id: selectedDeliveryId,
      payment_method: paymentMethod,
      notes: '',
    };

    if (appliedCoupon?.code) {
      orderPayload.coupon_code = appliedCoupon.code;
    }

    const result = await placeOrder(orderPayload);
    if (result) {
      // Always show success screen first — order is created for all methods
      setOrderSuccess(result);
    }
  };

  const getDeliveryIcon = type => {
    switch (type) {
      case 'SAME_DAY':
        return <MdTimer size={24} />;
      case 'EXPRESS':
        return <MdFlashOn size={24} />;
      default:
        return <MdLocalShipping size={24} />;
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
    const isOnlinePayment =
      orderSuccess.payment_required && orderSuccess.gateway_url;
    return (
      <div className="w-full px-4 md:px-7 pt-10 pb-28 flex justify-center items-center animate-in fade-in duration-700">
        <div className="bg-white rounded-[32px] border border-gray-100 p-8 md:p-16 max-w-3xl w-full flex flex-col items-center text-center shadow-sm">
          <div className="w-24 h-24 bg-(--success-50) border-2 border-(--success-100) text-(--success-500) rounded-full flex items-center justify-center mb-8">
            <FiCheckCircle size={60} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-500 font-medium text-lg leading-relaxed mb-2">
            Thank you for your purchase.
          </p>
          <p className="text-gray-500 font-medium text-lg mb-4">
            Your order ID is{' '}
            <span className="text-gray-900 font-bold">
              #{orderSuccess.id}
            </span>
          </p>

          {/* Payment Status Badge */}
          {isOnlinePayment ? (
            <div className="mb-8 px-5 py-2.5 bg-amber-50 border border-amber-200 rounded-full">
              <span className="text-amber-700 text-sm font-bold uppercase tracking-wider">
                ⏳ Payment Pending
              </span>
            </div>
          ) : (
            <div className="mb-8 px-5 py-2.5 bg-blue-50 border border-blue-200 rounded-full">
              <span className="text-blue-700 text-sm font-bold uppercase tracking-wider">
                💵 Cash on Delivery
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
            {isOnlinePayment ? (
              <>
                <a href={orderSuccess.gateway_url} className="w-full">
                  <UiButton className="w-full h-14 bg-emerald-600 hover:bg-emerald-700">
                    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                      <span>Pay Now</span>
                      <FiArrowRight />
                    </div>
                  </UiButton>
                </a>
                <Link
                  href={`/user/orders/${orderSuccess.id}`}
                  className="w-full"
                >
                  <UiButton variant="outline" className="w-full h-14">
                    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                      <span>Pay Later / Track Order</span>
                      <FiArrowRight />
                    </div>
                  </UiButton>
                </Link>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-7 pt-7 pb-28 animate-in fade-in duration-700">
      <div className="flex items-center gap-5 mb-8">
        <Link href="/cart">
          <button className="border border-gray-100 bg-white rounded-full px-6 py-2 text-center text-(--color-primary-500) flex gap-2 items-center text-sm font-bold cursor-pointer hover:bg-gray-50 transition-all shadow-none">
            <MdKeyboardArrowLeft size={20} />
            Back to Cart
          </button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Check Out
        </h1>
      </div>

      {(error || callbackMessage) && (
        <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-[24px] flex items-center gap-4 text-red-600 animate-in slide-in-from-top-2 shadow-none">
          <FiAlertCircle className="shrink-0" size={24} />
          <div>
            <p className="text-sm font-bold uppercase tracking-wider">
              Order Failed
            </p>
            <p className="text-sm font-medium opacity-90">
              {callbackMessage || error}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-[42%] flex flex-col gap-8">
          <ShippingAddressCard
            onAddressSelect={id => setSelectedAddressId(id)}
          />

          {/* Delivery Options Selection */}
          <div className="bg-white border border-gray-100 rounded-[32px] p-6 sm:p-8 transition-all shadow-none">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">
              Delivery Time
            </h2>
            <div className="flex flex-col gap-3">
              {deliveryOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => updateDeliveryOption(option.id)}
                  className={`flex items-center justify-between p-4 rounded-[24px] border transition-all cursor-pointer text-left shadow-none ${
                    Number(selectedDeliveryId) === Number(option.id)
                      ? 'border-(--color-primary-500) bg-(--color-primary-25)'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        Number(selectedDeliveryId) === Number(option.id)
                          ? 'bg-(--color-primary-100) text-(--color-primary-600)'
                          : 'bg-gray-50 text-gray-400'
                      }`}
                    >
                      {getDeliveryIcon(option.delivery_type)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm uppercase tracking-tight">
                        {option.name}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        Estimated: {option.days}{' '}
                        {option.days > 1 ? 'days' : 'day'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-black ${Number(option.extra_charge) > 0 ? 'text-gray-900' : 'text-(--color-success-600)'}`}
                    >
                      {Number(option.extra_charge) > 0
                        ? `+${formatCurrency(option.extra_charge)}`
                        : 'FREE'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <PaymentMethodCard
            selected={paymentMethod}
            onSelect={setPaymentMethod}
          />
        </div>

        <div className="w-full lg:w-[58%] flex flex-col gap-8">
          <div className="bg-white border border-gray-100 rounded-[32px] p-6 sm:p-8 transition-all shadow-none">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">
              Review Items ({items.length})
            </h2>
            <div className="flex flex-col gap-4">
              {items.map(item => (
                <CartCard
                  key={item.id}
                  item={item}
                  onUpdate={updateQuantity}
                  onRemove={removeItem}
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
