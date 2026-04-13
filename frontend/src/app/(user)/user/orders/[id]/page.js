'use client';

import React, { useEffect, use, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiArrowLeft,
  FiCheck,
  FiBox,
  FiHome,
  FiAlertCircle,
} from 'react-icons/fi';
import { TbTruckDelivery, TbBike } from 'react-icons/tb';
import { useOrders } from '../../../hooks/useOrders';
import { useProductData } from '@/app/(public)/hooks/useProductData';
import { formatDate, formatCurrency } from '../../../lib/formatters';
import OrderedProductCard from './components/OrderedProductCard';

/**
 * OrderDetailsPage (Order Tracking)
 * Updated: Implemented detailed delivery fee breakdown (Base + Option Charge) in Summary.
 * Design: White background, 1px Borders, Black text, Thin labels, Rounded-[32px].
 */
export default function OrderDetailsPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const {
    orderDetails,
    isLoading: orderLoading,
    error,
    loadOrderDetails,
  } = useOrders();
  const { products } = useProductData();

  useEffect(() => {
    if (resolvedParams?.id) loadOrderDetails(resolvedParams.id);
  }, [resolvedParams?.id, loadOrderDetails]);

  const addressDetails = useMemo(() => {
    if (!orderDetails?.shipping_address)
      return {
        fullName: 'N/A',
        email: 'N/A',
        phone: 'N/A',
        gender: 'N/A',
        district: 'N/A',
        thana: 'N/A',
        cleanAddress: 'N/A',
      };
    const parts = orderDetails.shipping_address.split(',').map(p => p.trim());
    return {
      fullName: parts[0] || 'N/A',
      email: parts[1] || 'N/A',
      phone: parts[2] || 'N/A',
      gender: 'Male',
      district: parts[parts.length - 2] || 'N/A',
      thana: parts[parts.length - 3] || 'N/A',
      cleanAddress: parts.slice(3).join(', ') || 'N/A',
    };
  }, [orderDetails]);

  const steps = [
    {
      label: 'Order Placed',
      status: 'PENDING',
      icon: <FiBox className="w-6 h-6 md:w-8" />,
    },
    {
      label: 'Picked',
      status: 'CONFIRMED',
      icon: <TbTruckDelivery className="w-6 h-6 md:w-8" />,
    },
    {
      label: 'In Transit',
      status: 'PROCESSING',
      icon: <TbTruckDelivery className="w-6 h-6 md:w-8" />,
    },
    {
      label: 'On The Way',
      status: 'SHIPPED',
      icon: <TbBike className="w-6 h-6 md:w-8" />,
    },
    {
      label: 'Delivered',
      status: 'DELIVERED',
      icon: <FiBox className="w-6 h-6 md:w-8" />,
    },
  ];

  const currentStatus = orderDetails?.status?.toUpperCase() || '';
  const activeIndex = steps.findIndex(s => s.status === currentStatus);
  const isCancelled = currentStatus === 'CANCELLED';

  // Fallback subtotal calculation for older orders
  const subtotalCalculated = useMemo(() => {
    return (
      orderDetails?.items?.reduce(
        (acc, item) =>
          acc + parseFloat(item.price_at_order || 0) * (item.quantity || 0),
        0,
      ) || 0
    );
  }, [orderDetails]);

  if (orderLoading || !orderDetails)
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-white pb-20 animate-in fade-in duration-700 w-full overflow-x-hidden text-black">
      <div className="w-full px-4 sm:px-6 lg:px-10 pt-6 md:pt-10 flex items-center gap-6">
        <button
          onClick={() => router.back()}
          className="w-fit flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 rounded-full text-sm font-bold text-black hover:bg-gray-50 transition-all cursor-pointer shadow-none"
        >
          <FiArrowLeft /> Back
        </button>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
          Order Tracking
        </h1>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-10 mt-6 md:mt-10 space-y-6 md:space-y-10">
        <div className="w-full bg-white border border-gray-100 rounded-[24px] md:rounded-[32px] p-5 md:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl lg:text-[28px] font-bold">
              Order ID: {orderDetails.id}
            </h2>
            <p className="text-sm text-black font-medium">
              Order Date:{' '}
              <span className="font-bold">
                {formatDate(orderDetails.created_at)}
              </span>
            </p>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-6 md:gap-10 lg:gap-16 w-full lg:w-auto">
            <div className="text-left sm:text-center md:text-right">
              <span
                className={`px-4 py-1.5 text-[11px] md:text-[13px] font-bold rounded-full uppercase ${isCancelled ? 'bg-red-50 text-red-600' : 'bg-[#F0FDF4] text-[#10B981]'}`}
              >
                {isCancelled ? 'Cancelled' : 'Paid'}
              </span>
              <p className="text-[10px] md:text-[12px] font-light uppercase tracking-widest mt-2">
                Payment Status
              </p>
            </div>
            <div className="text-left sm:text-center md:text-right">
              <span className="px-4 py-1.5 bg-gray-50 text-black text-[11px] md:text-[13px] font-bold rounded-full uppercase">
                {orderDetails.payment_method || 'ONLINE'}
              </span>
              <p className="text-[10px] md:text-[12px] font-light uppercase tracking-widest mt-2">
                Payment Type
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1 text-left sm:text-center md:text-right">
              <span className="text-lg md:text-xl lg:text-2xl font-bold">
                {formatCurrency(orderDetails.total)}
              </span>
              <p className="text-[10px] md:text-[12px] font-light uppercase tracking-widest mt-1">
                Total Amount
              </p>
            </div>
          </div>
        </div>

        {!isCancelled && (
          <div className="w-full bg-white border border-gray-100 rounded-[24px] md:rounded-[32px] p-5 md:p-12 space-y-8 overflow-hidden shadow-none">
            <h3 className="text-xs md:text-sm font-bold uppercase tracking-[0.2em]">
              Timeline
            </h3>
            <div className="overflow-x-auto no-scrollbar pb-4">
              <div className="relative min-w-[700px] md:min-w-full pt-4 pb-8">
                <div className="absolute top-[50px] md:top-[60px] left-[10%] right-[10%] h-1 bg-gray-100 rounded-full" />
                <div
                  className="absolute top-[50px] md:top-[60px] left-[10%] h-1 bg-[#10B981] rounded-full transition-all duration-1000"
                  style={{
                    width: `${activeIndex !== -1 ? (activeIndex / (steps.length - 1)) * 80 : 0}%`,
                  }}
                />
                <div className="relative flex justify-between">
                  {steps.map((step, idx) => {
                    const isCompleted = idx <= activeIndex;
                    const historyItem = orderDetails.status_history?.find(
                      h => h.status === step.status,
                    );
                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center text-center w-1/5 space-y-4 md:space-y-6"
                      >
                        <div
                          className={`w-16 h-16 md:w-24 lg:w-28 rounded-[20px] md:rounded-[32px] flex items-center justify-center transition-all duration-500 ${isCompleted ? 'bg-[#F3F4F6]' : 'bg-gray-50 text-gray-300'}`}
                        >
                          {step.icon}
                        </div>
                        <div
                          className={`w-8 h-8 md:w-10 rounded-full border-4 border-white flex items-center justify-center z-10 transition-all duration-500 ${isCompleted ? 'bg-[#10B981] text-white' : 'bg-gray-200 text-transparent'}`}
                        >
                          <FiCheck className="w-4 h-4 md:w-5" strokeWidth={4} />
                        </div>
                        <div className="space-y-1">
                          <p
                            className={`text-[12px] md:text-[15px] font-bold ${isCompleted ? 'text-black' : 'text-gray-400'}`}
                          >
                            {step.label}
                          </p>
                          {historyItem && (
                            <div className="text-[10px] md:text-[12px] font-medium text-gray-500">
                              <p>{historyItem.time_bd}</p>
                              <p>{historyItem.date_bd}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-10">
          <div className="space-y-6 md:space-y-10">
            <div className="w-full bg-white border border-gray-100 rounded-[24px] md:rounded-[32px] p-5 md:p-8 space-y-6 shadow-none">
              <h3 className="text-xl md:text-2xl font-bold">Cart Product</h3>
              <div className="space-y-4">
                {orderDetails.items?.map(item => (
                  <OrderedProductCard
                    key={item.id}
                    item={item}
                    productInfo={products.find(p => p.id === item.product)}
                  />
                ))}
              </div>
            </div>

            <div className="w-full bg-white border border-gray-100 rounded-[24px] md:rounded-[32px] p-5 md:p-8 space-y-6 shadow-none">
              <h3 className="text-xl md:text-2xl font-bold">Order Summary</h3>
              <div className="space-y-5">
                <div className="flex justify-between text-sm md:text-[17px] font-bold">
                  <span className="text-black font-light uppercase tracking-widest">
                    Subtotal
                  </span>
                  <span className="font-bold">
                    {formatCurrency(
                      orderDetails.subtotal_before_discount ||
                        subtotalCalculated,
                    )}
                  </span>
                </div>

                {parseFloat(orderDetails.discount_amount) > 0 && (
                  <div className="flex justify-between text-sm md:text-[17px] font-bold">
                    <span className="text-black font-light uppercase tracking-widest">
                      Discount{' '}
                      {orderDetails.coupon?.code
                        ? `(${orderDetails.coupon.code})`
                        : ''}
                    </span>
                    <span className="text-red-500">
                      -{formatCurrency(orderDetails.discount_amount)}
                    </span>
                  </div>
                )}

                {/* Base Shipping Fee */}
                <div className="flex justify-between text-sm md:text-[17px] font-bold">
                  <span className="text-black font-light uppercase tracking-widest">
                    {parseFloat(orderDetails.delivery_option_charge) > 0
                      ? 'Base Shipping'
                      : 'Delivery Fee'}
                  </span>
                  <span className="font-bold">
                    {formatCurrency(
                      orderDetails.base_delivery_fee ||
                        orderDetails.delivery_fee ||
                        0,
                    )}
                  </span>
                </div>

                {/* Optional Delivery Upgrade Charge */}
                {parseFloat(orderDetails.delivery_option_charge) > 0 && (
                  <div className="flex justify-between text-sm md:text-[17px] font-bold">
                    <span className="text-black font-light uppercase tracking-widest">
                      {orderDetails.delivery_option_name || 'Express Upgrade'}
                    </span>
                    <span className="font-bold">
                      +{formatCurrency(orderDetails.delivery_option_charge)}
                    </span>
                  </div>
                )}

                <div className="h-px bg-gray-100 w-full" />
                <div className="flex justify-between text-xl md:text-2xl font-black">
                  <span className="uppercase font-light">Total</span>
                  <span className="font-bold">
                    {formatCurrency(orderDetails.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 md:space-y-10">
            <div className="w-full bg-white border border-gray-100 rounded-[24px] md:rounded-[32px] p-5 md:p-8 space-y-8 shadow-none">
              <div className="flex justify-between items-center">
                <h3 className="text-xl md:text-2xl font-bold">
                  Shipping Address
                </h3>
                <Link
                  href="/user/address"
                  className="px-4 py-2 bg-gray-50 rounded-full text-[12px] md:text-[14px] font-bold text-black border border-gray-100 shadow-none"
                >
                  Change
                </Link>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-[20px] border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black shadow-sm shrink-0">
                  <FiHome size={24} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-base md:text-lg truncate">
                    {addressDetails.fullName}
                  </h4>
                  <p className="text-xs md:text-sm text-gray-500 truncate">
                    {addressDetails.email}
                  </p>
                </div>
              </div>
              <div className="space-y-5">
                {[
                  { label: 'Phone Number', value: addressDetails.phone },
                  { label: 'Gender', value: addressDetails.gender },
                  { label: 'District', value: addressDetails.district },
                  { label: 'Thana', value: addressDetails.thana },
                  { label: 'Full Address', value: addressDetails.cleanAddress },
                  {
                    label: 'Delivery Type',
                    value:
                      orderDetails.delivery_option_name || 'Standard Delivery',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center text-sm md:text-[15px] gap-1 sm:gap-0"
                  >
                    <span className="w-full sm:w-32 md:w-36 text-black font-light uppercase tracking-wider shrink-0">
                      {item.label}
                    </span>
                    <span className="hidden sm:inline text-gray-300 mr-4 md:mr-6">
                      -
                    </span>
                    <span className="flex-1 font-bold sm:text-right break-words">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full bg-white border border-gray-100 rounded-[24px] md:rounded-[32px] p-5 md:p-8 space-y-8 shadow-none">
              <h3 className="text-xl md:text-2xl font-bold">Order Timeline</h3>
              <div className="space-y-0">
                {orderDetails.status_history?.map((history, idx) => {
                  const isLast = idx === orderDetails.status_history.length - 1;
                  const isCurrent = idx === 0;
                  return (
                    <div
                      key={history.id || idx}
                      className="relative pl-12 md:pl-16 pb-10 md:pb-12"
                    >
                      {!isLast && (
                        <div className="absolute left-[19px] md:left-[23px] top-10 md:top-12 bottom-0 w-0.5 bg-[#10B981]" />
                      )}
                      <div
                        className={`absolute left-0 top-1.5 w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-white flex items-center justify-center z-10 ${isCurrent ? 'bg-[#10B981] text-white' : 'bg-gray-200 text-gray-400'}`}
                      >
                        <FiCheck
                          className="w-4 h-4 md:w-5 md:h-5"
                          strokeWidth={4}
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-[11px] md:text-[14px] font-bold text-gray-400 uppercase tracking-widest">
                          {history.date_bd}, {history.time_bd}
                        </p>
                        <div className="bg-white border border-gray-100 p-5 md:p-8 rounded-[20px] md:rounded-[24px] space-y-2 shadow-none">
                          <div className="flex flex-wrap items-center gap-3 md:gap-4">
                            <h4 className="font-bold text-base md:text-xl uppercase">
                              Order {history.status}
                            </h4>
                            {isCurrent && (
                              <span className="px-2.5 py-1 bg-[#F0FDF4] text-[#10B981] text-[9px] md:text-[11px] font-bold rounded-full uppercase border border-[#DCFCE7]">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-sm md:text-[16px] text-gray-500 font-medium">
                            Your order has been {history.status.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
