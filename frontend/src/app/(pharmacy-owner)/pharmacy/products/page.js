'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiBox,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
} from 'react-icons/fi';
import { usePharmacyProducts } from '../../hooks/usePharmacyProducts';
import { formatCurrency } from '@/app/(user)/lib/formatters';

export default function ProductManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const {
    products,
    isLoading,
    totalCount,
    page,
    setPage,
    totalPages,
    deleteProduct,
    handleSearch,
    error,
  } = usePharmacyProducts();

  const handleSearchSubmit = e => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const getDisplayImage = url => getMediaUrl(url) || null;

  const getStockStatus = product => {
    if (product.quantity_in_stock <= 0)
      return {
        label: 'OUT_OF_STOCK',
        class:
          'bg-red-50 text-(--color-admin-error) border-(--color-admin-error)',
      };
    if (product.is_low_stock)
      return {
        label: 'LOW_STOCK',
        class:
          'bg-amber-50 text-(--color-admin-warning) border-(--color-admin-warning)',
      };
    return {
      label: 'IN_STOCK',
      class:
        'bg-green-50 text-(--color-admin-success) border-(--color-admin-success)',
    };
  };

  const handleDelete = async (slug, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteProduct(slug);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20 bg-(--color-admin-bg)">
      {/* 1. Header & Action Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-4 border-(--color-admin-border) pb-6">
        <div>
          <span className="font-mono text-xs font-bold text-(--color-admin-primary) uppercase tracking-widest">
            Inventory / Records / Products
          </span>
          <h1 className="text-4xl font-black text-(--color-admin-navy) tracking-tighter uppercase">
            Product Management
          </h1>
          <p className="font-mono text-[11px] text-(--color-text-secondary) mt-2 uppercase">
            TOTAL_LISTED:{' '}
            <span className="text-(--color-admin-navy) font-bold">
              {totalCount}
            </span>
          </p>
        </div>
        <Link href="/pharmacy/products/new" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto flex items-center justify-center gap-3 bg-(--color-admin-primary) text-white px-8 h-[52px] rounded-none text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:bg-(--color-admin-accent) cursor-pointer border border-(--color-admin-border)">
            <FiPlus size={20} />
            ADD_NEW_ENTRY
          </button>
        </Link>
      </div>

      {/* 2. Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-(--color-admin-card) border border-(--color-admin-border) rounded-none p-2 flex flex-col sm:flex-row items-center gap-2"
      >
        <div className="relative w-full flex-1">
          <FiSearch
            className="absolute left-5 top-1/2 -translate-y-1/2 text-(--color-text-secondary)"
            size={18}
          />
          <input
            type="text"
            placeholder="SEARCH_BY_NAME_OR_GENERIC..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-6 bg-transparent rounded-none text-sm font-mono focus:outline-none uppercase tracking-tight"
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-10 h-12 bg-(--color-admin-navy) text-white rounded-none text-xs font-bold uppercase tracking-widest hover:bg-(--color-admin-accent) transition-all duration-300 cursor-pointer"
        >
          EXECUTE_SEARCH
        </button>
      </form>

      {/* 3. Error Display */}
      {error && (
        <div className="p-6 bg-red-50 border border-(--color-admin-error) rounded-none flex items-center gap-4 text-(--color-admin-error) animate-in slide-in-from-top-2">
          <FiAlertCircle className="shrink-0" size={24} />
          <div className="font-mono">
            <p className="text-xs font-bold uppercase tracking-widest">
              SYSTEM_ERROR::SEARCH_FAILED
            </p>
            <p className="text-[11px] font-medium mt-1">
              REQUEST_TERMINATED_BY_SERVER. SIMPLIFY_QUERY_AND_RETRY.
            </p>
          </div>
        </div>
      )}

      {/* 4. Main Inventory Table */}
      <div className="bg-(--color-admin-card) border border-(--color-admin-border) rounded-none flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-(--color-admin-navy) text-white text-[11px] uppercase tracking-[0.2em] font-bold">
                <th className="px-6 py-4 text-left border-r border-white/10">
                  Product_Info
                </th>
                <th className="px-6 py-4 text-left border-r border-white/10">
                  Category
                </th>
                <th className="px-6 py-4 text-left border-r border-white/10">
                  Price_Point
                </th>
                <th className="px-6 py-4 text-left border-r border-white/10">
                  Stock_Status
                </th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-admin-border)">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-32 text-center">
                    <div className="font-mono text-sm animate-pulse tracking-widest text-(--color-admin-primary)">
                      SYNCING_INVENTORY_DATA...
                    </div>
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map(product => {
                  const stock = getStockStatus(product);
                  const displayImage = getDisplayImage(product.image);

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-white transition-colors duration-200 group"
                    >
                      <td className="px-6 py-5 border-r border-(--color-admin-border)">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-none bg-white border border-(--color-admin-border) flex items-center justify-center p-2 shrink-0 overflow-hidden">
                            {displayImage ? (
                              <Image
                                src={displayImage}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="object-contain mix-blend-multiply"
                                unoptimized={true}
                              />
                            ) : (
                              <FiBox
                                className="text-(--color-gray-300)"
                                size={24}
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-(--color-admin-navy) text-sm uppercase tracking-tight truncate max-w-[200px]">
                              {product.name}
                            </p>
                            <p className="font-mono text-[10px] text-(--color-text-secondary) uppercase truncate">
                              {product.ingredient_name || 'GENERIC_N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 border-r border-(--color-admin-border)">
                        <span className="text-[10px] font-bold text-(--color-admin-primary) bg-(--color-admin-bg) border border-(--color-admin-border) px-3 py-1 uppercase tracking-tighter">
                          {product.category_name}
                        </span>
                      </td>
                      <td className="px-6 py-5 border-r border-(--color-admin-border)">
                        <p className="font-mono font-bold text-(--color-admin-navy)">
                          {formatCurrency(product.price)}
                        </p>
                        {product.original_price > product.price && (
                          <p className="font-mono text-[10px] text-(--color-text-secondary) line-through">
                            {formatCurrency(product.original_price)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-5 border-r border-(--color-admin-border)">
                        <div className="flex flex-col gap-2">
                          <span
                            className={`w-fit px-2 py-0.5 border text-[9px] font-bold uppercase tracking-widest ${stock.class}`}
                          >
                            {stock.label}
                          </span>
                          <p className="font-mono text-[11px] font-bold text-(--color-admin-navy)">
                            {product.quantity_in_stock} UNITS
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/pharmacy/products/edit/${product.slug}`}
                          >
                            <button className="w-10 h-10 border border-(--color-admin-border) flex items-center justify-center text-(--color-admin-navy) hover:bg-(--color-admin-accent) hover:text-white hover:border-(--color-admin-accent) transition-all duration-300 cursor-pointer rounded-none">
                              <FiEdit2 size={16} />
                            </button>
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(product.slug, product.name)
                            }
                            className="w-10 h-10 border border-(--color-admin-border) flex items-center justify-center text-(--color-admin-navy) hover:bg-(--color-admin-error) hover:text-white hover:border-(--color-admin-error) transition-all duration-300 cursor-pointer rounded-none"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4 text-(--color-text-secondary)">
                      <FiBox size={48} />
                      <p className="font-mono text-sm font-bold uppercase tracking-widest">
                        ZERO_RECORDS_FOUND
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-(--color-admin-border) bg-(--color-admin-bg) flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="font-mono text-[11px] font-bold text-(--color-text-secondary) uppercase">
              Batch <span className="text-(--color-admin-navy)">{page}</span> //
              Total{' '}
              <span className="text-(--color-admin-navy)">{totalPages}</span>
            </p>
            <div className="flex items-center gap-0 border border-(--color-admin-border) bg-white">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-12 h-12 flex items-center justify-center border-r border-(--color-admin-border) text-(--color-admin-navy) hover:bg-(--color-admin-accent) hover:text-white transition-all duration-300 disabled:opacity-20 cursor-pointer"
              >
                <FiChevronLeft size={20} />
              </button>
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
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-12 h-12 flex items-center justify-center border-l border-(--color-admin-border) text-(--color-admin-navy) hover:bg-(--color-admin-accent) hover:text-white transition-all duration-300 disabled:opacity-20 cursor-pointer"
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
