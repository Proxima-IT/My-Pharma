'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiTag,
  FiChevronLeft,
  FiChevronRight,
  FiActivity,
  FiClock,
  FiSearch,
  FiFilter,
} from 'react-icons/fi';
import { useCouponAdmin } from '@/app/(admin)/hooks/useCouponAdmin';
import { formatCurrency, formatDate } from '@/app/(user)/lib/formatters';

/**
 * Super Admin - Coupon Management List
 * Strictly follows the Super Admin "Sharp Minimalist" design system.
 * Features: Paginated list, status indicators, and technical metadata.
 */
export default function CouponListPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(''); // 'PERCENT' or 'FIXED'
  const { coupons, loading, error, page, setPage, fetchCoupons, deleteCoupon } =
    useCouponAdmin();

  useEffect(() => {
    fetchCoupons({ page, search, discount_type: typeFilter });
  }, [page, search, typeFilter, fetchCoupons]);

  const handleDelete = async (id, code) => {
    if (window.confirm(`Are you sure you want to delete coupon: [${code}]?`)) {
      try {
        await deleteCoupon(id);
      } catch (err) {
        alert('Failed to delete record.');
      }
    }
  };

  const getStatusStyle = coupon => {
    const now = new Date();
    const until = coupon.valid_until ? new Date(coupon.valid_until) : null;

    if (!coupon.is_active) return 'bg-gray-50 text-gray-400 border-gray-200';
    if (until && until < now) return 'bg-red-50 text-red-600 border-red-100';
    if (coupon.max_uses && coupon.times_used >= coupon.max_uses)
      return 'bg-amber-50 text-amber-600 border-amber-100';

    return 'bg-green-50 text-green-700 border-green-100';
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-black text-[#1B1B1B] tracking-tighter uppercase leading-none">
            Coupon Management
          </h1>
          <p className="text-[13px] text-[#6B6B5E] mt-2 font-medium">
            Configure promotional codes, discount thresholds, and campaign
            validity.
          </p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="h-12 px-6 bg-[#1B1B1B] text-white font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-[#3A5A40] transition-all rounded-none"
        >
          <FiPlus size={16} /> Create New Coupon
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border border-gray-100 p-6 bg-white">
          <span className="block font-mono text-[10px] font-bold text-[#8A8A78] uppercase tracking-widest mb-1">
            Total_Registry
          </span>
          <span className="text-2xl font-black text-[#1B1B1B] font-mono">
            {coupons.count}
          </span>
        </div>
        <div className="border border-gray-100 p-6 bg-white">
          <span className="block font-mono text-[10px] font-bold text-[#8A8A78] uppercase tracking-widest mb-1">
            Active_Now
          </span>
          <span className="text-2xl font-black text-[#3A5A40] font-mono">
            {coupons.results.filter(c => c.is_active).length}
          </span>
        </div>
        <div className="border border-gray-100 p-6 bg-white">
          <span className="block font-mono text-[10px] font-bold text-[#8A8A78] uppercase tracking-widest mb-1">
            Total_Redemptions
          </span>
          <span className="text-2xl font-black text-[#1B1B1B] font-mono">
            {coupons.results.reduce((acc, curr) => acc + curr.times_used, 0)}
          </span>
        </div>
        <div className="border border-gray-100 p-6 bg-[#F1F1E6]">
          <span className="block font-mono text-[10px] font-bold text-[#8A8A78] uppercase tracking-widest mb-1">
            System_Status
          </span>
          <span className="text-[11px] font-bold text-[#1B1B1B] uppercase flex items-center gap-2">
            <FiActivity className="text-green-600" /> Operational
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white border border-gray-100 p-1 flex items-center">
          <FiSearch className="ml-3 text-gray-400" />
          <input
            className="w-full h-10 px-3 font-mono text-xs uppercase outline-none"
            placeholder="Search by code (e.g. SAVE10)..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-full md:w-64 bg-white border border-gray-100 p-1 flex items-center">
          <FiFilter className="ml-3 text-gray-400" />
          <select
            className="w-full h-10 px-3 font-mono text-xs uppercase outline-none bg-transparent cursor-pointer"
            value={typeFilter}
            onChange={e => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Types</option>
            <option value="PERCENT">Percentage</option>
            <option value="FIXED">Fixed Amount</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-5 font-mono text-[10px] font-black text-[#8A8A78] uppercase tracking-widest">
                  Code_Identifier
                </th>
                <th className="p-5 font-mono text-[10px] font-black text-[#8A8A78] uppercase tracking-widest">
                  Discount_Value
                </th>
                <th className="p-5 font-mono text-[10px] font-black text-[#8A8A78] uppercase tracking-widest">
                  Usage_Metrics
                </th>
                <th className="p-5 font-mono text-[10px] font-black text-[#8A8A78] uppercase tracking-widest">
                  Validity_Period
                </th>
                <th className="p-5 font-mono text-[10px] font-black text-[#8A8A78] uppercase tracking-widest text-center">
                  Status
                </th>
                <th className="p-5 font-mono text-[10px] font-black text-[#8A8A78] uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="p-20 text-center font-mono text-xs text-gray-400 uppercase tracking-widest animate-pulse"
                  >
                    Accessing_Secure_Vault...
                  </td>
                </tr>
              ) : coupons.results.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="p-20 text-center font-mono text-xs text-gray-400 uppercase tracking-widest"
                  >
                    Zero_Coupons_Found
                  </td>
                </tr>
              ) : (
                coupons.results.map(coupon => (
                  <tr
                    key={coupon.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 flex items-center justify-center text-[#1B1B1B] border border-gray-100">
                          <FiTag />
                        </div>
                        <span className="font-mono text-sm font-bold text-[#1B1B1B] uppercase tracking-tight">
                          {coupon.code}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-[#1B1B1B]">
                          {coupon.discount_type === 'PERCENT'
                            ? `${parseFloat(coupon.discount_value)}%`
                            : formatCurrency(coupon.discount_value)}
                        </span>
                        <span className="text-[9px] font-mono text-[#8A8A78] uppercase">
                          Min Order: {formatCurrency(coupon.min_order_amount)}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between w-32 font-mono text-[9px] font-bold uppercase">
                          <span>Used</span>
                          <span>
                            {coupon.times_used} / {coupon.max_uses || '∞'}
                          </span>
                        </div>
                        <div className="w-32 h-1 bg-gray-100">
                          <div
                            className="h-full bg-[#3A5A40]"
                            style={{
                              width: `${coupon.max_uses ? (coupon.times_used / coupon.max_uses) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col font-mono text-[10px] text-[#6B6B5E] gap-1">
                        <span className="flex items-center gap-1">
                          <FiClock size={10} /> {formatDate(coupon.valid_from)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiClock size={10} />{' '}
                          {coupon.valid_until
                            ? formatDate(coupon.valid_until)
                            : 'NO_EXPIRY'}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span
                        className={`px-2 py-1 border font-mono text-[9px] font-bold uppercase tracking-tighter ${getStatusStyle(coupon)}`}
                      >
                        {coupon.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/coupons/edit/${coupon.id}`}
                          className="p-2 text-[#1B1B1B] hover:bg-[#E8F0EA] hover:text-[#3A5A40] transition-all border border-transparent"
                          title="Edit Record"
                        >
                          <FiEdit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(coupon.id, coupon.code)}
                          className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent cursor-pointer"
                          title="Purge Record"
                        >
                          <FiTrash2 size={16} />
                        </button>
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
      <div className="flex items-center justify-between font-mono text-[10px] text-[#8A8A78] uppercase tracking-widest pt-4">
        <div className="flex items-center gap-6">
          <span>Database: core_coupon_v1</span>
          <span>Sync: Real-time</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="p-2 border border-gray-200 hover:bg-gray-50 disabled:opacity-20 cursor-pointer"
          >
            <FiChevronLeft size={16} />
          </button>
          <span className="px-4 font-bold text-[#1B1B1B]">Page {page}</span>
          <button
            disabled={coupons.results.length < 10}
            onClick={() => setPage(p => p + 1)}
            className="p-2 border border-gray-200 hover:bg-gray-50 disabled:opacity-20 cursor-pointer"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
