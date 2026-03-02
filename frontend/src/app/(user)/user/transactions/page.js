'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { mockTransactions } from '@/data/transactionsMock';

export default function TransactionHistoryPage() {
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedTxns, setSelectedTxns] = useState([]);

  const filters = ['All', 'Completed', 'Pending', 'Failed'];
  const totalPages = 1; // Mock total pages

  // Logic to handle filtering
  const displayTransactions =
    filter === 'All'
      ? mockTransactions
      : mockTransactions.filter(
          t => t.status.toUpperCase() === filter.toUpperCase(),
        );

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
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-50 border-green-100';
      case 'PENDING':
        return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'FAILED':
        return 'text-red-600 bg-red-50 border-red-100';
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
        <h1 className="text-xl font-bold text-gray-900">Transaction History</h1>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[32px] p-6 md:p-8 border border-gray-100/50 min-h-[600px] flex flex-col">
        {/* 1. Categories / Tabs Wrapper */}
        <div className="bg-[#FCFCFD] p-2 rounded-full mb-8 w-fit max-w-full border border-[#F1F0F0] overflow-hidden">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-full text-xs font-medium transition-all border whitespace-nowrap cursor-pointer ${
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
            <thead className="bg-[#F6F8FA]">
              <tr className="text-[#666D80] text-xs uppercase tracking-wider">
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
                <th className="px-4 py-4 font-semibold text-left">Order ID</th>
                <th className="px-4 py-4 font-semibold text-left">Date</th>
                <th className="px-4 py-4 font-semibold text-left">Txn Id</th>
                <th className="px-4 py-4 font-semibold text-left">
                  Payment Type
                </th>
                <th className="px-4 py-4 font-semibold text-left">Status</th>
                <th className="px-4 py-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayTransactions.length > 0 ? (
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
                        className="hover:text-(--color-primary-500) transition-colors"
                      >
                        #{txn.order_id}
                      </Link>
                    </td>
                    <td className="px-4 py-5 text-sm text-gray-600 font-medium">
                      {formatDate(txn.created_at)}
                    </td>
                    <td className="px-4 py-5 text-sm text-gray-500 font-mono">
                      {txn.txn_id}
                    </td>
                    <td className="px-4 py-5 text-xs font-bold text-gray-500 uppercase tracking-tight">
                      {txn.payment_method?.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyles(txn.status)}`}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-sm font-bold text-gray-900 text-right">
                      {formatCurrency(txn.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="py-20 text-center text-gray-400 font-medium"
                  >
                    No transactions found.
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
            of <span className="text-gray-900 font-bold">{totalPages}</span>
          </p>

          <div className="flex items-center gap-3">
            <button
              disabled={page === 1}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all disabled:opacity-30 cursor-pointer"
            >
              <FiChevronLeft size={18} />
            </button>

            <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-white">
              <button className="px-5 py-2.5 text-xs font-bold bg-black text-white">
                1
              </button>
            </div>

            <button
              disabled={page === totalPages}
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
