'use client';
import React, { useState, useEffect, use, useMemo } from 'react';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight, FiArrowLeft } from 'react-icons/fi';
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

  // Fetch real product table data to get slugs/images via lookup
  const { products, isLoading: productsLoading } = useProductData();

  useEffect(() => {
    if (resolvedParams.id) {
      loadOrderDetails(resolvedParams.id);
    }
  }, [resolvedParams.id, loadOrderDetails]);

  // Helper to parse the combined address string from backend
  const addressInfo = useMemo(() => {
    if (!orderDetails?.shipping_address)
      return { phone: 'N/A', cleanAddress: 'N/A' };
    const parts = orderDetails.shipping_address.split(',').map(p => p.trim());

    // If the string is in the format: Name, Email, Phone, District, Thana, Address...
    if (parts.length >= 4) {
      return {
        phone: parts[2],
        cleanAddress: parts.slice(3).join(', '),
      };
    }
    return { phone: 'N/A', cleanAddress: orderDetails.shipping_address };
  }, [orderDetails]);

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

  const data = orderDetails;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Mobile Sub-Page Header */}
      <div className="flex items-center gap-4 lg:hidden mb-2">
        <Link href="/user/orders" className="p-2 -ml-2 text-gray-600">
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Order Details</h1>
      </div>

      {/* Main Unified Container */}
      <div className="bg-white rounded-[32px] p-6 md:p-10 border border-gray-100/50 min-h-[600px] flex flex-col space-y-10">
        {/* 1. Header Section */}
        <div className="flex items-center gap-6">
          <Link href="/user/orders" className="hidden lg:block">
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-full text-[14px] font-bold text-gray-900 hover:bg-gray-50 transition-all cursor-pointer">
              <FiChevronLeft size={18} /> Back
            </button>
          </Link>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">
            Order Details
          </h1>
        </div>

        {/* 2. Top Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <OrderInfoCard label="Order ID" value={`#${data.id}`} />
          <OrderInfoCard label="Date" value={formatDate(data.created_at)} />
          <OrderInfoCard
            label="Receiver Name"
            value={data.receiver_name || data.user_username || 'N/A'}
          />
          <OrderInfoCard label="Phone Number" value={addressInfo.phone} />
          <OrderInfoCard
            label="Amount Payable"
            value={formatCurrency(data.total)}
          />
          <OrderInfoCard label="Payment Type">
            <span className="ml-2 px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-[11px] font-bold text-gray-500 uppercase">
              {data.payment_method || 'COD'}
            </span>
          </OrderInfoCard>
          <OrderInfoCard label="Status">
            <span
              className={`ml-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase border ${
                data.status === 'PENDING'
                  ? 'bg-amber-50 border-amber-100 text-amber-600'
                  : 'bg-(--success-50) border-(--success-100) text-(--success-600)'
              }`}
            >
              {data.status}
            </span>
          </OrderInfoCard>
        </div>

        {/* 3. Address Section */}
        <div className="bg-white border border-gray-100 rounded-[24px] p-6">
          <span className="text-[13px] font-medium text-gray-400 block mb-2 uppercase tracking-wider">
            Shipping Address
          </span>
          <p className="text-[16px] font-bold text-gray-900 leading-relaxed">
            {addressInfo.cleanAddress}
          </p>
        </div>

        {/* 4. Product Section */}
        <div className="space-y-8">
          <h2 className="text-[22px] font-bold text-gray-900">Cart Product</h2>

          <div className="space-y-4">
            {data.items?.map(item => {
              // LOOKUP: Find the real product metadata from the products table
              const productInfo = products.find(p => p.id === item.product);
              return (
                <OrderedProductCard
                  key={item.id}
                  item={item}
                  productInfo={productInfo}
                />
              );
            })}
          </div>

          {/* Dynamic Pagination UI */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-gray-50">
            <p className="text-[14px] font-medium text-gray-500">
              Showing{' '}
              <span className="text-gray-900 font-bold">
                1 to {data.items?.length || 0}
              </span>
            </p>

            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all cursor-pointer">
                <FiChevronLeft size={20} />
              </button>
              <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-white">
                <button className="px-5 py-2.5 text-[13px] font-bold bg-black text-white">
                  1
                </button>
              </div>
              <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all cursor-pointer">
                <FiChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
