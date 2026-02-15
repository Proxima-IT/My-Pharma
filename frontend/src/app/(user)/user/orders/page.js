'use client';
import React from 'react';
import Link from 'next/link';
import {
  FiPackage,
  FiArrowLeft,
  FiChevronRight,
  FiClock,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';
import { useOrders } from '../../hooks/useOrders';
import { formatCurrency, formatDate } from '../../lib/formatters';

export default function MyOrdersPage() {
  const { orders, filter, setFilter, isLoading, error } = useOrders();
  const filters = ['All', 'Confirmed', 'Delivered', 'Cancelled'];

  const getStatusStyles = status => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'bg-green-50 text-green-600 border-green-100';
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'CANCELLED':
        return 'bg-red-50 text-red-600 border-red-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Mobile Sub-Page Header */}
      <div className="flex items-center gap-4 lg:hidden mb-2">
        <Link href="/user" className="p-2 -ml-2 text-gray-600">
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
      </div>

      {/* Desktop Header & Filters */}
      <div className="flex flex-col gap-6">
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-(--gray-900) tracking-tight">
            My Orders
          </h1>
          <p className="text-sm text-(--gray-500) mt-1 font-normal">
            Track and manage your medical supplies.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-[11px] font-bold transition-all whitespace-nowrap border uppercase tracking-wider ${
                filter === f
                  ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/20'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-primary-500 hover:text-primary-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-3">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <p className="text-sm font-bold text-red-500">{error}</p>
          </div>
        ) : orders.length > 0 ? (
          orders.map(order => (
            <div
              key={order.id}
              className="group bg-white rounded-2xl p-4 md:p-6 flex items-center justify-between gap-4 transition-all active:scale-[0.99] border border-gray-100 lg:hover:border-primary-200"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl bg-gray-50 flex items-center justify-center text-primary-500 text-lg group-hover:bg-primary-50 transition-colors">
                  <FiPackage />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">
                      Order #{order.id}
                    </h3>
                    <span
                      className={`lg:hidden px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${getStatusStyles(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-[11px] md:text-xs text-gray-400 font-medium">
                    {formatDate(order.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 md:gap-8 shrink-0">
                <span
                  className={`hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyles(order.status)}`}
                >
                  {order.status?.toUpperCase() === 'DELIVERED' && (
                    <FiCheckCircle />
                  )}
                  {order.status?.toUpperCase() === 'CONFIRMED' && <FiClock />}
                  {order.status?.toUpperCase() === 'CANCELLED' && <FiXCircle />}
                  {order.status}
                </span>

                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight lg:tracking-widest mb-0.5">
                    Total
                  </p>
                  <p className="text-sm md:text-base font-bold text-gray-900">
                    {formatCurrency(order.total)}
                  </p>
                </div>

                <FiChevronRight className="text-gray-300 group-hover:text-primary-500 transition-colors hidden md:block" />
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl py-16 flex flex-col items-center text-center px-6 border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-4">
              <FiPackage size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No orders found</h3>
            <p className="text-sm text-gray-500 mt-1">
              Try changing your filter or start shopping.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
