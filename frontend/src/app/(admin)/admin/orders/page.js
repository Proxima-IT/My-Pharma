'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FiSearch,
  FiEdit2,
  FiChevronLeft,
  FiChevronRight,
  FiShoppingBag,
} from 'react-icons/fi';
import { useAdminOrders } from '../../hooks/useAdminOrders';
import { formatCurrency, formatDate } from '@/app/(user)/lib/formatters';

export default function AdminOrdersPage() {
  const { orders, loading, fetchOrders } = useAdminOrders();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrders({ page, search });
  }, [page, search, fetchOrders]);

  const getStatusStyle = status => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'text-green-600 bg-green-50 border-green-100';
      case 'CANCELLED':
        return 'text-red-600 bg-red-50 border-red-100';
      case 'PENDING':
        return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'SHIPPED':
        return 'text-blue-600 bg-blue-50 border-blue-100';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#1B1B1B] tracking-tighter uppercase">
            Customer Orders
          </h1>
          <p className="text-[13px] text-[#6B6B5E] mt-1 font-medium">
            View and manage all medicine orders from your customers.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-md bg-white border border-gray-100 p-1">
        <div className="relative">
          <FiSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A78]"
            size={16}
          />
          <input
            type="text"
            placeholder="SEARCH BY ORDER ID OR NAME..."
            className="w-full h-10 pl-10 pr-4 bg-transparent rounded-none text-sm font-mono focus:outline-none uppercase tracking-tight placeholder:text-gray-300"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-100 rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[#1B1B1B] text-[11px] uppercase tracking-[0.2em] font-bold">
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Order No
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Customer Name
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Order Date
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Status
                </th>
                <th className="px-8 py-4 text-right border-r border-gray-100">
                  Total Price
                </th>
                <th className="px-8 py-4 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && orders.results.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="font-mono text-sm animate-pulse text-[#3A5A40]">
                      LOADING_ORDERS...
                    </div>
                  </td>
                </tr>
              ) : orders.results.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-8 py-20 text-center flex flex-col items-center gap-4 text-[#8A8A78]"
                  >
                    <FiShoppingBag size={40} />
                    <p className="font-mono text-sm font-bold uppercase">
                      No Orders Found
                    </p>
                  </td>
                </tr>
              ) : (
                orders.results.map(order => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50/50 transition-colors duration-200 group"
                  >
                    <td className="px-8 py-6 border-r border-gray-100 font-mono text-sm font-bold text-[#1B1B1B]">
                      #{order.id}
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1B1B1B] text-sm uppercase">
                          {order.user_username || 'Guest User'}
                        </span>
                        <span className="font-mono text-[10px] text-[#8A8A78]">
                          {order.user_email}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100 font-mono text-xs text-[#6B6B5E]">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100">
                      <span
                        className={`px-3 py-1 border font-mono text-[10px] font-bold uppercase tracking-tighter ${getStatusStyle(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100 text-right font-mono font-bold text-[#1B1B1B]">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end">
                        <Link href={`/admin/orders/${order.id}`}>
                          <button className="w-10 h-10 border border-gray-200 flex items-center justify-center text-[#1B1B1B] hover:bg-[#3A5A40] hover:text-white transition-all duration-300 cursor-pointer">
                            <FiEdit2 size={16} />
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <p className="font-mono text-[11px] font-bold text-[#8A8A78] uppercase">
          Total Orders: <span className="text-[#1B1B1B]">{orders.count}</span>
        </p>
        <div className="flex items-center gap-0 border border-gray-200 bg-white">
          <button
            disabled={page === 1 || loading}
            onClick={() => setPage(p => p - 1)}
            className="w-10 h-10 flex items-center justify-center border-r border-gray-200 hover:bg-gray-50 disabled:opacity-20 cursor-pointer"
          >
            <FiChevronLeft size={18} />
          </button>
          <div className="px-4 font-mono text-xs font-bold text-[#1B1B1B]">
            PAGE {page}
          </div>
          <button
            disabled={orders.results.length < 10 || loading}
            onClick={() => setPage(p => p + 1)}
            className="w-10 h-10 flex items-center justify-center border-l border-gray-200 hover:bg-gray-50 disabled:opacity-20 cursor-pointer"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
