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
  FiFilter,
} from 'react-icons/fi';
import { useCategories } from '../../hooks/useCategories';
import UiInput from '@/app/(public)/components/UiInput';

export default function CategoryListPage() {
  const { categories, loading, getCategories, deleteCategory } =
    useCategories();

  // State for Filters and Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' (All), 'true', 'false'
  const [currentPage, setCurrentPage] = useState(1);

  // Defensive check for paginated data
  const categoryList = Array.isArray(categories)
    ? categories
    : categories?.results || [];
  const totalCount = categories?.count || 0;
  const hasNext = !!categories?.next;
  const hasPrev = !!categories?.previous;

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
    if (
      confirm(
        'Are you sure you want to delete this category? This may affect sub-categories.',
      )
    ) {
      const token = localStorage.getItem('access_token');
      try {
        await deleteCategory(token, slug);
      } catch (err) {
        alert('Failed to delete category');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* 1. Header Section - Responsive Flex */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            Category Management
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            Organize your product catalog hierarchy.
          </p>
        </div>
        <Link href="/pharmacy/categories/new">
          <button className="w-full sm:w-auto bg-(--color-primary-500) text-white px-8 py-4 rounded-full font-bold text-[13px] tracking-widest flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95 cursor-pointer uppercase">
            <FiPlus size={18} /> Add Category
          </button>
        </Link>
      </div>

      {/* 2. Search & Filter Bar - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
        <div className="lg:col-span-2">
          <UiInput
            placeholder="Search categories by name..."
            leftIcon={<FiSearch className="text-gray-400" />}
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset to page 1 on search
            }}
          />
        </div>
        <div className="flex flex-col gap-2 group">
          <label className="text-[13px] font-bold text-gray-600 ml-5 flex items-center gap-2">
            <FiFilter size={14} /> Status Filter
          </label>
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-3.5 pl-6 pr-10 rounded-full outline-none text-sm text-gray-900 bg-white border border-gray-200 focus:ring-4 focus:ring-primary-50/50 focus:border-(--color-primary-500) transition-all appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* 3. Table Container - Responsive Scroll */}
      <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">
                  Category Name
                </th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">
                  Parent
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
              {loading && categoryList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
                      <span className="text-gray-400 font-bold tracking-tight">
                        Loading categories...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : categoryList.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-8 py-20 text-center text-gray-400 font-medium"
                  >
                    No categories found matching your criteria.
                  </td>
                </tr>
              ) : (
                categoryList.map(category => (
                  <tr
                    key={category.id}
                    className="hover:bg-gray-50/30 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 tracking-tight text-sm">
                          {category.name}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                          ID: #{category.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {category.parent ? (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[11px] font-bold">
                          Parent ID: {category.parent}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-[11px] font-bold italic">
                          Root
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          category.is_active
                            ? 'bg-green-50 text-(--color-success-500)'
                            : 'bg-red-50 text-red-500'
                        }`}
                      >
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/pharmacy/categories/edit/${category.slug}`}
                        >
                          <button className="p-2.5 rounded-full text-gray-400 hover:text-(--color-primary-500) hover:bg-primary-50 transition-all cursor-pointer">
                            <FiEdit2 size={18} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(category.slug)}
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

      {/* 4. Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-2">
        <p className="text-sm text-gray-500 font-medium">
          Showing{' '}
          <span className="text-gray-900 font-bold">{categoryList.length}</span>{' '}
          of <span className="text-gray-900 font-bold">{totalCount}</span>{' '}
          categories
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled={!hasPrev || loading}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="p-3 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <FiChevronLeft size={20} />
          </button>
          <div className="px-6 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-900">
            Page {currentPage}
          </div>
          <button
            disabled={!hasNext || loading}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="p-3 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
