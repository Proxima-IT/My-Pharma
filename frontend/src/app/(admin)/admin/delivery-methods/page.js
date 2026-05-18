'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiTruck,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { useDeliveryMethodAdmin } from '../../hooks/useDeliveryMethodAdmin';

export default function AdminDeliveryMethodsPage() {
  const { methods, loading, fetchMethods, deleteMethod } = useDeliveryMethodAdmin();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchMethods({ page, search });
  }, [page, search, fetchMethods]);

  const handleDelete = async (id, name) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteMethod(id);
    }
  };

  const getTypeBadge = type => {
    const map = {
      STANDARD: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
      EXPRESS: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
      SAME_DAY: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    };
    const style = map[type] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-100' };
    return (
      <span className={`px-3 py-1 border font-mono text-[10px] font-bold uppercase tracking-tighter ${style.bg} ${style.text} ${style.border}`}>
        {(type || 'N/A').replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#1B1B1B] tracking-tighter uppercase">
            Delivery Methods
          </h1>
          <p className="text-[13px] text-[#6B6B5E] mt-1 font-medium">
            Manage delivery options — Standard, Express, Same Day, etc.
          </p>
        </div>
        <Link href="/admin/delivery-methods/new">
          <button className="bg-[#3A5A40] text-white px-8 py-3.5 rounded-none font-bold text-xs tracking-widest flex items-center gap-2 hover:bg-[#F59E0B] transition-all duration-300 cursor-pointer uppercase border border-transparent">
            <FiPlus size={18} /> Add New Method
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
            placeholder="SEARCH BY NAME..."
            className="w-full h-10 pl-10 pr-4 bg-transparent rounded-none text-sm font-mono focus:outline-none uppercase tracking-tight placeholder:text-gray-300"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[#1B1B1B] text-[11px] uppercase tracking-[0.2em] font-bold">
                <th className="px-8 py-4 text-left border-r border-gray-100">Name</th>
                <th className="px-8 py-4 text-left border-r border-gray-100">Type</th>
                <th className="px-8 py-4 text-left border-r border-gray-100">Duration</th>
                <th className="px-8 py-4 text-right border-r border-gray-100">Price (BDT)</th>
                <th className="px-8 py-4 text-center border-r border-gray-100">Order</th>
                <th className="px-8 py-4 text-left border-r border-gray-100">Status</th>
                <th className="px-8 py-4 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && methods.results.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-8 py-20 text-center">
                    <div className="font-mono text-sm animate-pulse text-[#3A5A40]">
                      LOADING DELIVERY METHODS...
                    </div>
                  </td>
                </tr>
              ) : methods.results.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-[#8A8A78]">
                      <FiTruck size={40} />
                      <p className="font-mono text-sm font-bold uppercase">
                        No Delivery Methods Found
                      </p>
                      <p className="font-mono text-xs text-[#B7B7A4]">
                        Create your first delivery method to get started.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                methods.results.map(method => (
                  <tr
                    key={method.id}
                    className="hover:bg-gray-50/50 transition-colors duration-200 group"
                  >
                    <td className="px-8 py-6 border-r border-gray-100">
                      <span className="font-bold text-[#1B1B1B] text-sm uppercase tracking-tight">
                        {method.name}
                      </span>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100">
                      {getTypeBadge(method.delivery_type)}
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100">
                      <span className="font-mono text-sm text-[#1B1B1B]">
                        {method.duration || '—'}
                      </span>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100 text-right">
                      <span className="font-mono text-sm font-bold text-[#3A5A40]">
                        ৳{parseFloat(method.price || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100 text-center">
                      <span className="font-mono text-sm font-bold text-[#8A8A78]">
                        {method.order ?? '—'}
                      </span>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100">
                      <span
                        className={`px-3 py-1 border font-mono text-[10px] font-bold uppercase tracking-tighter ${
                          method.is_active
                            ? 'text-green-600 bg-green-50 border-green-100'
                            : 'text-red-600 bg-red-50 border-red-100'
                        }`}
                      >
                        {method.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/delivery-methods/edit/${method.id}`}>
                          <button className="w-9 h-9 border border-gray-200 flex items-center justify-center text-[#1B1B1B] hover:bg-[#3A5A40] hover:text-white transition-all duration-300 cursor-pointer">
                            <FiEdit2 size={14} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(method.id, method.name)}
                          className="w-9 h-9 border border-gray-200 flex items-center justify-center text-[#1B1B1B] hover:bg-red-600 hover:text-white transition-all duration-300 cursor-pointer"
                        >
                          <FiTrash2 size={14} />
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

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <p className="font-mono text-[11px] font-bold text-[#8A8A78] uppercase">
          Total Methods:{' '}
          <span className="text-[#1B1B1B]">{methods.count}</span>
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
            disabled={methods.results.length < 10 || loading}
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
