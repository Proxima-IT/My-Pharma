'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiLayers,
} from 'react-icons/fi';
import { useCategories } from '../../hooks/useCategories';

export default function CategoryListPage() {
  const { categories, loading, getCategories, deleteCategory } =
    useCategories();

  // State for Filters and Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Defensive check for data
  const categoryList = Array.isArray(categories)
    ? categories
    : categories?.results || [];
  const totalCount = categories?.count || 0;
  const hasNext = !!categories?.next;
  const hasPrev = !!categories?.previous;

  // Calculate total pages (assuming 10 items per page)
  const totalPages = Math.ceil(totalCount / 10);

  const fetchFilteredData = useCallback(() => {
    const token = localStorage.getItem('access_token');
    const params = {
      search,
      page: currentPage,
    };
    if (statusFilter !== '') params.is_active = statusFilter;

    getCategories(token, params);
  }, [search, statusFilter, currentPage, getCategories]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFilteredData();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [fetchFilteredData]);

  const handleDelete = async slug => {
    if (confirm('Are you sure? This will delete the medicine group.')) {
      const token = localStorage.getItem('access_token');
      try {
        await deleteCategory(token, slug);
      } catch (err) {
        alert('Failed to delete group');
      }
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20 bg-(--color-admin-bg)">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-(--color-admin-border) pb-6">
        <div>
          <span className="font-mono text-xs font-bold text-(--color-admin-primary) uppercase tracking-widest">
            Store Records / Medicine Groups
          </span>
          <h1 className="text-4xl font-black text-(--color-admin-navy) tracking-tighter uppercase">
            Medicine Groups
          </h1>
          <p className="font-mono text-[11px] text-(--color-text-secondary) mt-2 uppercase">
            Organize medicines by their types (e.g. Syrup, Tablet)
          </p>
        </div>
        <Link href="/pharmacy/categories/new">
          <button className="bg-(--color-admin-primary) text-white px-8 py-3.5 rounded-none font-bold text-xs tracking-widest flex items-center gap-2 hover:bg-(--color-admin-accent) transition-all duration-300 cursor-pointer uppercase border border-(--color-admin-border)">
            <FiPlus size={18} /> ADD NEW GROUP
          </button>
        </Link>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-(--color-admin-card) border border-(--color-admin-border) p-1">
          <div className="relative">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-(--color-text-secondary)"
              size={16}
            />
            <input
              type="text"
              placeholder="SEARCH GROUPS BY NAME..."
              className="w-full h-10 pl-10 pr-4 bg-transparent rounded-none text-sm font-mono focus:outline-none uppercase tracking-tight placeholder:text-gray-300"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        <div className="bg-(--color-admin-card) border border-(--color-admin-border) p-1">
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-10 px-4 bg-transparent rounded-none text-xs font-mono font-bold uppercase focus:outline-none cursor-pointer"
          >
            <option value="">ALL STATUSES</option>
            <option value="true">ACTIVE ONLY</option>
            <option value="false">INACTIVE ONLY</option>
          </select>
        </div>
      </div>

      {/* 3. Table Container */}
      <div className="bg-(--color-admin-card) border border-(--color-admin-border) rounded-none flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-(--color-admin-navy) text-white text-[11px] uppercase tracking-[0.2em] font-bold">
                <th className="px-8 py-4 text-left border-r border-white/10">
                  GROUP NAME
                </th>
                <th className="px-8 py-4 text-left border-r border-white/10">
                  MAIN GROUP
                </th>
                <th className="px-8 py-4 text-left border-r border-white/10">
                  STATUS
                </th>
                <th className="px-8 py-4 text-right">OPTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-admin-border)">
              {loading && categoryList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="font-mono text-sm animate-pulse tracking-widest text-(--color-admin-primary)">
                      SYNCING_DATA... PLEASE WAIT
                    </div>
                  </td>
                </tr>
              ) : categoryList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-(--color-text-secondary)">
                      <FiLayers size={40} />
                      <p className="font-mono text-sm font-bold uppercase tracking-widest">
                        NO GROUPS FOUND
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                categoryList.map(category => (
                  <tr
                    key={category.id}
                    className="hover:bg-white transition-colors duration-200 group"
                  >
                    <td className="px-8 py-6 border-r border-(--color-admin-border)">
                      <div className="flex flex-col">
                        <span className="font-bold text-(--color-admin-navy) text-sm uppercase">
                          {category.name}
                        </span>
                        <span className="font-mono text-[9px] text-gray-400 uppercase">
                          ID: #{category.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 border-r border-(--color-admin-border)">
                      {category.parent ? (
                        <span className="font-mono text-[10px] font-bold bg-(--color-admin-bg) border border-(--color-admin-border) px-2 py-1 uppercase text-(--color-admin-navy)">
                          PARENT: #{category.parent}
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] font-bold bg-(--color-admin-bg) border border-(--color-admin-primary) text-(--color-admin-primary) px-2 py-1 uppercase tracking-widest">
                          MAIN_GROUP
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 border-r border-(--color-admin-border)">
                      <span
                        className={`px-3 py-1 border font-mono text-[10px] font-bold uppercase tracking-widest ${
                          category.is_active
                            ? 'bg-green-50 text-(--color-admin-success) border-(--color-admin-success)'
                            : 'bg-red-50 text-(--color-admin-error) border-(--color-admin-error)'
                        }`}
                      >
                        {category.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/pharmacy/categories/edit/${category.slug}`}
                        >
                          <button className="w-10 h-10 border border-(--color-admin-border) flex items-center justify-center text-(--color-admin-navy) hover:bg-(--color-admin-accent) hover:text-white hover:border-(--color-admin-accent) transition-all duration-300 rounded-none cursor-pointer">
                            <FiEdit2 size={16} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(category.slug)}
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

      {/* 4. Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-6 border border-(--color-admin-border) bg-(--color-admin-card) flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="font-mono text-[11px] font-bold text-(--color-text-secondary) uppercase">
            Page{' '}
            <span className="text-(--color-admin-navy)">{currentPage}</span> //
            Total{' '}
            <span className="text-(--color-admin-navy)">{totalCount}</span>
          </p>
          <div className="flex items-center gap-0 border border-(--color-admin-border) bg-white">
            <button
              disabled={!hasPrev || loading}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="w-12 h-12 flex items-center justify-center border-r border-(--color-admin-border) text-(--color-admin-navy) hover:bg-(--color-admin-accent) hover:text-white transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
            >
              <FiChevronLeft size={20} />
            </button>
            <div className="px-6 flex items-center font-mono text-xs font-bold text-(--color-admin-navy)">
              {currentPage.toString().padStart(2, '0')}
            </div>
            <button
              disabled={!hasNext || loading}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="w-12 h-12 flex items-center justify-center border-l border-(--color-admin-border) text-(--color-admin-navy) hover:bg-(--color-admin-accent) hover:text-white transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
