'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useOrders } from '../../hooks/useOrders';
import { formatCurrency, formatDate } from '../../lib/formatters';

export default function MyOrdersPage() {
  const router = useRouter();
  const {
    orders,
    filter,
    setFilter,
    page,
    setPage,
    totalPages,
    isLoading,
    error,
  } = useOrders();

  const [selectedOrders, setSelectedOrders] = useState([]);
  const filters = ['All', 'Confirmed', 'Delivered', 'Cancelled'];

  const handleSelectAll = e => {
    if (e.target.checked) {
      setSelectedOrders(orders.map(o => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOne = (e, id) => {
    e.stopPropagation(); // Prevent row click navigation
    setSelectedOrders(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
  };

  const getStatusStyles = status => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'text-(--success-600) bg-(--success-50) border-(--success-100)';
      case 'CONFIRMED':
        return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'CANCELLED':
        return 'text-red-600 bg-red-50 border-red-100';
      case 'PENDING':
        return 'text-amber-600 bg-amber-50 border-amber-100';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Mobile Sub-Page Header */}
      <div className="flex items-center gap-4 lg:hidden mb-2">
        <Link href="/user" className="p-2 -ml-2 text-gray-600">
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[32px] p-6 md:p-8 border border-gray-100/50 min-h-[600px] flex flex-col">
        {/* 1. Categories / Tabs Wrapper */}
        <div className="bg-gray-25 p-2 rounded-full mb-8 w-fit max-w-full border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
                  filter === f
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Table Section */}
        <div className="flex-grow overflow-x-auto no-scrollbar">
          <table className="w-full border-separate border-spacing-0 rounded-2xl border border-gray-100 overflow-hidden">
            <thead className="bg-gray-50">
              <tr className="text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 text-left w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer"
                    onChange={handleSelectAll}
                    checked={
                      selectedOrders.length === orders.length &&
                      orders.length > 0
                    }
                  />
                </th>
                <th className="px-4 py-4 font-semibold text-left">Order ID</th>
                <th className="px-4 py-4 font-semibold text-left">
                  Shipping Address
                </th>
                <th className="px-4 py-4 font-semibold text-left">
                  Phone Number
                </th>
                <th className="px-4 py-4 font-semibold text-left">Date</th>
                <th className="px-4 py-4 font-semibold text-left">
                  Payment Type
                </th>
                <th className="px-4 py-4 font-semibold text-left">Status</th>
                <th className="px-4 py-4 font-semibold text-right">
                  Amount Payable
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="py-20 text-center">
                    <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan="8"
                    className="py-20 text-center text-red-500 font-bold"
                  >
                    {error}
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map(order => (
                  <tr
                    key={order.id}
                    onClick={() => router.push(`/user/orders/${order.id}`)}
                    className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                  >
                    <td
                      className="px-6 py-5"
                      onClick={e => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer"
                        checked={selectedOrders.includes(order.id)}
                        onChange={e => handleSelectOne(e, order.id)}
                      />
                    </td>
                    <td className="px-4 py-5 text-sm font-bold text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-4 py-5 min-w-[220px]">
                      <p className="text-sm font-bold text-gray-900 mb-0.5">
                        {order.user_username || 'Customer'}
                      </p>
                      <p
                        className="text-xs text-gray-500 truncate max-w-[200px]"
                        title={order.shipping_address}
                      >
                        {order.shipping_address}
                      </p>
                    </td>
                    <td className="px-4 py-5 text-sm text-gray-600 font-medium">
                      {order.phone || 'N/A'}
                    </td>
                    <td className="px-4 py-5 text-sm text-gray-600 font-medium">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-5 text-xs font-bold text-gray-500 uppercase tracking-tight">
                      {order.payment_method?.replace(/_/g, ' ') || 'COD'}
                    </td>
                    <td className="px-4 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyles(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-sm font-bold text-gray-900 text-right">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="py-20 text-center text-gray-400 font-medium"
                  >
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 3. Table Bottom / Pagination */}
        <div className="mt-8 pt-6 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-sm font-medium text-gray-500">
            Showing page <span className="text-gray-900 font-bold">{page}</span>{' '}
            of{' '}
            <span className="text-gray-900 font-bold">{totalPages || 1}</span>
          </p>

          <div className="flex items-center gap-3">
            {/* Prev Arrow */}
            <button
              onClick={e => {
                e.stopPropagation();
                setPage(p => Math.max(1, p - 1));
              }}
              disabled={page === 1}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all disabled:opacity-30 cursor-pointer"
            >
              <FiChevronLeft size={18} />
            </button>

            {/* Page Numbers Container - Dynamic */}
            <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-white">
              {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(
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
              onClick={e => {
                e.stopPropagation();
                setPage(p => Math.min(totalPages || 1, p + 1));
              }}
              disabled={page === (totalPages || 1)}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all disabled:opacity-30 cursor-pointer"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
