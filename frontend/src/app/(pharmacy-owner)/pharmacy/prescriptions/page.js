'use client';

import React from 'react';
import Link from 'next/link';
import {
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
} from 'react-icons/fi';
import { usePharmacyPrescriptions } from '../../hooks/usePharmacyPrescriptions';
import { formatCurrency, formatDate } from '@/app/(user)/lib/formatters';

/**
 * PharmacyPrescriptionsPage
 * Strictly follows the Pharmacy Owner "Sharp & Authoritative" design system.
 * Features: Industrial table, high contrast borders, JetBrains Mono for technical data.
 */
export default function PharmacyPrescriptionsPage() {
  const {
    prescriptions,
    isLoading,
    error,
    page,
    setPage,
    totalPages,
    totalCount,
  } = usePharmacyPrescriptions();

  const getStatusStyles = status => {
    switch (status?.toUpperCase()) {
      case 'USED':
        return 'border-(--color-admin-success) text-(--color-admin-success) bg-green-50/50';
      case 'APPROVED':
        return 'border-blue-600 text-blue-600 bg-blue-50/50';
      case 'REJECTED':
        return 'border-(--color-admin-error) text-(--color-admin-error) bg-red-50/50';
      case 'PENDING':
        return 'border-(--color-admin-warning) text-(--color-admin-warning) bg-amber-50/50';
      default:
        return 'border-(--color-text-secondary) text-(--color-text-secondary) bg-gray-50/50';
    }
  };

  if (error) {
    return (
      <div className="w-full py-20 text-center bg-(--color-admin-card) border-2 border-(--color-admin-error) rounded-none">
        <p className="text-(--color-admin-error) font-mono font-bold uppercase tracking-widest">
          SYSTEM_ERROR::FETCH_FAILED: {error}
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
            Terminal / Archive / Prescriptions
          </span>
          <h1 className="text-4xl font-black text-(--color-admin-navy) tracking-tighter uppercase">
            Prescription Verification
          </h1>
          <p className="font-mono text-[11px] text-(--color-text-secondary) mt-2 uppercase">
            TOTAL_REQUESTS:{' '}
            <span className="text-(--color-admin-navy) font-bold">
              {totalCount}
            </span>{' '}
            | BATCH_SIZE:{' '}
            <span className="text-(--color-admin-navy) font-bold">
              {prescriptions.length}
            </span>
          </p>
        </div>
      </div>

      {/* Industrial Table Container */}
      <div className="bg-(--color-admin-card) border-2 border-(--color-admin-border) rounded-none flex flex-col shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-(--color-admin-navy) text-white text-[11px] uppercase tracking-[0.2em] font-bold">
                <th className="px-6 py-4 text-left border-r border-white/10">
                  Request ID
                </th>
                <th className="px-6 py-4 text-left border-r border-white/10">
                  Customer Entity
                </th>
                <th className="px-6 py-4 text-left border-r border-white/10">
                  Submission Date
                </th>
                <th className="px-6 py-4 text-left border-r border-white/10">
                  Verification_Status
                </th>
                <th className="px-6 py-4 text-right border-r border-white/10">
                  Estimated_Value
                </th>
                <th className="px-6 py-4 text-center">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-(--color-admin-border)">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-32 text-center">
                    <div className="font-mono text-sm animate-pulse tracking-widest text-(--color-admin-primary)">
                      ACCESSING_SECURE_DATABASE...
                    </div>
                  </td>
                </tr>
              ) : prescriptions.length > 0 ? (
                prescriptions.map(rx => (
                  <tr
                    key={rx.id}
                    className="hover:bg-[#F8F9FA] transition-colors duration-200 group"
                  >
                    <td className="px-6 py-5 border-r border-(--color-admin-border) font-mono text-sm font-bold text-(--color-admin-navy)">
                      RX-{rx.id}
                    </td>
                    <td className="px-6 py-5 border-r border-(--color-admin-border)">
                      <p className="text-sm font-bold text-(--color-admin-navy) uppercase tracking-tight">
                        {rx.user_username ||
                          rx.user_email?.split('@')[0] ||
                          'GUEST_ENTITY'}
                      </p>
                      <p className="font-mono text-[10px] text-(--color-text-secondary)">
                        {rx.user_email}
                      </p>
                    </td>
                    <td className="px-6 py-5 border-r border-(--color-admin-border) font-mono text-xs text-(--color-text-secondary)">
                      {formatDate(rx.created_at).toUpperCase()}
                    </td>
                    <td className="px-6 py-5 border-r border-(--color-admin-border)">
                      <span
                        className={`inline-block px-3 py-1 border-2 text-[10px] font-bold uppercase ${getStatusStyles(rx.status)}`}
                      >
                        {rx.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 border-r border-(--color-admin-border) font-mono text-sm font-bold text-(--color-admin-navy) text-right">
                      {rx.total ? (
                        formatCurrency(rx.total)
                      ) : (
                        <span className="text-gray-300 italic">
                          PENDING_VALUATION
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Link href={`/pharmacy/prescriptions/${rx.id}`}>
                        <button className="inline-flex items-center justify-center w-10 h-10 border-2 border-(--color-admin-border) text-(--color-admin-navy) hover:bg-(--color-admin-navy) hover:text-white transition-all duration-300 cursor-pointer rounded-none">
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
                      <FiFileText size={48} />
                      <p className="font-mono text-sm font-bold uppercase tracking-widest">
                        Zero_Prescription_Requests
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
          <div className="p-6 border-t-2 border-(--color-admin-border) bg-[#F1F1E6] flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="font-mono text-[11px] font-bold text-(--color-text-secondary) uppercase">
              Index <span className="text-(--color-admin-navy)">{page}</span> /
              Total_Pages{' '}
              <span className="text-(--color-admin-navy)">{totalPages}</span>
            </p>

            <div className="flex items-center gap-0 border-2 border-(--color-admin-border) bg-white">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-12 h-12 flex items-center justify-center border-r-2 border-(--color-admin-border) text-(--color-admin-navy) hover:bg-(--color-admin-navy) hover:text-white transition-all duration-300 disabled:opacity-20 cursor-pointer"
              >
                <FiChevronLeft size={20} />
              </button>

              <div className="flex items-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  num => (
                    <button
                      key={num}
                      onClick={() => setPage(num)}
                      className={`w-12 h-12 font-mono text-xs font-bold transition-all border-r-2 border-(--color-admin-border) last:border-r-0 cursor-pointer ${
                        page === num
                          ? 'bg-(--color-admin-navy) text-white'
                          : 'text-(--color-admin-navy) hover:bg-(--color-admin-navy) hover:text-white'
                      }`}
                    >
                      {num.toString().padStart(2, '0')}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-12 h-12 flex items-center justify-center border-l-2 border-(--color-admin-border) text-(--color-admin-navy) hover:bg-(--color-admin-navy) hover:text-white transition-all duration-300 disabled:opacity-20 cursor-pointer"
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
