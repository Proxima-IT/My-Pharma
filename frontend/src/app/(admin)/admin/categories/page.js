'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiLayers,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { useCategoryAdmin } from '../../hooks/useCategoryAdmin';

export default function AdminCategoryListPage() {
  const { categories, loading, fetchCategories, deleteCategory } =
    useCategoryAdmin();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCategories({ page, search });
  }, [page, search, fetchCategories]);

  const handleDelete = async (slug, name) => {
    if (confirm(`Are you sure you want to delete the group "${name}"?`)) {
      await deleteCategory(slug);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#1B1B1B] tracking-tighter uppercase">
            Medicine Groups
          </h1>
          <p className="text-[13px] text-[#6B6B5E] mt-1 font-medium">
            Organize your medicines into different types and categories.
          </p>
        </div>
        <Link href="/admin/categories/new">
          <button className="bg-[#3A5A40] text-white px-8 py-3.5 rounded-none font-bold text-xs tracking-widest flex items-center gap-2 hover:bg-[#F59E0B] transition-all duration-300 cursor-pointer uppercase border border-transparent">
            <FiPlus size={18} /> Add New Group
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
            placeholder="SEARCH GROUPS BY NAME..."
            className="w-full h-10 pl-10 pr-4 bg-transparent rounded-none text-sm font-mono focus:outline-none uppercase tracking-tight placeholder:text-gray-300"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white border border-gray-100 rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[#1B1B1B] text-[11px] uppercase tracking-[0.2em] font-bold">
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Group Name
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Parent Group
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Status
                </th>
                <th className="px-8 py-4 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && categories.results.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="font-mono text-sm animate-pulse text-[#3A5A40]">
                      LOADING_GROUPS...
                    </div>
                  </td>
                </tr>
              ) : categories.results.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-8 py-20 text-center flex flex-col items-center gap-4 text-[#8A8A78]"
                  >
                    <FiLayers size={40} />
                    <p className="font-mono text-sm font-bold uppercase">
                      No Groups Found
                    </p>
                  </td>
                </tr>
              ) : (
                categories.results.map(category => (
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
                          ID: #{category.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100">
                      {category.parent ? (
                        <span className="font-mono text-[10px] font-bold bg-gray-50 border border-gray-200 px-2 py-1 text-[#1B1B1B]">
                          PARENT: #{category.parent}
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] font-bold text-[#3A5A40] bg-[#E8F0EA] px-2 py-1 border border-[#3A5A40]/20 tracking-widest">
                          MAIN_GROUP
                        </span>
                      )}
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
                        <Link href={`/admin/categories/edit/${category.slug}`}>
                          <button className="w-9 h-9 border border-gray-200 flex items-center justify-center text-[#1B1B1B] hover:bg-[#3A5A40] hover:text-white transition-all duration-300 cursor-pointer">
                            <FiEdit2 size={14} />
                          </button>
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(category.slug, category.name)
                          }
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
          Total Groups:{' '}
          <span className="text-[#1B1B1B]">{categories.count}</span>
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
            disabled={categories.results.length < 10 || loading}
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
