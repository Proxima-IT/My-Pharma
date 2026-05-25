'use client';
import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const DEFAULT_PAGE_SIZE = 10;

/**
 * Reusable Pagination Component — Admin Dashboard
 * Calculates total pages from `totalItems` and `pageSize`.
 * Renders numbered circle buttons (1, 2, 3...) with ellipsis for large page counts.
 * Completely prevents navigating beyond the last page.
 */
export default function Pagination({
  page,
  setPage,
  totalItems = 0,
  pageSize = DEFAULT_PAGE_SIZE,
  loading = false,
  label = 'Total Records',
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  /**
   * Generates an array of page numbers and '...' placeholders.
   * Shows all pages if <= 5, otherwise shows first, last, current ± 1 neighbors.
   */
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set();
    pages.add(1);
    pages.add(totalPages);

    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      pages.add(i);
    }

    const sorted = Array.from(pages).sort((a, b) => a - b);
    const result = [];

    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
        result.push('...');
      }
      result.push(sorted[i]);
    }

    return result;
  };

  return (
    <div className="flex items-center justify-between px-2">
      <p className="font-mono text-[11px] font-bold text-[#8A8A78] uppercase">
        {label}: <span className="text-[#1B1B1B]">{totalItems}</span>
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          {/* Previous Arrow */}
          <button
            disabled={page <= 1 || loading}
            onClick={() => setPage(page - 1)}
            className="w-9 h-9 flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-all"
          >
            <FiChevronLeft size={16} />
          </button>

          {/* Numbered Circle Buttons */}
          {getPageNumbers().map((pageNum, idx) =>
            pageNum === '...' ? (
              <span
                key={`ellipsis-${idx}`}
                className="w-9 h-9 flex items-center justify-center font-mono text-xs text-[#8A8A78] select-none"
              >
                &middot;&middot;&middot;
              </span>
            ) : (
              <button
                key={pageNum}
                disabled={loading}
                onClick={() => setPage(pageNum)}
                className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed ${
                  page === pageNum
                    ? 'bg-[#3A5A40] text-white'
                    : 'bg-white border border-gray-200 text-[#1B1B1B] hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ),
          )}

          {/* Next Arrow */}
          <button
            disabled={page >= totalPages || loading}
            onClick={() => setPage(page + 1)}
            className="w-9 h-9 flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-all"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
