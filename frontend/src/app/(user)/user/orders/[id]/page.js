'use client';
import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight, FiArrowLeft } from 'react-icons/fi';
import { useOrders } from '../../../hooks/useOrders';
import { formatDate, formatCurrency } from '../../../lib/formatters';
import OrderInfoCard from './components/OrderInfoCard';
import OrderedProductCard from './components/OrderedProductCard';

export default function OrderDetailsPage({ params }) {
  const resolvedParams = use(params);
  const { orderDetails, isLoading, error, loadOrderDetails } = useOrders();
  const [currentPage, setCurrentPage] = useState(1);

  // Mock Order Fallback for testing UI when API is empty
  const mockOrderFallback = {
    id: resolvedParams.id || '3950',
    created_at: '2026-01-03T10:30:00Z',
    user_username: 'Abu Fahim',
    total: 2930.0,
    status: 'PENDING',
    shipping_address:
      'Radisson Blu, Dhaka Water Garden, Airport Road, Dhaka Cantonment, Dhaka 1206 BANGLADESH',
    items: [
      {
        id: 1,
        product: 1,
        product_name: 'A-fenac 50',
        quantity: 2,
        price_at_order: 1250,
      },
      {
        id: 2,
        product: 2,
        product_name: 'Monalast 10',
        quantity: 1,
        price_at_order: 430,
      },
    ],
  };

  useEffect(() => {
    if (resolvedParams.id) {
      loadOrderDetails(resolvedParams.id);
    }
  }, [resolvedParams.id, loadOrderDetails]);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-40">
        <div className="w-10 h-10 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const data = orderDetails || mockOrderFallback;

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
            value={data.user_username || 'N/A'}
          />
          <OrderInfoCard label="Phone Number" value="01989343611" />
          <OrderInfoCard
            label="Amount Payable"
            value={formatCurrency(data.total)}
          />
          <OrderInfoCard label="Payment Type">
            <span className="ml-2 px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-[11px] font-bold text-gray-500 uppercase">
              BKASH
            </span>
          </OrderInfoCard>
          <OrderInfoCard label="Status">
            <span
              className={`ml-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase border ${
                data.status === 'PENDING'
                  ? 'bg-amber-50 border-amber-100 text-amber-600'
                  : 'bg-green-50 border-green-100 text-green-600'
              }`}
            >
              {data.status}
            </span>
          </OrderInfoCard>
        </div>

        {/* 3. Address Section */}
        <div className="bg-white border border-gray-100 rounded-[24px] p-6">
          <span className="text-[13px] font-medium text-gray-400 block mb-2 uppercase tracking-wider">
            Address
          </span>
          <p className="text-[16px] font-bold text-gray-900 leading-relaxed">
            {data.shipping_address}
          </p>
        </div>

        {/* 4. Product Section */}
        <div className="space-y-8">
          <h2 className="text-[22px] font-bold text-gray-900">Cart Product</h2>

          <div className="space-y-4">
            {data.items?.map(item => (
              <OrderedProductCard key={item.id} item={item} />
            ))}
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
