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
        return 'border-(--color-admin-success) text-(--color-admin-success) bg-green-50/50';
      case 'SHIPPED':
        return 'border-blue-600 text-blue-600 bg-blue-50/50';
      case 'CANCELLED':
        return 'border-(--color-admin-error) text-(--color-admin-error) bg-red-50/50';
      case 'PENDING':
        return 'border-(--color-admin-warning) text-(--color-admin-warning) bg-amber-50/50';
      default:
        return 'border-(--color-text-secondary) text-(--color-text-secondary) bg-gray-50/50';
    }
  };

  if (error) {
    return (
      <div className="w-full py-20 text-center bg-(--color-admin-card) border border-(--color-admin-error) rounded-none">
        <p className="text-(--color-admin-error) font-mono font-bold uppercase tracking-widest">
          Error::System_Failure: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20 bg-(--color-admin-bg)">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-4 border-(--color-admin-border) pb-6">
        <div>
          <span className="font-mono text-xs font-bold text-(--color-admin-primary) uppercase tracking-widest">
            Database / Records / Orders
          </span>
          <h1 className="text-4xl font-black text-(--color-admin-navy) tracking-tighter uppercase">
            Order Management
          </h1>
          <p className="font-mono text-[11px] text-(--color-text-secondary) mt-2 uppercase">
            TOTAL_RECORDS:{' '}
            <span className="text-(--color-admin-navy) font-bold">
              {totalCount}
            </span>{' '}
            | CURRENT_BATCH:{' '}
            <span className="text-(--color-admin-navy) font-bold">
              {orders.length}
            </span>
          </p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-(--color-admin-card) border border-(--color-admin-border) rounded-none flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-(--color-admin-navy) text-white text-[11px] uppercase tracking-[0.2em] font-bold">
                <th className="px-6 py-4 text-left border-r border-white/10">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left border-r border-white/10">
                  Customer Entity
                </th>
                <th className="px-6 py-4 text-left border-r border-white/10">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left border-r border-white/10">
                  Status_Code
                </th>
                <th className="px-6 py-4 text-right border-r border-white/10">
                  Net_Amount
                </th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-admin-border)">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-32 text-center">
                    <div className="font-mono text-sm animate-pulse tracking-widest text-(--color-admin-primary)">
                      FETCHING_DATA_FROM_SERVER...
                    </div>
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map(order => (
                  <tr
                    key={order.id}
                    className="hover:bg-white transition-colors duration-200 group"
                  >
                    <td className="px-6 py-5 border-r border-(--color-admin-border) font-mono text-sm font-bold text-(--color-admin-navy)">
                      #{order.id}
                    </td>
                    <td className="px-6 py-5 border-r border-(--color-admin-border)">
                      <p className="text-sm font-bold text-(--color-admin-navy) uppercase tracking-tight">
                        {order.user_username || 'Guest_User'}
                      </p>
                      <p className="font-mono text-[10px] text-(--color-text-secondary)">
                        {order.user_email}
                      </p>
                    </td>
                    <td className="px-6 py-5 border-r border-(--color-admin-border) font-mono text-xs text-(--color-text-secondary)">
                      {formatDate(order.created_at).toUpperCase()}
                    </td>
                    <td className="px-6 py-5 border-r border-(--color-admin-border)">
                      <span
                        className={`inline-block px-3 py-1 border text-[10px] font-bold uppercase ${getStatusStyles(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 border-r border-(--color-admin-border) font-mono text-sm font-bold text-(--color-admin-navy) text-right">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Link href={`/pharmacy/orders/${order.id}`}>
                        <button className="inline-flex items-center justify-center w-10 h-10 border border-(--color-admin-border) text-(--color-admin-navy) hover:bg-(--color-admin-accent) hover:text-white hover:border-(--color-admin-accent) transition-all duration-300 cursor-pointer rounded-none">
                          <FiEye size={18} />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4 text-(--color-text-secondary)">
                      <FiShoppingBag size={48} />
                      <p className="font-mono text-sm font-bold uppercase tracking-widest">
                        Zero_Records_Found
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-(--color-admin-border) bg-(--color-admin-bg) flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="font-mono text-[11px] font-bold text-(--color-text-secondary) uppercase">
              Page <span className="text-(--color-admin-navy)">{page}</span> //
              Total{' '}
              <span className="text-(--color-admin-navy)">{totalPages}</span>
            </p>

            <div className="flex items-center gap-0 border border-(--color-admin-border) bg-white">
              {/* Prev Button */}
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-12 h-12 flex items-center justify-center border-r border-(--color-admin-border) text-(--color-admin-navy) hover:bg-(--color-admin-accent) hover:text-white transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
              >
                <FiChevronLeft size={20} />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  num => (
                    <button
                      key={num}
                      onClick={() => setPage(num)}
                      className={`w-12 h-12 font-mono text-xs font-bold transition-all border-r border-(--color-admin-border) last:border-r-0 cursor-pointer ${
                        page === num
                          ? 'bg-(--color-admin-primary) text-white'
                          : 'text-(--color-admin-navy) hover:bg-(--color-admin-accent) hover:text-white'
                      }`}
                    >
                      {num.toString().padStart(2, '0')}
                    </button>
                  ),
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-12 h-12 flex items-center justify-center border-l border-(--color-admin-border) text-(--color-admin-navy) hover:bg-(--color-admin-accent) hover:text-white transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
