'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiAward } from 'react-icons/fi';
import { useBrands } from '../../hooks/useBrands';

export default function BrandListPage() {
  const { brands, loading, getBrands, deleteBrand } = useBrands();
  const [search, setSearch] = useState('');

  const brandList = Array.isArray(brands) ? brands : brands?.results || [];

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const delayDebounce = setTimeout(() => {
      getBrands(token, { search });
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search, getBrands]);

  const handleDelete = async slug => {
    if (confirm('Are you sure you want to delete this brand?')) {
      const token = localStorage.getItem('access_token');
      try {
        await deleteBrand(token, slug);
      } catch (err) {
        alert('Failed to delete brand');
      }
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20 bg-(--color-admin-bg)">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-(--color-admin-border) pb-6">
        <div>
          <span className="font-mono text-xs font-bold text-(--color-admin-primary) uppercase tracking-widest">
            Store Records / Brand List
          </span>
          <h1 className="text-4xl font-black text-(--color-admin-navy) tracking-tighter uppercase">
            Company List
          </h1>
          <p className="font-mono text-[11px] text-(--color-text-secondary) mt-2 uppercase">
            List of all medicine companies and brands
          </p>
        </div>
        <Link href="/pharmacy/brands/new">
          <button className="bg-(--color-admin-primary) text-white px-8 py-3.5 rounded-none font-bold text-xs tracking-widest flex items-center gap-2 hover:bg-(--color-admin-accent) transition-all duration-300 cursor-pointer uppercase border border-(--color-admin-border)">
            <FiPlus size={18} /> ADD NEW COMPANY
          </button>
        </Link>
      </div>

      {/* 2. Search Bar */}
      <div className="max-w-md bg-(--color-admin-card) border border-(--color-admin-border) p-1">
        <div className="relative">
          <FiSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-(--color-text-secondary)"
            size={16}
          />
          <input
            type="text"
            placeholder="SEARCH BY NAME..."
            className="w-full h-10 pl-10 pr-4 bg-transparent rounded-none text-sm font-mono focus:outline-none uppercase tracking-tight placeholder:text-gray-300"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Table Container */}
      <div className="bg-(--color-admin-card) border border-(--color-admin-border) rounded-none flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-(--color-admin-navy) text-white text-[11px] uppercase tracking-[0.2em] font-bold">
                <th className="px-8 py-4 text-left border-r border-white/10">
                  COMPANY NAME
                </th>
                <th className="px-8 py-4 text-left border-r border-white/10">
                  STATUS
                </th>
                <th className="px-8 py-4 text-right">OPTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-admin-border)">
              {loading && brandList.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-8 py-20 text-center">
                    <div className="font-mono text-sm animate-pulse tracking-widest text-(--color-admin-primary)">
                      LOADING DATA... PLEASE WAIT
                    </div>
                  </td>
                </tr>
              ) : brandList.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-(--color-text-secondary)">
                      <FiAward size={40} />
                      <p className="font-mono text-sm font-bold uppercase tracking-widest">
                        NO BRANDS FOUND
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                brandList.map(brand => (
                  <tr
                    key={brand.id}
                    className="hover:bg-white transition-colors duration-200 group"
                  >
                    <td className="px-8 py-6 border-r border-(--color-admin-border)">
                      <span className="font-bold text-(--color-admin-navy) tracking-tight text-sm uppercase">
                        {brand.name}
                      </span>
                    </td>
                    <td className="px-8 py-6 border-r border-(--color-admin-border)">
                      <span
                        className={`px-3 py-1 border font-mono text-[10px] font-bold uppercase tracking-widest ${
                          brand.is_active
                            ? 'bg-green-50 text-(--color-admin-success) border-(--color-admin-success)'
                            : 'bg-red-50 text-(--color-admin-error) border-(--color-admin-error)'
                        }`}
                      >
                        {brand.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/pharmacy/brands/edit/${brand.slug}`}>
                          <button className="w-10 h-10 border border-(--color-admin-border) flex items-center justify-center text-(--color-admin-navy) hover:bg-(--color-admin-accent) hover:text-white hover:border-(--color-admin-accent) transition-all duration-300 rounded-none cursor-pointer">
                            <FiEdit2 size={16} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(brand.slug)}
                          className="w-10 h-10 border border-(--color-admin-border) flex items-center justify-center text-(--color-admin-navy) hover:bg-(--color-admin-error) hover:text-white hover:border-(--color-admin-error) transition-all duration-300 rounded-none cursor-pointer"
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
    </div>
  );
}
