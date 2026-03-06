'use client';
import React, { useEffect, useState } from 'react';
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
} from 'react-icons/fi';
import { useProductAdmin } from '../../hooks/useProductAdmin';
import { formatCurrency } from '@/app/(user)/lib/formatters';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';

export default function AdminProductListPage() {
  const { products, loading, fetchProducts, deleteProduct } = useProductAdmin();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchProducts({ page, search });
  }, [page, search, fetchProducts]);

  const handleDelete = async (slug, name) => {
    if (confirm(`Are you sure you want to remove "${name}" from the list?`)) {
      await deleteProduct(slug);
    }
  };

  const getStockStatus = (qty, threshold) => {
    if (qty <= 0)
      return {
        label: 'OUT OF STOCK',
        class: 'text-red-600 bg-red-50 border-red-100',
      };
    if (qty <= threshold)
      return {
        label: 'LOW STOCK',
        class: 'text-amber-600 bg-amber-50 border-amber-100',
      };
    return {
      label: 'IN STOCK',
      class: 'text-green-600 bg-green-50 border-green-100',
    };
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#1B1B1B] tracking-tighter uppercase">
            Medicine Inventory
          </h1>
          <p className="text-[13px] text-[#6B6B5E] mt-1 font-medium">
            Total{' '}
            <span className="text-[#3A5A40] font-bold">{products.count}</span>{' '}
            medicines registered in the system.
          </p>
        </div>
        <Link href="/admin/products/new">
          <button className="bg-[#3A5A40] text-white px-8 py-3.5 rounded-none font-bold text-xs tracking-widest flex items-center gap-2 hover:bg-[#F59E0B] transition-all duration-300 cursor-pointer uppercase border border-transparent">
            <FiPlus size={18} /> Add New Medicine
          </button>
        </Link>
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
            placeholder="SEARCH BY MEDICINE NAME..."
            className="w-full h-10 pl-10 pr-4 bg-transparent rounded-none text-sm font-mono focus:outline-none uppercase tracking-tight placeholder:text-gray-300"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-100 rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[#1B1B1B] text-[11px] uppercase tracking-[0.2em] font-bold">
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Medicine Info
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Group
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Price
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Stock Status
                </th>
                <th className="px-8 py-4 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && products.results.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="font-mono text-sm animate-pulse text-[#3A5A40]">
                      SYNCING_INVENTORY...
                    </div>
                  </td>
                </tr>
              ) : products.results.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-8 py-20 text-center flex flex-col items-center gap-4 text-[#8A8A78]"
                  >
                    <FiBox size={40} />
                    <p className="font-mono text-sm font-bold uppercase">
                      No Medicines Found
                    </p>
                  </td>
                </tr>
              ) : (
                products.results.map(product => {
                  const stock = getStockStatus(
                    product.quantity_in_stock,
                    product.low_stock_threshold,
                  );
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50/50 transition-colors duration-200 group"
                    >
                      <td className="px-8 py-5 border-r border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 border border-gray-100 bg-white flex items-center justify-center p-1 shrink-0">
                            {product.image ? (
                              <Image
                                src={getMediaUrl(product.image)}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="object-contain mix-blend-multiply"
                                unoptimized
                              />
                            ) : (
                              <FiBox className="text-gray-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#1B1B1B] text-sm uppercase truncate max-w-[200px]">
                              {product.name}
                            </p>
                            <p className="font-mono text-[10px] text-[#8A8A78] uppercase">
                              {product.brand_name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 border-r border-gray-100">
                        <span className="text-[10px] font-bold text-[#3A5A40] bg-[#E8F0EA] border border-[#3A5A40]/20 px-2 py-1 uppercase">
                          {product.category_name}
                        </span>
                      </td>
                      <td className="px-8 py-5 border-r border-gray-100 font-mono font-bold text-[#1B1B1B]">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-8 py-5 border-r border-gray-100">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`w-fit px-2 py-0.5 border text-[9px] font-bold uppercase tracking-tighter ${stock.class}`}
                          >
                            {stock.label}
                          </span>
                          <span className="font-mono text-[10px] text-[#8A8A78]">
                            {product.quantity_in_stock} Units
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/products/edit/${product.slug}`}>
                            <button className="w-9 h-9 border border-gray-200 flex items-center justify-center text-[#1B1B1B] hover:bg-[#3A5A40] hover:text-white transition-all duration-300 cursor-pointer">
                              <FiEdit2 size={14} />
                            </button>
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(product.slug, product.name)
                            }
                            className="w-9 h-9 border border-gray-200 flex items-center justify-center text-[#1B1B1B] hover:bg-red-600 hover:text-white transition-all duration-300 cursor-pointer"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <p className="font-mono text-[11px] font-bold text-[#8A8A78] uppercase">
          Total Items: <span className="text-[#1B1B1B]">{products.count}</span>
        </p>
        <div className="flex items-center gap-0 border border-gray-200 bg-white">
          <button
            disabled={page === 1 || loading}
            onClick={() => setPage(p => p - 1)}
            className="w-10 h-10 flex items-center justify-center border-r border-gray-200 hover:bg-gray-50 disabled:opacity-20 cursor-pointer"
          >
            <FiChevronLeft size={18} />
          </button>
          <div className="px-4 font-mono text-xs font-bold text-[#1B1B1B]">
            PAGE {page}
          </div>
          <button
            disabled={products.results.length < 10 || loading}
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
