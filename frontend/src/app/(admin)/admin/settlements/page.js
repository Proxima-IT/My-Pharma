'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FiSearch,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiCreditCard,
} from 'react-icons/fi';
import { useSettlementAdmin } from '../../hooks/useSettlementAdmin';
import AuthGuard from '@/app/(shared)/components/AuthGuard';

/**
 * Super Admin Settlement List Page
 * Fixed: Corrected AuthGuard import and role strings to prevent auto-redirect.
 * Design: Sharp Industrial (rounded-none, high contrast).
 */
export default function AdminSettlementListPage() {
  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN']}>
      <SettlementListContent />
    </AuthGuard>
  );
}

function SettlementListContent() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('access_token'));
    }
  }, []);

  const {
    settlements,
    loading,
    count,
    filters,
    updateFilters,
    nextPage,
    prevPage,
  } = useSettlementAdmin(token);

  const [search, setSearch] = useState('');

  // Debounced search logic
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      updateFilters({ search });
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const getStatusStyle = status => {
    switch (status) {
      case 'SETTLED':
        return 'text-green-600 bg-green-50 border-green-100';
      case 'PENDING':
        return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'CASH_DEPOSITED':
        return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'CANCELLED':
      case 'REFUNDED':
        return 'text-red-600 bg-red-50 border-red-100';
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
            Settlement Ledger
          </h1>
          <p className="text-[13px] text-[#6B6B5E] mt-1 font-medium">
            Review and finalize financial settlements for pharmacy orders.
          </p>
        </div>
        <div className="flex items-center gap-2 border border-gray-100 p-2 bg-gray-50">
          <span className="font-mono text-[10px] font-bold text-[#8A8A78] uppercase tracking-tighter">
            Mode:
          </span>
          <span className="font-mono text-[10px] font-bold text-[#3A5A40] uppercase">
            {' '}
            Financial Admin{' '}
          </span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white border border-gray-100 p-1">
        <div className="flex flex-1 w-full max-w-2xl gap-1">
          <div className="relative flex-1">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A78]"
              size={16}
            />
            <input
              type="text"
              placeholder="SEARCH BY ORDER ID..."
              className="w-full h-10 pl-10 pr-4 bg-transparent rounded-none text-sm font-mono focus:outline-none uppercase tracking-tight placeholder:text-gray-200 border-r border-gray-50"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="h-10 px-4 bg-transparent text-[11px] font-bold uppercase tracking-tighter outline-none border-r border-gray-50 cursor-pointer"
            value={filters.payment_method}
            onChange={e => updateFilters({ payment_method: e.target.value })}
          >
            <option value="">All Methods</option>
            <option value="COD">COD</option>
            <option value="ONLINE">Online</option>
          </select>

          <select
            className="h-10 px-4 bg-transparent text-[11px] font-bold uppercase tracking-tighter outline-none cursor-pointer"
            value={filters.status}
            onChange={e => updateFilters({ status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CASH_DEPOSITED">Cash Deposited</option>
            <option value="SETTLED">Settled</option>
          </select>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-white border border-gray-100 rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-50 text-[#1B1B1B] text-[11px] uppercase tracking-[0.2em] font-bold">
                <th className="px-8 py-4 border-r border-gray-100">
                  Order Reference
                </th>
                <th className="px-8 py-4 border-r border-gray-100">Method</th>
                <th className="px-8 py-4 border-r border-gray-100 text-right">
                  Gross
                </th>
                <th className="px-8 py-4 border-r border-gray-100 text-right text-red-600">
                  Comm.
                </th>
                <th className="px-8 py-4 border-r border-gray-100 text-right text-[#3A5A40]">
                  Net Payable
                </th>
                <th className="px-8 py-4 border-r border-gray-100 text-center">
                  Settlement Status
                </th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && settlements.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-8 py-20 text-center">
                    <div className="font-mono text-sm animate-pulse text-[#3A5A40] uppercase">
                      FETCHING LEDGER DATA...
                    </div>
                  </td>
                </tr>
              ) : settlements.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-8 py-20 text-center flex flex-col items-center gap-4 text-[#8A8A78]"
                  >
                    <FiCreditCard size={40} />
                    <p className="font-mono text-sm font-bold uppercase">
                      No records matching filters
                    </p>
                  </td>
                </tr>
              ) : (
                settlements.map(item => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 transition-colors duration-200 group"
                  >
                    <td className="px-8 py-6 border-r border-gray-100">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1B1B1B] text-sm uppercase tracking-tight">
                          #{item.order}
                        </span>
                        <span className="font-mono text-[10px] text-gray-400 font-bold uppercase">
                          {new Date(item.order_created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100">
                      <span className="font-mono text-[11px] font-bold uppercase text-gray-600 bg-gray-100 px-2 py-0.5 border border-gray-200">
                        {item.payment_method}
                      </span>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100 text-right font-mono text-sm">
                      {item.order_total}
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100 text-right font-mono text-sm text-red-500">
                      -{item.commission_amount}
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100 text-right font-mono text-sm font-bold text-[#3A5A40]">
                      {item.net_payable}
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100 text-center">
                      <span
                        className={`px-3 py-1 border font-mono text-[10px] font-bold uppercase tracking-tighter ${getStatusStyle(item.status)}`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end">
                        <Link href={`/admin/settlements/${item.id}`}>
                          <button className="w-9 h-9 border border-gray-200 flex items-center justify-center text-[#1B1B1B] hover:bg-[#3A5A40] hover:text-white transition-all duration-300 cursor-pointer">
                            <FiEye size={14} />
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

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-2">
        <p className="font-mono text-[11px] font-bold text-[#8A8A78] uppercase">
          Ledger Entries: <span className="text-[#1B1B1B]">{count}</span>
        </p>
        <div className="flex items-center gap-0 border border-gray-200 bg-white shadow-sm">
          <button
            disabled={filters.page === 1 || loading}
            onClick={prevPage}
            className="w-10 h-10 flex items-center justify-center border-r border-gray-200 hover:bg-gray-50 disabled:opacity-20 cursor-pointer"
          >
            <FiChevronLeft size={18} />
          </button>
          <div className="px-6 font-mono text-xs font-bold text-[#1B1B1B] flex items-center h-10">
            PAGE {filters.page}
          </div>
          <button
            disabled={filters.page * 10 >= count || loading}
            onClick={nextPage}
            className="w-10 h-10 flex items-center justify-center border-l border-gray-200 hover:bg-gray-50 disabled:opacity-20 cursor-pointer"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
