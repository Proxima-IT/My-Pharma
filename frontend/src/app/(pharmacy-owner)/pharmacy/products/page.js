'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    error, // Destructured error from hook
  } = usePharmacyProducts();

  const handleSearchSubmit = e => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const getStockStatus = product => {
    if (product.quantity_in_stock <= 0)
      return {
        label: 'Out of Stock',
        class: 'bg-red-50 text-red-600 border-red-100',
      };
    if (product.is_low_stock)
      return {
        label: 'Low Stock',
        class: 'bg-orange-50 text-orange-600 border-orange-100',
      };
    return {
      label: 'In Stock',
      class: 'bg-(--success-50) text-(--success-600) border-(--success-100)',
    };
  };

  const handleDelete = async (slug, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteProduct(slug);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700 pb-20">
      {/* 1. Header & Action Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Product Management
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Total <span className="text-gray-900 font-bold">{totalCount}</span>{' '}
            products listed
          </p>
        </div>
        <Link href="/pharmacy/products/new" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-8 h-[52px] rounded-full text-[15px] font-bold transition-all cursor-pointer shadow-sm">
            <FiPlus size={20} strokeWidth={3} />
            Add New Product
          </button>
        </Link>
      </div>

      {/* 2. Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white border border-gray-100 rounded-[24px] sm:rounded-full p-2 flex flex-col sm:flex-row items-center gap-2"
      >
        <div className="relative w-full flex-1">
          <FiSearch
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by product name or generic..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-6 bg-transparent rounded-full text-sm focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-8 h-12 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-black transition-all cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* 3. Error Display Section - Added for 500 error visibility */}
      {error && (
        <div className="p-5 bg-red-50 border border-red-100 rounded-[24px] flex items-center gap-4 text-red-600 animate-in slide-in-from-top-2">
          <FiAlertCircle className="shrink-0" size={24} />
          <div>
            <p className="text-sm font-bold uppercase tracking-wider">
              Search Failed
            </p>
            <p className="text-sm font-medium opacity-90">
              The server encountered an error processing your request. Please
              try a simpler search term.
            </p>
          </div>
        </div>
      )}

      {/* 4. Main Inventory Table */}
      <div className="bg-white rounded-[32px] p-4 sm:p-8 border border-gray-100/50 min-h-[500px] flex flex-col">
        <div className="flex-grow overflow-x-auto no-scrollbar">
          <table className="w-full border-separate border-spacing-0 rounded-2xl border border-gray-100 overflow-hidden">
            <thead className="bg-gray-50">
              <tr className="text-gray-500 text-[11px] uppercase tracking-[0.15em] font-black">
                <th className="px-6 py-5 text-left">Product Info</th>
                <th className="px-6 py-5 text-left">Category</th>
                <th className="px-6 py-5 text-left">Price</th>
                <th className="px-6 py-5 text-left">Stock</th>
                <th className="px-6 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-32 text-center">
                    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map(product => {
                  const stock = getStockStatus(product);
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center p-2 shrink-0">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="object-contain mix-blend-multiply"
                              />
                            ) : (
                              <FiBox className="text-gray-300" size={20} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-sm sm:text-base truncate max-w-[200px]">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-400 font-medium truncate">
                              {product.ingredient_name || 'No Generic'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {product.category_name}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-bold text-gray-900">
                          {formatCurrency(product.price)}
                        </p>
                        {product.original_price > product.price && (
                          <p className="text-xs text-gray-400 line-through">
                            {formatCurrency(product.original_price)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${stock.class}`}
                          >
                            {stock.label}
                          </span>
                          <p className="text-xs font-bold text-gray-400 ml-1">
                            {product.quantity_in_stock} units
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/pharmacy/products/edit/${product.slug}`}
                          >
                            <button className="w-9 h-9 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer">
                              <FiEdit2 size={16} />
                            </button>
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(product.slug, product.name)
                            }
                            className="w-9 h-9 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
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
                    <div className="flex flex-col items-center gap-3 text-gray-300">
                      <FiBox size={48} />
                      <p className="text-lg font-bold">No products found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 pt-6 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-sm font-medium text-gray-500">
              Showing page{' '}
              <span className="text-gray-900 font-bold">{page}</span> of{' '}
              <span className="text-gray-900 font-bold">{totalPages}</span>
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all disabled:opacity-30 cursor-pointer"
              >
                <FiChevronLeft size={18} />
              </button>
              <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-white">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  num => (
                    <button
                      key={num}
                      onClick={() => setPage(num)}
                      className={`px-5 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                        page === num
                          ? 'bg-black text-white'
                          : 'text-gray-500 border-l border-gray-100 hover:bg-gray-50 first:border-l-0'
                      }`}
                    >
                      {num}
                    </button>
                  ),
                )}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all disabled:opacity-30 cursor-pointer"
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
