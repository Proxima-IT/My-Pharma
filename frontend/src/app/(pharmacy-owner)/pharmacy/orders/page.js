'use client';

import React from 'react';
import Link from 'next/link';
import {
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiShoppingBag,
} from 'react-icons/fi';
import { usePharmacyOrders } from '../../hooks/usePharmacyOrders';
import { formatCurrency, formatDate } from '@/app/(user)/lib/formatters';

export default function PharmacyOrdersPage() {
  const { orders, isLoading, error, page, setPage, totalPages, totalCount } =
    usePharmacyOrders();

  const getStatusStyles = status => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'text-(--color-success-600) bg-(--color-success-50) border-(--color-success-100)';
      case 'SHIPPED':
        return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'CANCELLED':
        return 'text-red-600 bg-red-50 border-red-100';
      case 'PENDING':
        return 'text-amber-600 bg-amber-50 border-amber-100';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  if (error) {
    return (
      <div className="w-full py-20 text-center bg-white rounded-[32px] border border-gray-100">
        <p className="text-red-500 font-bold">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Order Management
          </h1>
          <p className="text-sm text-gray-400 font-medium mt-1">
            Showing{' '}
            <span className="text-gray-900 font-bold">{orders.length}</span> of{' '}
            <span className="text-gray-900 font-bold">{totalCount}</span> total
            orders
          </p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-[32px] p-4 sm:p-8 border border-gray-100 min-h-[600px] flex flex-col">
        <div className="flex-grow overflow-x-auto no-scrollbar">
          <table className="w-full border-separate border-spacing-0 rounded-2xl border border-gray-100 overflow-hidden">
            <thead className="bg-gray-50">
              <tr className="text-gray-500 text-[11px] uppercase tracking-[0.15em] font-black">
                <th className="px-6 py-5 text-left">Order ID</th>
                <th className="px-6 py-5 text-left">Customer</th>
                <th className="px-6 py-5 text-left">Date</th>
                <th className="px-6 py-5 text-left">Status</th>
                <th className="px-6 py-5 text-right">Total Amount</th>
                <th className="px-6 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-32 text-center">
                    <div className="w-10 h-10 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map(order => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-5 text-sm font-bold text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-gray-900">
                        {order.user_username || 'Guest'}
                      </p>
                      <p className="text-xs text-gray-400 font-medium">
                        {order.user_email}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600 font-medium">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyles(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-gray-900 text-right">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <Link href={`/pharmacy/orders/${order.id}`}>
                          <button className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-(--color-primary-500) hover:bg-(--color-primary-50) transition-all cursor-pointer">
                            <FiEye size={18} />
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-32 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-300">
                      <FiShoppingBag size={48} />
                      <p className="text-lg font-bold">No orders found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 3. Dynamic Pagination Section */}
        {totalPages > 1 && (
          <div className="mt-8 pt-6 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-sm font-medium text-gray-500">
              Showing page{' '}
              <span className="text-gray-900 font-bold">{page}</span> of{' '}
              <span className="text-gray-900 font-bold">{totalPages}</span>
            </p>

            <div className="flex items-center gap-3">
              {/* Prev Arrow */}
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <FiChevronLeft size={18} />
              </button>

              {/* Page Numbers Container */}
              <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-white">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  num => (
                    <button
                      key={num}
                      onClick={() => setPage(num)}
                      className={`px-5 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                        page === num
                          ? 'bg-black text-white'
                          : 'text-gray-500 border-l border-gray-100 hover:bg-gray-50 first:border-l-0'
                      }`}
                    >
                      {num}
                    </button>
                  ),
                )}
              </div>

              {/* Next Arrow */}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
