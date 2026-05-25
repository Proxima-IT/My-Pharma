'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiShoppingBag,
  FiFileText,
} from 'react-icons/fi';
import { useOrders } from '../../hooks/useOrders';
import { usePrescriptions } from '../../hooks/usePrescriptions';
import { formatCurrency, formatDate } from '../../lib/formatters';

/**
 * MyOrdersPage Component
 * Updated: Merges standard orders and prescription orders into a unified list.
 * Features: Dynamic routing based on order type (Standard vs Prescription).
 */
export default function MyOrdersPage() {
  const router = useRouter();
  const {
    orders,
    filter,
    setFilter,
    page,
    setPage,
    totalPages,
    isLoading: ordersLoading,
  } = useOrders();

  // Fetch prescription-based orders
  const { prescriptions, isLoading: rxLoading } = usePrescriptions();

  const [selectedOrders, setSelectedOrders] = useState([]);
  const filters = ['All', 'Confirmed', 'Delivered', 'Cancelled'];

  // 1. Merge and Sort Orders
  const combinedOrders = useMemo(() => {
    const stdOrders = orders.map(o => ({ ...o, isPrescription: false }));
    const rxOrders = prescriptions.map(p => ({ ...p, isPrescription: true }));

    const merged = [...stdOrders, ...rxOrders];

    // Filter by status if not 'All'
    const filtered =
      filter === 'All'
        ? merged
        : merged.filter(o => o.status?.toUpperCase() === filter.toUpperCase());

    // Sort by date descending
    return filtered.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
  }, [orders, prescriptions, filter]);

  const handleSelectAll = e => {
    if (e.target.checked) {
      setSelectedOrders(combinedOrders.map(o => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOne = (e, id) => {
    e.stopPropagation();
    setSelectedOrders(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
  };

  const getStatusStyles = status => {
    const s = status?.toUpperCase();
    if (s === 'DELIVERED')
      return 'text-(--success-600) bg-(--success-50) border-(--success-100)';
    if (s === 'CONFIRMED') return 'text-blue-600 bg-blue-50 border-blue-100';
    if (s === 'CANCELLED') return 'text-red-600 bg-red-50 border-red-100';
    return 'text-amber-600 bg-amber-50 border-amber-100';
  };

  const isLoading = ordersLoading || rxLoading;

  return (
    <div className="grid grid-cols-1 min-w-0 w-full max-w-full animate-in fade-in duration-700 pb-20 overflow-hidden">
      <div className="flex items-center gap-4 lg:hidden mb-4 px-1">
        <Link
          href="/user"
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          My Orders
        </h1>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100/50 min-h-[600px] flex flex-col w-full min-w-0 overflow-hidden p-4 md:p-6 lg:p-8 xl:p-10">
        {/* 1. Filter Tabs */}
        <div className="bg-gray-50/50 p-1.5 rounded-full mb-8 w-fit max-w-full border border-gray-100 overflow-hidden shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar px-1">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 md:px-8 py-2 rounded-full text-[12px] md:text-[13px] font-bold transition-all border whitespace-nowrap cursor-pointer ${
                  filter === f
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Table Section */}
        <div className="relative w-full min-w-0 flex-1 overflow-hidden">
          <div className="w-full overflow-x-auto rounded-2xl border border-gray-100 no-scrollbar">
            <table className="w-full border-separate border-spacing-0 min-w-[1000px] table-auto">
              <thead className="bg-gray-50">
                <tr className="text-gray-400 text-[10px] font-black uppercase tracking-[0.15em]">
                  <th className="px-6 py-5 text-left w-12">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer"
                      onChange={handleSelectAll}
                      checked={
                        selectedOrders.length === combinedOrders.length &&
                        combinedOrders.length > 0
                      }
                    />
                  </th>
                  <th className="px-4 py-5 text-left">Order ID</th>
                  <th className="px-4 py-5 text-left">Type</th>
                  <th className="px-4 py-5 text-left">Shipping To</th>
                  <th className="px-4 py-5 text-left">Date</th>
                  <th className="px-4 py-5 text-left">Status</th>
                  <th className="px-6 py-5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="py-32 text-center">
                      <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : combinedOrders.length > 0 ? (
                  combinedOrders.map(order => (
                    <tr
                      key={
                        order.isPrescription
                          ? `rx-${order.id}`
                          : `std-${order.id}`
                      }
                      onClick={() =>
                        router.push(
                          order.isPrescription
                            ? `/user/orders/prescription/${order.id}`
                            : `/user/orders/${order.id}`,
                        )
                      }
                      className="hover:bg-gray-50/30 transition-colors group cursor-pointer"
                    >
                      <td
                        className="px-6 py-6"
                        onClick={e => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer"
                          checked={selectedOrders.includes(order.id)}
                          onChange={e => handleSelectOne(e, order.id)}
                        />
                      </td>
                      <td className="px-4 py-6 text-sm font-bold text-gray-900">
                        {order.isPrescription
                          ? `RX-${order.id}`
                          : `#${order.id}`}
                      </td>
                      <td className="px-4 py-6">
                        <div className="flex items-center gap-2">
                          {order.isPrescription ? (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase border border-purple-100">
                              <FiFileText size={12} /> Prescription
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase border border-blue-100">
                              <FiShoppingBag size={12} /> Standard
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-6">
                        <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">
                          {order.user_username ||
                            order.user_email?.split('@')[0] ||
                            'Customer'}
                        </p>
                        <p className="text-[11px] text-gray-400 font-medium truncate max-w-[180px]">
                          {order.shipping_address ||
                            order.shipping_address_detail ||
                            'No Address'}
                        </p>
                      </td>
                      <td className="px-4 py-6 text-sm text-gray-500 font-medium">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-6">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyles(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-sm font-black text-gray-900 text-right">
                        {order.total ? (
                          formatCurrency(order.total)
                        ) : (
                          <span className="text-gray-300 italic text-[11px]">
                            TBD
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-32 text-center text-gray-300">
                      <FiShoppingBag size={48} className="mx-auto mb-2" />
                      <p className="text-lg font-bold">No orders found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Pagination Section */}
        <div className="mt-auto pt-6 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-6 shrink-0">
          <p className="text-sm font-medium text-gray-500">
            Showing page <span className="text-gray-900 font-bold">{page}</span>{' '}
            of{' '}
            <span className="text-gray-900 font-bold">{totalPages || 1}</span>
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all disabled:opacity-30 cursor-pointer"
            >
              <FiChevronLeft size={18} />
            </button>
            <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-white">
              {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(
                num => (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`px-5 py-2.5 text-xs font-bold transition-all cursor-pointer ${page === num ? 'bg-black text-white' : 'text-gray-500 border-l border-gray-100 hover:bg-gray-50 first:border-l-0'}`}
                  >
                    {num}
                  </button>
                ),
              )}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages || 1, p + 1))}
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
