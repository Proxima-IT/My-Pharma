'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useBrands } from '../../hooks/useBrands';
import UiInput from '@/app/(public)/components/UiInput';

export default function BrandListPage() {
  const { brands, loading, getBrands, deleteBrand } = useBrands();
  const [search, setSearch] = useState('');

  // Defensive check: Ensure we are always mapping over an array
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
    <div className="flex flex-col gap-8">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Brand Management
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            Manage pharmaceutical manufacturers and brands.
          </p>
        </div>
        <Link href="/pharmacy/brands/new">
          <button className="bg-(--color-primary-500) text-white px-8 py-3.5 rounded-full font-bold text-[13px] tracking-widest flex items-center gap-2 hover:brightness-110 transition-all active:scale-95 cursor-pointer uppercase">
            <FiPlus size={18} /> Add New Brand
          </button>
        </Link>
      </div>

      {/* 2. Search Bar (No Wrapper Container) */}
      <div className="max-w-md">
        <UiInput
          placeholder="Search brands by name..."
          leftIcon={<FiSearch className="text-gray-400" />}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* 3. Table Container */}
      <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">
                  Brand Name
                </th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">
                  Status
                </th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && brandList.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-8 py-16 text-center text-gray-400 font-medium"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
                      <span>Loading brands...</span>
                    </div>
                  </td>
                </tr>
              ) : brandList.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-8 py-16 text-center text-gray-400 font-medium"
                  >
                    No brands found matching your search.
                  </td>
                </tr>
              ) : (
                brandList.map(brand => (
                  <tr
                    key={brand.id}
                    className="hover:bg-gray-50/30 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <span className="font-bold text-gray-900 tracking-tight text-sm">
                        {brand.name}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          brand.is_active
                            ? 'bg-green-50 text-(--color-success-500)'
                            : 'bg-red-50 text-red-500'
                        }`}
                      >
                        {brand.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/pharmacy/brands/edit/${brand.slug}`}>
                          <button className="p-2.5 rounded-full text-gray-400 hover:text-(--color-primary-500) hover:bg-primary-50 transition-all cursor-pointer">
                            <FiEdit2 size={18} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(brand.slug)}
                          className="p-2.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                        >
                          <FiTrash2 size={18} />
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
