'use client';
import React, { useEffect, use, useMemo } from 'react';
import Link from 'next/link';
import {
  FiChevronLeft,
  FiArrowLeft,
  FiPackage,
  FiMapPin,
} from 'react-icons/fi';
import { useOrders } from '../../../hooks/useOrders';
import { useProductData } from '@/app/(public)/hooks/useProductData';
import { formatDate, formatCurrency } from '../../../lib/formatters';
import OrderInfoCard from './components/OrderInfoCard';
import OrderedProductCard from './components/OrderedProductCard';

export default function OrderDetailsPage({ params }) {
  const resolvedParams = use(params);
  const {
    orderDetails,
    isLoading: orderLoading,
    error,
    loadOrderDetails,
  } = useOrders();
  const { products, isLoading: productsLoading } = useProductData();

  useEffect(() => {
    if (resolvedParams.id) loadOrderDetails(resolvedParams.id);
  }, [resolvedParams.id, loadOrderDetails]);

  const addressInfo = useMemo(() => {
    if (!orderDetails?.shipping_address)
      return { phone: 'N/A', cleanAddress: 'N/A' };
    const parts = orderDetails.shipping_address.split(',').map(p => p.trim());
    return parts.length >= 4
      ? { phone: parts[2], cleanAddress: parts.slice(3).join(', ') }
      : { phone: 'N/A', cleanAddress: orderDetails.shipping_address };
  }, [orderDetails]);

  // Helper to get consistent status styling
  const getStatusStyles = status => {
    const s = status?.toUpperCase() || '';
    if (s === 'DELIVERED')
      return 'bg-(--success-50) border-(--success-100) text-(--success-600)';
    if (s === 'CANCELLED') return 'bg-red-50 border-red-100 text-red-600';
    if (s === 'SHIPPED' || s === 'CONFIRMED')
      return 'bg-blue-50 border-blue-100 text-blue-600';
    if (s === 'PROCESSING')
      return 'bg-indigo-50 border-indigo-100 text-indigo-600';
    return 'bg-amber-50 border-amber-100 text-amber-600'; // Default for PENDING
  };

  if (orderLoading || productsLoading) {
    return (
      <div className="w-full flex justify-center items-center py-40">
        <div className="w-10 h-10 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="w-full py-40 text-center">
        <p className="text-red-500 font-bold mb-4">
          {error || 'Order not found'}
        </p>
        <Link
          href="/user/orders"
          className="text-(--color-primary-500) font-bold underline"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center gap-4 lg:hidden mb-2">
        <Link
          href="/user/orders"
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Order Details</h1>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100/50 min-h-[600px] p-5 sm:p-8 md:p-10 lg:p-12 space-y-10">
        <div className="flex items-center gap-6">
          <Link href="/user/orders" className="hidden lg:block">
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-full text-[14px] font-bold text-gray-900 hover:bg-gray-50 transition-all cursor-pointer">
              <FiChevronLeft size={18} /> Back
            </button>
          </Link>
          <h1 className="text-2xl md:text-[28px] font-bold text-gray-900 tracking-tight">
            Order Details
          </h1>
        </div>

        {/* Info Grid - Responsive wrapping for Laptop screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
          <OrderInfoCard label="Order ID" value={`#${orderDetails.id}`} />
          <OrderInfoCard
            label="Date"
            value={formatDate(orderDetails.created_at)}
          />
          <OrderInfoCard
            label="Receiver"
            value={
              orderDetails.receiver_name || orderDetails.user_username || 'N/A'
            }
          />
          <OrderInfoCard label="Phone" value={addressInfo.phone} />
          <OrderInfoCard
            label="Total"
            value={formatCurrency(orderDetails.total)}
          />
          <OrderInfoCard label="Payment">
            <span className="ml-2 px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-wider">
              {orderDetails.payment_method || 'COD'}
            </span>
          </OrderInfoCard>
          <OrderInfoCard label="Status">
            <span
              className={`ml-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-colors ${getStatusStyles(orderDetails.status)}`}
            >
              {orderDetails.status}
            </span>
          </OrderInfoCard>
        </div>

        <div className="bg-gray-50/50 border border-gray-100 rounded-[24px] p-6">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <FiMapPin /> Shipping Address
          </h3>
          <p className="text-[15px] font-bold text-gray-900 leading-relaxed">
            {addressInfo.cleanAddress}
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-[20px] font-bold text-gray-900 flex items-center gap-2">
            <FiPackage className="text-gray-400" /> Ordered Items
          </h2>
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
      </div>
    </div>
  );
}
