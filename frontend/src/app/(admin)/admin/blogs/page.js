'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiFileText,
  FiGrid,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import { useBlogAdmin } from '../../hooks/useBlogAdmin';
import { formatDate } from '@/app/(user)/lib/formatters';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';
import Pagination from '../../components/Pagination';

/**
 * Admin Blog Management Page
 * Strictly follows the Super Admin "Sharp Minimalist" design system.
 * Features: Tabbed interface for Articles and Categories, paginated tables.
 */
export default function AdminBlogPage() {
  const [activeTab, setActiveTab] = useState('Articles'); // 'Articles' or 'Categories'
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const {
    posts,
    categories,
    loading,
    fetchPosts,
    fetchCategories,
    deletePost,
    deleteCategory,
  } = useBlogAdmin();

  useEffect(() => {
    const params = { page, search };
    if (activeTab === 'Articles') {
      fetchPosts(params);
    } else {
      fetchCategories(params);
    }
  }, [page, search, activeTab, fetchPosts, fetchCategories]);

  const handleDelete = async (slug, title) => {
    const type = activeTab === 'Articles' ? 'article' : 'category';
    if (confirm(`Are you sure you want to delete this ${type}: "${title}"?`)) {
      if (activeTab === 'Articles') {
        await deletePost(slug);
      } else {
        await deleteCategory(slug);
      }
    }
  };

  const currentData = activeTab === 'Articles' ? posts : categories;

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#1B1B1B] tracking-tighter uppercase">
            Blog Management
          </h1>
          <p className="text-[13px] text-[#6B6B5E] mt-1 font-medium">
            Manage your health articles and content categories.
          </p>
        </div>
        <Link
          href={
            activeTab === 'Articles'
              ? '/admin/blogs/new'
              : '/admin/blogs/categories/new'
          }
          className="h-12 px-6 bg-[#1B1B1B] text-white font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-[#3A5A40] transition-all rounded-none"
        >
          <FiPlus size={16} /> New{' '}
          {activeTab === 'Articles' ? 'Article' : 'Category'}
        </Link>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 border-b border-gray-100">
        {['Articles', 'Categories'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
              setSearch('');
            }}
            className={`px-8 py-4 font-mono text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer border-t-2 ${
              activeTab === tab
                ? 'bg-white border-t-[#3A5A40] border-x border-x-gray-100 -mb-px text-[#3A5A40]'
                : 'bg-transparent border-t-transparent text-[#8A8A78] hover:text-[#1B1B1B]'
            }`}
          >
            {tab === 'Articles' ? (
              <FiFileText className="inline mr-2" />
            ) : (
              <FiGrid className="inline mr-2" />
            )}
            {tab}
          </button>
        ))}
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
            placeholder={`SEARCH ${activeTab.toUpperCase()}...`}
            className="w-full h-10 pl-10 pr-4 bg-transparent rounded-none text-sm font-mono focus:outline-none uppercase tracking-tight placeholder:text-gray-300"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white border border-gray-100 rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[#1B1B1B] text-[11px] uppercase tracking-[0.2em] font-bold border-b border-gray-100">
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  ID REF
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  {activeTab === 'Articles' ? 'Article Title' : 'Category Name'}
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  {activeTab === 'Articles' ? 'Category' : 'Slug Identifier'}
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  {activeTab === 'Articles' ? 'Status' : 'Display Order'}
                </th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && currentData.results.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-8 py-20 text-center font-mono text-sm animate-pulse text-[#3A5A40]"
                  >
                    FETCHING CONTENT...
                  </td>
                </tr>
              ) : currentData.results.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-8 py-20 text-center flex flex-col items-center gap-4 text-[#8A8A78]"
                  >
                    <FiFileText size={40} />
                    <p className="font-mono text-sm font-bold uppercase">
                      No {activeTab} Found
                    </p>
                  </td>
                </tr>
              ) : (
                currentData.results.map(item => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 transition-colors duration-200 group"
                  >
                    <td className="px-8 py-6 border-r border-gray-100 font-mono text-xs font-bold text-[#8A8A78]">
                      #{item.id}
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100">
                      <div className="flex items-center gap-4">
                        {activeTab === 'Articles' && (
                          <div className="relative w-12 h-12 bg-gray-100 border border-gray-100 overflow-hidden shrink-0">
                            <Image
                              src={getMediaUrl(
                                item.article_image_url || item.article_image,
                              )}
                              alt=""
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        )}
                        <span className="font-bold text-[#1B1B1B] text-sm uppercase truncate max-w-[300px]">
                          {activeTab === 'Articles' ? item.title : item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100 font-mono text-xs text-[#6B6B5E]">
                      {activeTab === 'Articles'
                        ? item.category_name
                        : item.slug}
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100">
                      {activeTab === 'Articles' ? (
                        <span
                          className={`px-3 py-1 border font-mono text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1 w-fit ${
                            item.is_published
                              ? 'text-green-600 bg-green-50 border-green-100'
                              : 'text-amber-600 bg-amber-50 border-amber-100'
                          }`}
                        >
                          {item.is_published ? <FiEye /> : <FiEyeOff />}
                          {item.is_published ? 'Published' : 'Draft'}
                        </span>
                      ) : (
                        <span className="font-mono text-sm font-bold text-[#1B1B1B]">
                          {item.order}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={
                            activeTab === 'Articles'
                              ? `/admin/blogs/edit/${item.slug}`
                              : `/admin/blogs/categories/edit/${item.slug}`
                          }
                        >
                          <button className="w-10 h-10 border border-gray-200 flex items-center justify-center text-[#1B1B1B] hover:bg-black hover:text-white transition-all duration-300 cursor-pointer">
                            <FiEdit2 size={14} />
                          </button>
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(
                              item.slug,
                              activeTab === 'Articles' ? item.title : item.name,
                            )
                          }
                          className="w-10 h-10 border border-gray-200 flex items-center justify-center text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-300 cursor-pointer"
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

      {/* Pagination Footer */}
      <Pagination
        page={page}
        setPage={setPage}
        totalItems={currentData.count}
        loading={loading}
        label="Total Count"
      />
    </div>
  );
}
