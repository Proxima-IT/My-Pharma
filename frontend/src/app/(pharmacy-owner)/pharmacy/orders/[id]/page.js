'use client';

import React, { useEffect, use, useMemo } from 'react';
import Link from 'next/link';
import {
  FiChevronLeft,
  FiPackage,
  FiUser,
  FiMapPin,
  FiCheckCircle,
  FiTruck,
  FiXCircle,
  FiClock,
  FiLoader,
  FiPhone,
  FiMail,
  FiCreditCard,
} from 'react-icons/fi';
import { usePharmacyOrders } from '../../../hooks/usePharmacyOrders';
import { formatCurrency, formatDate } from '@/app/(user)/lib/formatters';
import OrderInfoCard from './components/OrderInfoCard';

export default function PharmacyOrderDetailsPage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const {
    orderDetails,
    isLoading,
    isUpdating,
    error,
    loadOrderDetails,
    updateStatus,
  } = usePharmacyOrders();

  useEffect(() => {
    if (id) loadOrderDetails(id);
  }, [id, loadOrderDetails]);

  const parsedData = useMemo(() => {
    if (!orderDetails?.shipping_address)
      return { name: 'N/A', email: 'N/A', phone: 'N/A', address: 'N/A' };
    const parts = orderDetails.shipping_address.split(',').map(p => p.trim());
    return {
      name: parts[0] || 'N/A',
      email: parts[1] || 'N/A',
      phone: parts[2] || 'N/A',
      address: parts.slice(3).join(', ') || 'N/A',
    };
  }, [orderDetails]);

  const handleStatusChange = async newStatus => {
    await updateStatus(id, newStatus);
  };

  if (isLoading && !orderDetails) {
    return (
      <div className="w-full py-40 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="w-full py-20 px-4 text-center">
        <div className="bg-white rounded-[32px] border border-gray-100 p-8">
          <p className="text-red-500 font-bold mb-4">
            {error || 'Order not found'}
          </p>
          <Link
            href="/pharmacy/orders"
            className="text-(--color-primary-500) font-bold underline"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const getStatusStyles = status => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'bg-(--color-success-50) border-(--color-success-100) text-(--color-success-600)';
      case 'SHIPPED':
        return 'bg-blue-50 border-blue-100 text-blue-600';
      case 'PROCESSING':
        return 'bg-indigo-50 border-indigo-100 text-indigo-600';
      case 'CONFIRMED':
        return 'bg-cyan-50 border-cyan-100 text-cyan-600';
      case 'CANCELLED':
        return 'bg-red-50 border-red-100 text-red-600';
      default:
        return 'bg-amber-50 border-amber-100 text-amber-600';
    }
  };

  const getStatusIcon = status => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return <FiCheckCircle />;
      case 'SHIPPED':
        return <FiTruck />;
      case 'PROCESSING':
        return <FiLoader className="animate-spin" />;
      case 'CANCELLED':
        return <FiXCircle />;
      default:
        return <FiClock />;
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 sm:gap-6">
        <Link href="/pharmacy/orders">
          <button className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white border border-gray-100 rounded-full text-xs sm:text-[14px] font-bold text-gray-900 hover:bg-gray-50 transition-all cursor-pointer">
            <FiChevronLeft size={18} />{' '}
            <span className="hidden xs:inline">Back to Orders</span>
            <span className="xs:hidden">Back</span>
          </button>
        </Link>
        <h1 className="text-xl sm:text-[28px] font-bold text-gray-900 tracking-tight truncate">
          Order #{orderDetails.id}
        </h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* MAIN COLUMN: Order Info & Items */}
        <div className="xl:col-span-2 space-y-6 sm:space-y-8">
          {/* 1. Order Summary Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
            <OrderInfoCard
              label="Order Date"
              value={formatDate(orderDetails.created_at)}
            />
            <OrderInfoCard
              label="Total Amount"
              value={formatCurrency(orderDetails.total)}
            />
            <OrderInfoCard label="Payment Method" value="Cash on Delivery" />
            <OrderInfoCard
              label="Payment Status"
              badge="Unpaid"
              badgeType="error"
            />
          </div>

          {/* 2. Items List Card */}
          <div className="bg-white border border-gray-100 rounded-[32px] p-5 sm:p-8 space-y-6 sm:space-y-8">
            <div className="space-y-5 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <FiPackage className="text-gray-400" />
                Ordered Items
              </h3>
              <div className="space-y-3">
                {orderDetails.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col xs:flex-row xs:items-center justify-between p-4 sm:p-5 rounded-[24px] border border-gray-50 bg-gray-25/30 gap-3 xs:gap-0"
                  >
                    <div className="flex flex-col">
                      <p className="font-bold text-gray-900 text-sm sm:text-base">
                        {item.product_name}
                      </p>
                      <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                        Unit Price: {formatCurrency(item.price_at_order)}
                      </p>
                    </div>
                    <div className="text-left xs:text-right border-t xs:border-none border-gray-100 pt-2 xs:pt-0">
                      <p className="text-xs sm:text-sm font-bold text-gray-900">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm sm:text-base font-black text-gray-900">
                        {formatCurrency(item.price_at_order * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Shipping Address Card */}
          <div className="bg-white border border-gray-100 rounded-[32px] p-5 sm:p-8 space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <FiMapPin className="text-gray-400" />
              Shipping Destination
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium">
              {parsedData.address}
            </p>
          </div>
        </div>

        {/* SIDEBAR COLUMN: Status Management & Customer Info */}
        <div className="xl:col-span-1 space-y-6 sm:space-y-8">
          {/* Status Update Card */}
          <div className="bg-white border border-gray-100 rounded-[32px] p-5 sm:p-8 space-y-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              Order Status
            </h3>
            <div
              className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${getStatusStyles(orderDetails.status)}`}
            >
              <span className="text-xl">
                {getStatusIcon(orderDetails.status)}
              </span>
              <span className="font-black uppercase text-[10px] sm:text-xs tracking-widest">
                {orderDetails.status}
              </span>
            </div>
            <div className="space-y-3 pt-4 border-t border-gray-50">
              <p className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                Update Status To:
              </p>
              <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-1 gap-2">
                {[
                  'PENDING',
                  'CONFIRMED',
                  'PROCESSING',
                  'SHIPPED',
                  'DELIVERED',
                  'CANCELLED',
                ].map(status => (
                  <button
                    key={status}
                    disabled={isUpdating || orderDetails.status === status}
                    onClick={() => handleStatusChange(status)}
                    className={`w-full py-3 sm:py-3.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border ${
                      orderDetails.status === status
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-gray-100 text-gray-700 hover:border-(--color-primary-500) hover:text-(--color-primary-500)'
                    }`}
                  >
                    {isUpdating && orderDetails.status !== status
                      ? 'Updating...'
                      : status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Info Card */}
          <div className="bg-white border border-gray-100 rounded-[32px] p-5 sm:p-8 space-y-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <FiUser className="text-gray-400" />
              Customer Info
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                  <FiUser size={18} />
                </div>
                <p className="font-bold text-gray-900 text-sm sm:text-base truncate">
                  {parsedData.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                  <FiMail size={18} />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">
                  {parsedData.email}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                  <FiPhone size={18} />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  {parsedData.phone}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
