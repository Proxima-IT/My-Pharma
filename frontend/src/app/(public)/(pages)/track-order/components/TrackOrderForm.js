'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FiHash, 
  FiMail, 
  FiSearch, 
  FiCalendar, 
  FiMapPin, 
  FiPackage, 
  FiCheckCircle, 
  FiClock, 
  FiAlertCircle, 
  FiArrowLeft,
  FiCreditCard,
  FiTruck
} from 'react-icons/fi';
import { ORDER_ENDPOINTS, getProductImageUrl, parseJsonResponse } from '@/app/(shared)/lib/apiConfig';
import UiInput from '@/app/(public)/components/UiInput';
import UiButton from '@/app/(public)/components/UiButton';

export default function TrackOrderForm() {
  const [orderId, setOrderId] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setOrderData(null);

    try {
      const response = await fetch(ORDER_ENDPOINTS.TRACK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId.trim(),
          email_or_phone: emailOrPhone.trim(),
        }),
      });

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(data.detail || 'Could not retrieve tracking details.');
      }

      setOrderData(data);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setOrderId('');
    setEmailOrPhone('');
    setOrderData(null);
    setError(null);
  };

  // Helper: format dates
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper: map backend status to step order
  const getStatusStep = (status) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'CONFIRMED': return 1;
      case 'PROCESSING': return 2;
      case 'SHIPPED': return 3;
      case 'DELIVERED': return 4;
      default: return -1;
    }
  };

  const steps = [
    { label: 'Placed', status: 'PENDING', desc: 'Order received' },
    { label: 'Confirmed', status: 'CONFIRMED', desc: 'Order verified' },
    { label: 'Processing', status: 'PROCESSING', desc: 'Preparing items' },
    { label: 'Shipped', status: 'SHIPPED', desc: 'In transit' },
    { label: 'Delivered', status: 'DELIVERED', desc: 'Handed to client' },
  ];

  const currentStepIndex = orderData ? getStatusStep(orderData.status) : -1;
  const isCancelled = orderData?.status === 'CANCELLED';

  // Helper for status badge styling
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-600 border border-amber-200';
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-600 border border-blue-200';
      case 'PROCESSING':
        return 'bg-indigo-50 text-indigo-600 border border-indigo-200';
      case 'SHIPPED':
        return 'bg-purple-50 text-purple-600 border border-purple-200';
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-600 border border-rose-200';
      default:
        return 'bg-gray-50 text-gray-600 border border-gray-200';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4 md:px-6">
      {/* Back to Home Link */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors font-semibold">
          <FiArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      {!orderData ? (
        /* Form State */
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Track Your Order</h1>
            <p className="text-gray-500 mt-3 text-base">
              Enter your Order ID and the phone number or email address used when placing the order.
            </p>
          </div>

          <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-gray-100/80">
            <form onSubmit={handleTrack} className="space-y-6">
              <UiInput
                label="Order ID"
                type="text"
                placeholder="e.g. 1"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
                leftIcon={<FiHash />}
              />

              <UiInput
                label="Email or Phone Number"
                type="text"
                placeholder="e.g. customer@example.com or 017xxxxxxxx"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                required
                leftIcon={<FiMail />}
              />

              {error && (
                <div className="flex gap-3 items-center bg-rose-50 border border-rose-100 rounded-2xl p-4 text-rose-600 text-sm animate-in fade-in">
                  <FiAlertCircle size={20} className="shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <div className="pt-4">
                <UiButton type="submit" isLoading={isLoading}>
                  Track Order
                </UiButton>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* Results State */
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-extrabold text-gray-900">Order #{orderData.id}</h1>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadgeClass(orderData.status)}`}>
                  {orderData.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-2 flex items-center gap-1.5">
                <FiCalendar size={14} /> Placed on {formatDate(orderData.created_at)}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-full transition-all uppercase tracking-wider"
            >
              Track Another Order
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left/Middle Column: Stepper and Order Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Timeline Stepper */}
              <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Timeline</h2>

                {isCancelled ? (
                  <div className="bg-rose-50 border border-rose-100 text-rose-700 p-5 rounded-2xl flex items-start gap-4">
                    <FiAlertCircle size={24} className="shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm">Order Cancelled</h4>
                      <p className="text-xs mt-1 text-rose-600">This order has been cancelled and will not be processed further.</p>
                    </div>
                  </div>
                ) : (
                  /* Horizontal timeline for desktop, vertical for mobile */
                  <div>
                    {/* Desktop Stepper */}
                    <div className="hidden md:flex justify-between items-start relative w-full pt-4 pb-2">
                      {/* Connection Line */}
                      <div className="absolute top-[28px] left-[10%] right-[10%] h-[4px] bg-gray-100 z-0">
                        <div 
                          className="h-full bg-(--color-primary-500) transition-all duration-500" 
                          style={{ width: `${(Math.max(0, currentStepIndex) / 4) * 100}%` }}
                        />
                      </div>

                      {steps.map((step, idx) => {
                        const isCompleted = idx < currentStepIndex;
                        const isActive = idx === currentStepIndex;
                        const isUpcoming = idx > currentStepIndex;
                        const historyEntry = orderData.status_history?.find(h => h.status === step.status);

                        return (
                          <div key={idx} className="flex flex-col items-center text-center w-1/5 relative z-10">
                            {/* Dot / Indicator */}
                            <div 
                              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                isCompleted 
                                  ? 'bg-(--color-primary-500) border-(--color-primary-500) text-white' 
                                  : isActive 
                                    ? 'bg-white border-(--color-primary-500) text-(--color-primary-500) ring-4 ring-primary-50 animate-pulse'
                                    : 'bg-white border-gray-200 text-gray-400'
                              }`}
                            >
                              {isCompleted ? <FiCheckCircle size={16} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                            </div>
                            
                            <h3 className={`mt-3 text-xs font-bold tracking-wide uppercase ${isActive ? 'text-(--color-primary-600)' : isUpcoming ? 'text-gray-400' : 'text-gray-900'}`}>
                              {step.label}
                            </h3>
                            
                            {historyEntry && (
                              <p className="text-[10px] text-gray-400 mt-1 font-medium leading-relaxed">
                                {historyEntry.date_bd}<br />{historyEntry.time_bd}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Mobile Stepper */}
                    <div className="flex md:hidden flex-col space-y-6 relative pl-6 border-l-2 border-gray-100 ml-4">
                      {steps.map((step, idx) => {
                        const isCompleted = idx < currentStepIndex;
                        const isActive = idx === currentStepIndex;
                        const isUpcoming = idx > currentStepIndex;
                        const historyEntry = orderData.status_history?.find(h => h.status === step.status);

                        return (
                          <div key={idx} className="relative flex gap-4 items-start">
                            {/* Dot Indicator */}
                            <div 
                              className={`absolute -left-[35px] w-6 h-6 rounded-full flex items-center justify-center border-2 z-10 transition-all ${
                                isCompleted 
                                  ? 'bg-(--color-primary-500) border-(--color-primary-500) text-white' 
                                  : isActive 
                                    ? 'bg-white border-(--color-primary-500) text-(--color-primary-500) ring-4 ring-primary-50'
                                    : 'bg-white border-gray-200 text-gray-400'
                              }`}
                            >
                              {isCompleted ? <FiCheckCircle size={12} /> : <span className="text-[9px] font-bold">{idx + 1}</span>}
                            </div>

                            <div>
                              <h3 className={`text-sm font-bold uppercase tracking-wide ${isActive ? 'text-(--color-primary-600)' : isUpcoming ? 'text-gray-400' : 'text-gray-900'}`}>
                                {step.label}
                              </h3>
                              <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                              {historyEntry && (
                                <p className="text-[10px] text-gray-500 mt-1 font-semibold">
                                  {historyEntry.date_bd} at {historyEntry.time_bd}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Items Ordered</h2>
                <div className="divide-y divide-gray-100">
                  {orderData.items?.map((item, idx) => {
                    const imageUrl = getProductImageUrl(item.product) || '/assets/images/product-placeholder.png';
                    return (
                      <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-center">
                        <div className="relative w-16 h-16 rounded-2xl border border-gray-100 overflow-hidden shrink-0 bg-white">
                          <Image
                            src={imageUrl}
                            alt={item.product?.name || 'Product'}
                            fill
                            className="object-contain p-1"
                            unoptimized
                          />
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.product?.name}</h4>
                          <p className="text-xs text-gray-400 mt-1">
                            {item.product?.strength} {item.product?.dosage_form}
                          </p>
                          <p className="text-xs text-gray-500 font-medium mt-1">
                            {item.quantity} x {item.price_at_order} BDT
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-gray-900">
                            {(item.quantity * item.price_at_order).toFixed(2)} BDT
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Address and Price Summary */}
            <div className="space-y-8">
              {/* Shipping & Payment Card */}
              <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                    <FiMapPin size={14} /> Shipping Address
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-line">
                    {orderData.shipping_address || 'No shipping address provided.'}
                  </p>
                </div>

                <div className="h-px bg-gray-100" />

                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                    <FiCreditCard size={14} /> Payment Information
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-gray-800">
                      Method: <span className="text-gray-600 font-semibold">{orderData.payment_method}</span>
                    </p>
                    <p className="text-sm font-bold text-gray-800">
                      Status: <span className={`font-semibold ${orderData.payment_status === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>{orderData.payment_status}</span>
                    </p>
                  </div>
                </div>

                {orderData.notes && (
                  <>
                    <div className="h-px bg-gray-100" />
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Order Notes</h3>
                      <p className="text-xs text-gray-600 italic font-medium">{orderData.notes}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Summary</h3>
                <div className="flex justify-between text-sm text-gray-600 font-medium">
                  <span>Subtotal</span>
                  <span>{parseFloat(orderData.subtotal_before_discount || 0).toFixed(2)} BDT</span>
                </div>
                {parseFloat(orderData.discount_amount) > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>-{parseFloat(orderData.discount_amount).toFixed(2)} BDT</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600 font-medium">
                  <span>Delivery Fee</span>
                  <span>{parseFloat(orderData.delivery_fee || 0).toFixed(2)} BDT</span>
                </div>
                <div className="h-px bg-gray-100 my-2" />
                <div className="flex justify-between text-base font-extrabold text-gray-900">
                  <span>Total Payable</span>
                  <span className="text-(--color-primary-600)">{parseFloat(orderData.total || 0).toFixed(2)} BDT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
