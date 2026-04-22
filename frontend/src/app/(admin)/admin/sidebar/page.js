'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiList,
  FiStar,
  FiLayout,
  FiGrid,
} from 'react-icons/fi';
import { useSidebarAdmin } from '../../hooks/useSidebarAdmin';
import { useCategoryAdmin } from '../../hooks/useCategoryAdmin';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';
import AuthGuard from '@/app/(shared)/components/AuthGuard';

/**
 * AdminSidebarManagementPage (Catalog Architecture Manager)
 * Updated: Tab navigation fixed to link "Visual Organizer" to its dedicated route.
 * Labels updated to business-friendly terminology: Main Categories & Sub-categories.
 */
export default function AdminSidebarManagementPage() {
  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN']}>
      <NavigationManagerContent />
    </AuthGuard>
  );
}

function NavigationManagerContent() {
  const {
    sidebarItems: mainCategories,
    fetchSidebarItems,
    deleteSidebarItem,
  } = useSidebarAdmin();

  const {
    categories: subCategoriesRes,
    sidebarSelection,
    featuredSelection,
    isUpdating,
    fetchCategories,
    fetchSidebarSelection,
    saveSidebarSelection,
    fetchFeaturedSelection,
    saveFeaturedSelection,
  } = useCategoryAdmin();

  // Local state for tabs that stay on this page
  const [activeTab, setActiveTab] = useState('MAIN_CATEGORIES');
  const [displaySearch, setDisplaySearch] = useState('');

  useEffect(() => {
    fetchSidebarItems();
    fetchCategories({ page_size: 500 });
    fetchSidebarSelection();
    fetchFeaturedSelection();
  }, [
    fetchSidebarItems,
    fetchCategories,
    fetchSidebarSelection,
    fetchFeaturedSelection,
  ]);

  const [orderedSidebarIds, setOrderedSidebarIds] = useState([]);
  const [orderedFeaturedIds, setOrderedFeaturedIds] = useState([]);

  useEffect(() => {
    if (sidebarSelection.length > 0)
      setOrderedSidebarIds(sidebarSelection.map(c => c.id));
    if (featuredSelection.length > 0)
      setOrderedFeaturedIds(featuredSelection.map(c => c.id));
  }, [sidebarSelection, featuredSelection]);

  const subCategoryList = subCategoriesRes.results || [];

  const handleToggleSelection = (id, type) => {
    if (type === 'SIDEBAR') {
      setOrderedSidebarIds(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
      );
    } else {
      setOrderedFeaturedIds(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
      );
    }
  };

  const saveDisplayMapping = async type => {
    const success =
      type === 'SIDEBAR'
        ? await saveSidebarSelection(orderedSidebarIds)
        : await saveFeaturedSelection(orderedFeaturedIds);
    if (success) alert(`${type} configuration synchronized.`);
  };

  const handleDeleteMain = async (id, title) => {
    if (confirm(`Are you sure you want to delete Main Category: "${title}"?`)) {
      await deleteSidebarItem(id);
    }
  };

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl font-black text-[#1B1B1B] tracking-tighter uppercase leading-none">
            Catalog Architecture
          </h1>
          <p className="text-[13px] text-[#6B6B5E] mt-3 font-medium">
            Manage Main Categories and configure visibility rules for the public
            shop.
          </p>
        </div>
        <div className="flex bg-gray-50 p-1 border border-gray-100">
          <button
            onClick={() => setActiveTab('MAIN_CATEGORIES')}
            className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-none cursor-pointer ${activeTab === 'MAIN_CATEGORIES' ? 'bg-white text-[#1B1B1B] shadow-sm' : 'text-[#8A8A78] hover:text-[#1B1B1B]'}`}
          >
            Management List
          </button>

          {/* FIXED: Linking to the dedicated /organize route */}
          <Link href="/admin/sidebar/organize">
            <button className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-none cursor-pointer text-[#8A8A78] hover:text-[#1B1B1B]">
              Visual Organizer
            </button>
          </Link>

          <button
            onClick={() => setActiveTab('DISPLAY_RULES')}
            className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-none cursor-pointer ${activeTab === 'DISPLAY_RULES' ? 'bg-white text-[#1B1B1B] shadow-sm' : 'text-[#8A8A78] hover:text-[#1B1B1B]'}`}
          >
            Display Rules
          </button>
        </div>
      </div>

      {/* TAB 1: MAIN CATEGORIES LIST */}
      {activeTab === 'MAIN_CATEGORIES' && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <FiLayout /> Registered Main Categories
            </h3>
            <Link href="/admin/sidebar/new">
              <button className="bg-[#3A5A40] text-white px-8 py-3.5 rounded-none font-bold text-xs tracking-widest flex items-center gap-2 hover:bg-black transition-all cursor-pointer uppercase border-none shadow-none">
                <FiPlus /> New Main Category
              </button>
            </Link>
          </div>

          <div className="bg-white border border-gray-100 rounded-none overflow-hidden shadow-none">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[#1B1B1B] text-[11px] uppercase tracking-[0.2em] font-bold">
                  <th className="px-8 py-4 text-left border-r border-gray-100 w-24">
                    Icon
                  </th>
                  <th className="px-8 py-4 text-left border-r border-gray-100">
                    Category Title
                  </th>
                  <th className="px-8 py-4 text-left border-r border-gray-100">
                    Linked Sub-categories
                  </th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mainCategories.map(main => (
                  <tr
                    key={main.id}
                    className="hover:bg-gray-50/50 transition-colors duration-200"
                  >
                    <td className="px-8 py-4 border-r border-gray-100">
                      <div className="w-12 h-12 relative bg-white border border-gray-100 p-1 flex items-center justify-center rounded-none">
                        <Image
                          src={
                            main.image_url || '/assets/images/placeholder.png'
                          }
                          alt={main.title}
                          fill
                          className="object-contain p-1"
                          unoptimized
                        />
                      </div>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100">
                      <span className="font-bold text-[#1B1B1B] text-sm uppercase tracking-tight">
                        {main.title}
                      </span>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100">
                      <span className="font-mono text-[11px] text-[#8A8A78]">
                        COUNT:{' '}
                        {
                          subCategoryList.filter(
                            sc => sc.sidebar_category === main.id,
                          ).length
                        }
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/sidebar/edit/${main.id}`}>
                          <button className="w-9 h-9 border border-gray-200 flex items-center justify-center text-[#1B1B1B] hover:bg-[#3A5A40] hover:text-white transition-all cursor-pointer shadow-none rounded-none">
                            <FiEdit2 size={14} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDeleteMain(main.id, main.title)}
                          className="w-9 h-9 border border-gray-200 flex items-center justify-center text-[#1B1B1B] hover:bg-red-600 hover:text-white transition-all cursor-pointer shadow-none rounded-none"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DISPLAY RULES */}
      {activeTab === 'DISPLAY_RULES' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white border border-gray-100 p-8 space-y-6 rounded-none shadow-none">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <FiList className="text-[#3A5A40]" /> Category Selection
              </h3>
              <button
                onClick={() => saveDisplayMapping('SIDEBAR')}
                disabled={isUpdating}
                className="bg-[#3A5A40] text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 cursor-pointer rounded-none border-none shadow-none"
              >
                SAVE
              </button>
            </div>
            <div className="max-h-[500px] overflow-y-auto admin-scrollbar divide-y divide-gray-50">
              {subCategoryList.map(cat => (
                <label
                  key={cat.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer rounded-none"
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#3A5A40]"
                      checked={orderedSidebarIds.includes(cat.id)}
                      onChange={() => handleToggleSelection(cat.id, 'SIDEBAR')}
                    />
                    <span className="text-sm font-bold text-[#1B1B1B] uppercase">
                      {cat.name}
                    </span>
                  </div>
                  {orderedSidebarIds.includes(cat.id) && (
                    <span className="font-mono text-[10px] font-bold text-[#3A5A40] bg-[#E8F0EA] px-2 py-1 rounded-none shadow-none">
                      S_{orderedSidebarIds.indexOf(cat.id) + 1}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-8 space-y-6 rounded-none shadow-none">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <FiStar className="text-[#F59E0B]" /> Featured Home
              </h3>
              <button
                onClick={() => saveDisplayMapping('FEATURED')}
                disabled={isUpdating}
                className="bg-black text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-[#3A5A40] transition-all disabled:opacity-50 cursor-pointer rounded-none border-none shadow-none"
              >
                SAVE
              </button>
            </div>
            <div className="max-h-[500px] overflow-y-auto admin-scrollbar divide-y divide-gray-50">
              {subCategoryList.map(cat => (
                <label
                  key={cat.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer rounded-none"
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-black"
                      checked={orderedFeaturedIds.includes(cat.id)}
                      onChange={() => handleToggleSelection(cat.id, 'FEATURED')}
                    />
                    <span className="text-sm font-bold text-[#1B1B1B] uppercase">
                      {cat.name}
                    </span>
                  </div>
                  {orderedFeaturedIds.includes(cat.id) && (
                    <span className="font-mono text-[10px] font-bold text-white bg-black px-2 py-1 rounded-none shadow-none">
                      F_{orderedFeaturedIds.indexOf(cat.id) + 1}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
