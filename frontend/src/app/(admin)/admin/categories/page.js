'use client';
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiLayers,
  FiEye,
} from 'react-icons/fi';
import { useCategoryAdmin } from '../../hooks/useCategoryAdmin';
import Pagination from '../../components/Pagination';

/**
 * AdminCategoryListPage
 * Strictly follows the Super Admin "Sharp" design system.
 * Update: Implemented Frontend-side filtering to only show Root Categories (parent === null).
 * This ensures sub-categories remain hidden even if the backend filter fails.
 */
export default function AdminCategoryListPage() {
  const { categories, loading, fetchCategories, deleteCategory } =
    useCategoryAdmin();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Fetch data normally (since backend filter is currently unreliable)
  useEffect(() => {
    fetchCategories({ page, search });
  }, [page, search, fetchCategories]);

  /**
   * FRONTEND FILTER LOGIC:
   * We only show categories where 'parent' is strictly null.
   * This guarantees that only Main (Root) categories appear on this page.
   */
  const rootCategories = useMemo(() => {
    if (!categories.results) return [];
    return categories.results.filter(category => category.parent === null);
  }, [categories.results]);

  const handleDelete = async (slug, name) => {
    if (confirm(`Are you sure you want to delete the category "${name}"?`)) {
      await deleteCategory(slug);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#1B1B1B] tracking-tighter uppercase">
            Main Categories
          </h1>
          <p className="text-[13px] text-[#6B6B5E] mt-1 font-medium">
            Registry of top-level categories. Sub-categories are nested within
            these records.
          </p>
        </div>
        <Link href="/admin/categories/new">
          <button className="bg-[#3A5A40] text-white px-8 py-3.5 rounded-none font-bold text-xs tracking-widest flex items-center gap-2 hover:bg-[#F59E0B] transition-all duration-300 cursor-pointer uppercase border border-transparent shadow-none">
            <FiPlus size={18} /> Add New Category
          </button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="max-w-md bg-white border border-gray-100 p-1 shadow-none">
        <div className="relative">
          <FiSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A78]"
            size={16}
          />
          <input
            type="text"
            placeholder="FILTER MAIN CATEGORIES..."
            className="w-full h-10 pl-10 pr-4 bg-transparent rounded-none text-sm font-mono focus:outline-none uppercase tracking-tight placeholder:text-gray-300 text-[#1B1B1B]"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white border border-gray-100 rounded-none overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[#1B1B1B] text-[11px] uppercase tracking-[0.2em] font-bold">
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Category Identity
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Status
                </th>
                <th className="px-8 py-4 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && rootCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-8 py-20 text-center font-mono text-sm animate-pulse text-[#3A5A40] uppercase"
                  >
                    Syncing Registry Data...
                  </td>
                </tr>
              ) : rootCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-8 py-20 text-center flex flex-col items-center gap-4 text-[#8A8A78]"
                  >
                    <FiLayers size={40} />
                    <p className="font-mono text-sm font-bold uppercase">
                      No Main Categories Found
                    </p>
                  </td>
                </tr>
              ) : (
                rootCategories.map(category => (
                  <tr
                    key={category.id}
                    className="hover:bg-gray-50/50 transition-colors duration-200 group"
                  >
                    <td className="px-8 py-6 border-r border-gray-100">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1B1B1B] text-sm uppercase tracking-tight">
                          {category.name}
                        </span>
                        <span className="font-mono text-[9px] text-[#8A8A78]">
                          SLUG: {category.slug}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100">
                      <span
                        className={`px-3 py-1 border font-mono text-[10px] font-bold uppercase tracking-tighter ${
                          category.is_active
                            ? 'text-green-600 bg-green-50 border-green-100'
                            : 'text-red-600 bg-red-50 border-red-100'
                        }`}
                      >
                        {category.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/categories/${category.slug}`}>
                          <button className="w-9 h-9 border border-gray-200 flex items-center justify-center text-[#1B1B1B] hover:bg-black hover:text-white transition-all duration-300 cursor-pointer shadow-none rounded-none">
                            <FiEye size={14} />
                          </button>
                        </Link>
                        <Link href={`/admin/categories/edit/${category.slug}`}>
                          <button className="w-9 h-9 border border-gray-200 flex items-center justify-center text-[#1B1B1B] hover:bg-[#3A5A40] hover:text-white transition-all duration-300 cursor-pointer shadow-none rounded-none">
                            <FiEdit2 size={14} />
                          </button>
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(category.slug, category.name)
                          }
                          className="w-9 h-9 border border-gray-200 flex items-center justify-center text-[#1B1B1B] hover:bg-red-600 hover:text-white transition-all duration-300 cursor-pointer shadow-none rounded-none"
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
        totalItems={categories.count}
        loading={loading}
        label="Filtered Records"
      />
    </div>
  );
}
