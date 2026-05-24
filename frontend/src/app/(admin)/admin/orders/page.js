'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FiSearch,
  FiEdit2,
  FiChevronLeft,
  FiChevronRight,
  FiShoppingBag,
  FiFileText,
} from 'react-icons/fi';
import { useAdminOrders } from '../../hooks/useAdminOrders';
import { usePrescriptionAdmin } from '../../hooks/usePrescriptionAdmin';
import { useAdminContext } from '../../context/AdminContext';
import { formatCurrency, formatDate } from '@/app/(user)/lib/formatters';

/**
 * AdminOrdersPage
 * Strictly follows the Super Admin "Sharp" design system.
 * Features: Tabbed interface for Standard (Product) and Prescription orders.
 */
export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState('Standard'); // 'Standard' or 'Prescription'
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { unseenOrderCount, unseenPrescriptionCount } = useAdminContext();

  // Hooks for both order types
  const { orders, loading: ordersLoading, fetchOrders } = useAdminOrders();
  const {
    prescriptions,
    loading: rxLoading,
    fetchPrescriptions,
  } = usePrescriptionAdmin();

  useEffect(() => {
    // Fetch both to ensure counts are available in tab headers and search is synchronized
    fetchOrders({ page: activeTab === 'Standard' ? page : 1, search });
    fetchPrescriptions({
      page: activeTab === 'Prescription' ? page : 1,
      search,
    });
  }, [page, search, activeTab, fetchOrders, fetchPrescriptions]);

  const getStatusStyle = (status, type = 'Standard') => {
    const s = status?.toUpperCase();
    if (type === 'Standard') {
      switch (s) {
        case 'DELIVERED':
          return 'text-green-600 bg-green-50 border-green-100';
        case 'CANCELLED':
          return 'text-red-600 bg-red-50 border-red-100';
        case 'PENDING':
          return 'text-amber-600 bg-amber-50 border-amber-100';
        case 'SHIPPED':
          return 'text-blue-600 bg-blue-50 border-blue-100';
        case 'PROCESSING':
          return 'text-indigo-600 bg-indigo-50 border-indigo-100';
        default:
          return 'text-gray-600 bg-gray-50 border-gray-100';
      }
    } else {
      // Prescription Specific Statuses
      switch (s) {
        case 'USED':
          return 'text-green-600 bg-green-50 border-green-100';
        case 'REJECTED':
          return 'text-red-600 bg-red-50 border-red-100';
        case 'PENDING':
          return 'text-amber-600 bg-amber-50 border-amber-100';
        case 'APPROVED':
          return 'text-blue-600 bg-blue-50 border-blue-100';
        default:
          return 'text-gray-600 bg-gray-50 border-gray-100';
      }
    }
  };

  const currentData = activeTab === 'Standard' ? orders : prescriptions;
  const isLoading = activeTab === 'Standard' ? ordersLoading : rxLoading;

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#1B1B1B] tracking-tighter uppercase">
            Order Logistics
          </h1>
          <p className="text-[13px] text-[#6B6B5E] mt-1 font-medium">
            Manage standard medicine purchases and prescription verification
            requests.
          </p>
        </div>
      </div>

      {/* Tab Switcher - Sharp Design */}
      <div className="flex items-center gap-1 border-b border-gray-100">
        {['Standard', 'Prescription'].map(tab => {
          // 🟢 ARCHITECT FIX: Tab badge now consumes the Global Sovereign Count from AdminContext.
          // This eliminates page-limit blindness and ensures the count is consistent across the panel.
          const count =
            tab === 'Standard' ? unseenOrderCount : unseenPrescriptionCount;
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
              className={`px-8 py-4 font-mono text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer border-t-2 flex items-center gap-2 ${
                activeTab === tab
                  ? 'bg-white border-t-[#3A5A40] border-x border-x-gray-100 -mb-px text-[#3A5A40]'
                  : 'bg-transparent border-t-transparent text-[#8A8A78] hover:text-[#1B1B1B]'
              }`}
            >
              {tab} Orders
              {count > 0 && (
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-bold animate-in zoom-in duration-300 ${count > 1 ? 'bg-red-600' : 'bg-[#3A5A40]'}`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
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
            placeholder={`SEARCH ${activeTab.toUpperCase()} ORDERS...`}
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
                  ID No
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Customer
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Date
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Status
                </th>
                <th className="px-8 py-4 text-right border-r border-gray-100">
                  Value
                </th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading && currentData.results.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-8 py-20 text-center font-mono text-sm animate-pulse text-[#3A5A40]"
                  >
                    FETCHING DATA...
                  </td>
                </tr>
              ) : currentData.results.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-8 py-20 text-center flex flex-col items-center gap-4 text-[#8A8A78]"
                  >
                    <FiShoppingBag size={40} />
                    <p className="font-mono text-sm font-bold uppercase">
                      No {activeTab} Records Found
                    </p>
                  </td>
                </tr>
              ) : (
                currentData.results.map(item => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 transition-colors duration-200 group"
                  >
                    <td className="px-8 py-6 border-r border-gray-100 font-mono text-sm font-bold text-[#1B1B1B]">
                      <div className="flex items-center gap-2">
                        {activeTab === 'Standard' && !item.is_seen && (
                          <div
                            className="w-2 h-2 rounded-full bg-red-600 animate-pulse shrink-0"
                            title="New Unseen Order"
                          />
                        )}
                        {activeTab === 'Prescription' && !item.is_seen && (
                          <div
                            className="w-2 h-2 rounded-full bg-red-600 animate-pulse shrink-0"
                            title="New Unseen Prescription"
                          />
                        )}
                        <span>
                          {activeTab === 'Prescription'
                            ? `RX-${item.id}`
                            : `#${item.id}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1B1B1B] text-sm uppercase truncate max-w-[200px]">
                          {item.user_username ||
                            item.user_email?.split('@')[0] ||
                            'Guest'}
                        </span>
                        <span className="font-mono text-[10px] text-[#8A8A78] truncate max-w-[200px]">
                          {item.user_email}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100 font-mono text-xs text-[#6B6B5E]">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100">
                      <span
                        className={`px-3 py-1 border font-mono text-[10px] font-bold uppercase tracking-tighter ${getStatusStyle(item.status, activeTab)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100 text-right font-mono font-bold text-[#1B1B1B]">
                      {item.total ? (
                        formatCurrency(item.total)
                      ) : activeTab === 'Prescription' &&
                        item.items?.length > 0 ? (
                        <span className="text-[#3A5A40] text-[10px] font-bold uppercase tracking-widest">
                          {item.items.length} Item
                          {item.items.length > 1 ? 's' : ''} Assigned
                        </span>
                      ) : activeTab === 'Prescription' ? (
                        <span className="text-amber-500 text-[10px] font-bold uppercase tracking-widest">
                          Awaiting Review
                        </span>
                      ) : (
                        <span className="text-gray-300 italic">TBD</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end">
                        <Link
                          href={
                            activeTab === 'Prescription'
                              ? `/admin/prescriptions/${item.id}`
                              : `/admin/orders/${item.id}`
                          }
                        >
                          <button className="w-10 h-10 border border-gray-200 flex items-center justify-center text-[#1B1B1B] hover:bg-[#3A5A40] hover:text-white transition-all duration-300 cursor-pointer">
                            {activeTab === 'Prescription' ? (
                              <FiFileText size={16} />
                            ) : (
                              <FiEdit2 size={16} />
                            )}
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
          Total {activeTab} Records:{' '}
          <span className="text-[#1B1B1B]">{currentData.count}</span>
        </p>
        <div className="flex items-center gap-0 border border-gray-200 bg-white">
          <button
            disabled={page === 1 || isLoading}
            onClick={() => setPage(p => p - 1)}
            className="w-10 h-10 flex items-center justify-center border-r border-gray-200 hover:bg-gray-50 disabled:opacity-20 cursor-pointer"
          >
            <FiChevronLeft size={18} />
          </button>
          <div className="px-6 font-mono text-xs font-bold text-[#1B1B1B] uppercase tracking-widest">
            Page {page}
          </div>
          <button
            disabled={page * 10 >= currentData.count || isLoading}
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
