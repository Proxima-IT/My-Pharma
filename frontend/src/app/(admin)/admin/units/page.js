'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiPackage } from 'react-icons/fi';
import { useUnitAdmin } from '../../hooks/useUnitAdmin';
import Pagination from '../../components/Pagination';

export default function AdminUnitListPage() {
  const { units, loading, fetchUnits, deleteUnit } = useUnitAdmin();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchUnits({ page, search });
  }, [page, search, fetchUnits]);

  const handleDelete = async (slug, name) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteUnit(slug);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#1B1B1B] tracking-tighter uppercase">
            Unit Management
          </h1>
          <p className="text-[13px] text-[#6B6B5E] mt-1 font-medium">
            Manage medicine packaging units — strips, bottles, vials, etc.
          </p>
        </div>
        <Link href="/admin/units/new">
          <button className="bg-[#3A5A40] text-white px-8 py-3.5 rounded-none font-bold text-xs tracking-widest flex items-center gap-2 hover:bg-[#F59E0B] transition-all duration-300 cursor-pointer uppercase border border-transparent">
            <FiPlus size={18} /> Add New Unit
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
            placeholder="SEARCH BY UNIT NAME..."
            className="w-full h-10 pl-10 pr-4 bg-transparent rounded-none text-sm font-mono focus:outline-none uppercase tracking-tight placeholder:text-gray-300"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Units Table */}
      <div className="bg-white border border-gray-100 rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[#1B1B1B] text-[11px] uppercase tracking-[0.2em] font-bold">
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Type
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Quantity
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Content
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Display Name
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Status
                </th>
                <th className="px-8 py-4 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && units.results.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="font-mono text-sm animate-pulse text-[#3A5A40]">
                      LOADING UNITS...
                    </div>
                  </td>
                </tr>
              ) : units.results.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-[#8A8A78]">
                      <FiPackage size={40} />
                      <p className="font-mono text-sm font-bold uppercase">
                        No Units Found
                      </p>
                      <p className="font-mono text-xs text-[#B7B7A4]">
                        Create your first unit to get started.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                units.results.map(unit => (
                  <tr
                    key={unit.id}
                    className="hover:bg-gray-50/50 transition-colors duration-200 group"
                  >
                    <td className="px-8 py-6 border-r border-gray-100">
                      <span className="font-bold text-[#1B1B1B] text-sm uppercase tracking-tight">
                        {unit.unit_type}
                      </span>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100">
                      <span className="font-mono text-sm font-bold text-[#3A5A40]">
                        {unit.quantity}
                      </span>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100">
                      <span className="font-mono text-sm text-[#1B1B1B] uppercase">
                        {unit.content_type}
                      </span>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100">
                      <span className="font-mono text-xs text-[#8A8A78]">
                        {unit.name}
                      </span>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100">
                      <span
                        className={`px-3 py-1 border font-mono text-[10px] font-bold uppercase tracking-tighter ${
                          unit.is_active
                            ? 'text-green-600 bg-green-50 border-green-100'
                            : 'text-red-600 bg-red-50 border-red-100'
                        }`}
                      >
                        {unit.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/units/edit/${unit.slug}`}>
                          <button className="w-9 h-9 border border-gray-200 flex items-center justify-center text-[#1B1B1B] hover:bg-[#3A5A40] hover:text-white transition-all duration-300 cursor-pointer">
                            <FiEdit2 size={14} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(unit.slug, unit.name)}
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
      <Pagination
        page={page}
        setPage={setPage}
        totalItems={units.count}
        loading={loading}
        label="Total Units"
      />
    </div>
  );
}
