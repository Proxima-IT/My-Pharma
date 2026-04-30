'use client';
import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiArrowLeft,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiLayers,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiInfo,
} from 'react-icons/fi';
import { useCategoryAdmin } from '../../../hooks/useCategoryAdmin';
import AuthGuard from '@/app/(shared)/components/AuthGuard';

/**
 * AdminCategoryDetailPage
 * Strictly follows the Super Admin "Sharp" design system.
 * Displays details of a specific category and lists all its direct sub-categories in a table.
 */
export default function AdminCategoryDetailPage({ params }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN']}>
      <CategoryDetailContent slug={slug} />
    </AuthGuard>
  );
}

function CategoryDetailContent({ slug }) {
  const router = useRouter();
  const {
    fetchCategoryBySlug,
    fetchCategories,
    categories: subCategories,
    loading,
    deleteCategory,
  } = useCategoryAdmin();

  const [currentCategory, setCurrentCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // 1. Initial Load: Fetch current category info and then its children
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchCategoryBySlug(slug);
      if (data) {
        setCurrentCategory(data);
        // Fetch only children of this category
        fetchCategories({ parent: data.id, page, search });
      }
    };
    if (slug) loadData();
  }, [slug, page, search, fetchCategoryBySlug, fetchCategories]);

  const handleDelete = async (subSlug, name) => {
    if (
      confirm(`Are you sure you want to delete the sub-category "${name}"?`)
    ) {
      await deleteCategory(subSlug);
    }
  };

  if (loading && !currentCategory) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-10 h-10 border-4 border-[#3A5A40] border-t-transparent animate-spin rounded-none" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-black pb-8">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push('/admin/categories')}
            className="p-4 bg-black text-white hover:bg-gray-800 transition-all cursor-pointer rounded-none"
          >
            <FiArrowLeft size={24} />
          </button>
          <div>
            <span className="font-mono text-[10px] font-bold text-[#8A8A78] uppercase tracking-[0.2em]">
              Category / Explorer
            </span>
            <h1 className="text-4xl font-black text-[#1B1B1B] tracking-tighter uppercase leading-none">
              {currentCategory?.name || 'Category Details'}
            </h1>
          </div>
        </div>
        <Link href={`/admin/categories/new?parent=${currentCategory?.id}`}>
          <button className="bg-[#3A5A40] text-white px-8 py-4 rounded-none font-bold text-xs tracking-widest flex items-center gap-3 hover:bg-black transition-all cursor-pointer uppercase border-none shadow-none">
            <FiPlus size={18} /> New Sub-category
          </button>
        </Link>
      </div>

      {/* Meta Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 border border-gray-100 p-6">
        <div className="space-y-1">
          <span className="block font-mono text-[9px] font-bold text-[#8A8A78] uppercase tracking-widest">
            System_ID
          </span>
          <span className="font-bold text-[#1B1B1B]">
            #{currentCategory?.id}
          </span>
        </div>
        <div className="space-y-1">
          <span className="block font-mono text-[9px] font-bold text-[#8A8A78] uppercase tracking-widest">
            Slug_Reference
          </span>
          <span className="font-mono text-sm font-bold text-[#1B1B1B]">
            {currentCategory?.slug}
          </span>
        </div>
        <div className="space-y-1">
          <span className="block font-mono text-[9px] font-bold text-[#8A8A78] uppercase tracking-widest">
            Status
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 border ${currentCategory?.is_active ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'} uppercase`}
          >
            {currentCategory?.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Sub-category Listing Table (Mirrors Main Category List) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-[#1B1B1B]">
            <FiLayers className="text-[#3A5A40]" /> Sub-categories
          </h3>
          {/* Internal Search */}
          <div className="max-w-xs w-full bg-white border border-gray-200 p-1 shadow-none flex items-center">
            <FiSearch className="mx-3 text-[#8A8A78]" size={14} />
            <input
              type="text"
              placeholder="FILTER_SUBS..."
              className="w-full h-8 bg-transparent rounded-none text-xs font-mono focus:outline-none uppercase tracking-tight placeholder:text-gray-300 text-[#1B1B1B]"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-none overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[#1B1B1B] text-[11px] uppercase tracking-[0.2em] font-bold">
                  <th className="px-8 py-4 text-left border-r border-gray-100">
                    Identity
                  </th>
                  <th className="px-8 py-4 text-left border-r border-gray-100">
                    Status
                  </th>
                  <th className="px-8 py-4 text-right">Options</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading && subCategories.results.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-8 py-20 text-center font-mono text-sm animate-pulse text-[#3A5A40] uppercase"
                    >
                      Scanning_Child_Nodes...
                    </td>
                  </tr>
                ) : subCategories.results.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-8 py-20 text-center flex flex-col items-center gap-4 text-[#8A8A78]"
                    >
                      <FiLayers size={40} />
                      <p className="font-mono text-sm font-bold uppercase">
                        No Sub-categories Created Yet
                      </p>
                    </td>
                  </tr>
                ) : (
                  subCategories.results.map(sub => (
                    <tr
                      key={sub.id}
                      className="hover:bg-gray-50/50 transition-colors duration-200 group"
                    >
                      <td className="px-8 py-6 border-r border-gray-100">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#1B1B1B] text-sm uppercase tracking-tight">
                            {sub.name}
                          </span>
                          <span className="font-mono text-[9px] text-[#8A8A78]">
                            ID: #{sub.id} | SLUG: {sub.slug}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 border-r border-gray-100">
                        <span
                          className={`px-3 py-1 border font-mono text-[10px] font-bold uppercase tracking-tighter ${sub.is_active ? 'text-green-600 bg-green-50 border-green-100' : 'text-red-600 bg-red-50 border-red-100'}`}
                        >
                          {sub.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/categories/${sub.slug}`}>
                            <button className="w-9 h-9 border border-gray-200 flex items-center justify-center text-[#1B1B1B] hover:bg-black hover:text-white transition-all cursor-pointer shadow-none">
                              <FiEye size={14} />
                            </button>
                          </Link>
                          <Link href={`/admin/categories/edit/${sub.slug}`}>
                            <button className="w-9 h-9 border border-gray-200 flex items-center justify-center text-[#1B1B1B] hover:bg-[#3A5A40] hover:text-white transition-all cursor-pointer shadow-none">
                              <FiEdit2 size={14} />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(sub.slug, sub.name)}
                            className="w-9 h-9 border border-gray-200 flex items-center justify-center text-[#1B1B1B] hover:bg-red-600 hover:text-white transition-all cursor-pointer shadow-none"
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
          <p className="font-mono text-[10px] font-bold text-[#8A8A78] uppercase">
            Total Sub-items:{' '}
            <span className="text-[#1B1B1B]">{subCategories.count}</span>
          </p>
          <div className="flex items-center gap-0 border border-gray-200 bg-white">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage(p => p - 1)}
              className="w-10 h-10 flex items-center justify-center border-r border-gray-200 hover:bg-gray-50 disabled:opacity-20 cursor-pointer"
            >
              <FiChevronLeft size={18} />
            </button>
            <div className="px-6 font-mono text-xs font-bold text-[#1B1B1B] flex items-center h-10">
              PAGE {page}
            </div>
            <button
              disabled={subCategories.results.length < 10 || loading}
              onClick={() => setPage(p => p + 1)}
              className="w-10 h-10 flex items-center justify-center border-l border-gray-200 hover:bg-gray-50 disabled:opacity-20 cursor-pointer"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
