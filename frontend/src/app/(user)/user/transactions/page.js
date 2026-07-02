'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiCreditCard,
} from 'react-icons/fi';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { useOrders } from '../../hooks/useOrders';

/**
 * TransactionHistoryPage
 * Refactored: Fixed "loadOrders is not a function" error by syncing with the hook's internal state management.
 * Logic: Uses the hook's built-in page and filter states to drive data fetching.
 * Design: White background, 1px Borders, Black text, Rounded-[32px].
 */
export default function TransactionHistoryPage() {
  // Syncing with the hook's returned properties: refresh (the function), page, setPage, etc.
  const { orders, isLoading, page, setPage, totalPages, filter, setFilter } =
    useOrders();

  const [selectedTxns, setSelectedTxns] = useState([]);
  const filters = ['All', 'Completed', 'Pending', 'Failed'];

  // Transform Orders into Transaction View (Only for display purposes)
  const transactions = useMemo(() => {
    if (!orders) return [];
    // If orders is an array (from hook results)
    const list = Array.isArray(orders) ? orders : [];
    return list.map(order => ({
      id: order.id,
      order_id: order.id,
      created_at: order.created_at,
      // Use the actual gateway transaction ID if available, else fallback to order ID
      txn_id: order.payment_id || `TRX-${order.id}`,
      payment_method: order.payment_method || 'COD',
      status: (order.payment_status || 'PENDING').toUpperCase(),
      amount: order.total,
    }));
  }, [orders]);

  // Filtering Logic (Since we are using the hook's orders which are already filtered by status)
  const displayTransactions = transactions;

  const handleSelectAll = e => {
    if (e.target.checked) {
      setSelectedTxns(displayTransactions.map(t => t.id));
    } else {
      setSelectedTxns([]);
    }
  };

  const handleSelectOne = (e, id) => {
    e.stopPropagation();
    setSelectedTxns(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
  };

  const getStatusStyles = status => {
    switch (status) {
      case 'PAID':
        return 'text-green-600 bg-green-50 border-green-100';
      case 'PENDING':
        return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'FAILED':
      case 'CANCELLED':
        return 'text-red-600 bg-red-50 border-red-100';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const formatStatusDisplay = status => {
    if (status === 'PAID') return 'Completed';
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Mobile Header */}
      <div className="flex items-center gap-4 lg:hidden mb-2">
        <Link href="/user" className="p-2 -ml-2 text-gray-600">
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Transaction History</h1>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[32px] p-6 md:p-8 border border-gray-100 min-h-[600px] flex flex-col shadow-none text-black">
        {/* 1. Filter Tabs */}
        <div className="bg-[#FCFCFD] p-2 rounded-full mb-8 w-fit max-w-full border border-[#F1F0F0] overflow-hidden">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  setPage(1); // Reset to page 1 on filter change
                }}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border whitespace-nowrap cursor-pointer ${
                  filter === f
                    ? 'bg-black text-white border-black shadow-none'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Transaction Table */}
        <div className="flex-grow overflow-x-auto no-scrollbar">
          <table className="w-full border-separate border-spacing-0 rounded-2xl border border-gray-100 overflow-hidden">
            <thead className="bg-[#F6F8FA]">
              <tr className="text-[#666D80] text-[11px] font-black uppercase tracking-widest">
                <th className="px-6 py-4 text-left w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer"
                    onChange={handleSelectAll}
                    checked={
                      selectedTxns.length === displayTransactions.length &&
                      displayTransactions.length > 0
                    }
                  />
                </th>
                <th className="px-4 py-4 text-left">Order Ref</th>
                <th className="px-4 py-4 text-left">Date</th>
                <th className="px-4 py-4 text-left">Transaction ID</th>
                <th className="px-4 py-4 text-left">Method</th>
                <th className="px-4 py-4 text-left">Status</th>
                <th className="px-4 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        Syncing Records...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : displayTransactions.length > 0 ? (
                displayTransactions.map(txn => (
                  <tr
                    key={txn.id}
                    className="hover:bg-gray-50/50 transition-colors group cursor-default"
                  >
                    <td className="px-6 py-5">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer"
                        checked={selectedTxns.includes(txn.id)}
                        onChange={e => handleSelectOne(e, txn.id)}
                      />
                    </td>
                    <td className="px-4 py-5 text-sm font-bold text-gray-900">
                      <Link
                        href={`/user/orders/${txn.order_id}`}
                        className="hover:text-(--color-primary-500) transition-colors uppercase"
                      >
                        #{txn.order_id}
                      </Link>
                    </td>
                    <td className="px-4 py-5 text-[13px] text-gray-500 font-medium">
                      {formatDate(txn.created_at)}
                    </td>
                    <td className="px-4 py-5 text-[12px] text-gray-400 font-mono">
                      {txn.txn_id}
                    </td>
                    <td className="px-4 py-5 text-[11px] font-black text-gray-500 uppercase tracking-tight">
                      {txn.payment_method === 'ONLINE'
                        ? 'SSL Commerz'
                        : txn.payment_method?.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-tighter ${getStatusStyles(txn.status)}`}
                      >
                        {formatStatusDisplay(txn.status)}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-[15px] font-black text-gray-900 text-right">
                      {formatCurrency(txn.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-24 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-4">
                      <FiCreditCard size={40} className="opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-widest">
                        No matching transactions in registry.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 3. Pagination Footer */}
        <div className="mt-8 pt-6 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Page <span className="text-black">{page}</span> of{' '}
            <span className="text-black">{totalPages}</span>
          </p>

          <div className="flex items-center gap-3">
            <button
              disabled={page === 1 || isLoading}
              onClick={() => setPage(p => p - 1)}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all disabled:opacity-30 cursor-pointer shadow-none"
            >
              <FiChevronLeft size={18} />
            </button>

            <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-white shadow-none">
              <span className="px-5 py-2.5 text-xs font-black bg-black text-white">
                {page}
              </span>
            </div>

            <button
              disabled={page === totalPages || isLoading}
              onClick={() => setPage(p => p + 1)}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all disabled:opacity-30 cursor-pointer shadow-none"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
