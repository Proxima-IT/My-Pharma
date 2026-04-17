'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiGrid,
  FiSave,
  FiList,
  FiStar,
} from 'react-icons/fi';
import { useSidebarAdmin } from '../../hooks/useSidebarAdmin';
import { useCategoryAdmin } from '../../hooks/useCategoryAdmin';

/**
 * AdminSidebarManagementPage
 * Dual Management:
 * 1. Method A: Bulk Selection of Product Categories for Sidebar & Featured.
 * 2. Method B: Management of Custom Sidebar Menu Items.
 */
export default function AdminSidebarManagementPage() {
  const {
    sidebarItems,
    loading: customLoading,
    fetchSidebarItems,
    deleteSidebarItem,
  } = useSidebarAdmin();

  const {
    categories: allCategories,
    sidebarSelection,
    featuredSelection,
    isUpdating,
    fetchCategories,
    fetchSidebarSelection,
    saveSidebarSelection,
    fetchFeaturedSelection,
    saveFeaturedSelection,
  } = useCategoryAdmin();

  const [activeTab, setActiveTab] = useState('PRODUCT_CATEGORIES');
  const [search, setSearch] = useState('');

  // Local state for serial ordering
  const [orderedSidebarIds, setOrderedSidebarIds] = useState([]);
  const [orderedFeaturedIds, setOrderedFeaturedIds] = useState([]);

  useEffect(() => {
    fetchSidebarItems();
    fetchCategories({ page_size: 200 }); // Get all for selection
    fetchSidebarSelection();
    fetchFeaturedSelection();
  }, [
    fetchSidebarItems,
    fetchCategories,
    fetchSidebarSelection,
    fetchFeaturedSelection,
  ]);

  // Sync selection states when data arrives
  useEffect(() => {
    if (sidebarSelection.length > 0) {
      setOrderedSidebarIds(sidebarSelection.map(c => c.id));
    }
    if (featuredSelection.length > 0) {
      setOrderedFeaturedIds(featuredSelection.map(c => c.id));
    }
  }, [sidebarSelection, featuredSelection]);

  const handleDeleteCustom = async (id, title) => {
    if (
      confirm(`Are you sure you want to remove "${title}" from custom menus?`)
    ) {
      await deleteSidebarItem(id);
    }
  };

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

  const saveProductMapping = async type => {
    const success =
      type === 'SIDEBAR'
        ? await saveSidebarSelection(orderedSidebarIds)
        : await saveFeaturedSelection(orderedFeaturedIds);

    if (success) alert(`${type} configuration saved successfully.`);
  };

  const filteredCustomItems = sidebarItems.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()),
  );

  const categoryList = allCategories.results || [];

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl font-black text-[#1B1B1B] tracking-tighter uppercase leading-none">
            Navigation Manager
          </h1>
          <p className="text-[13px] text-[#6B6B5E] mt-3 font-medium">
            Configure how categories and custom menus appear across the public
            website.
          </p>
        </div>
        <div className="flex bg-gray-50 p-1 border border-gray-100">
          <button
            onClick={() => setActiveTab('PRODUCT_CATEGORIES')}
            className={`px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all ${activeTab === 'PRODUCT_CATEGORIES' ? 'bg-white text-[#1B1B1B] shadow-sm' : 'text-[#8A8A78] hover:text-[#1B1B1B]'}`}
          >
            Category Mapping
          </button>
          <button
            onClick={() => setActiveTab('CUSTOM_ITEMS')}
            className={`px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all ${activeTab === 'CUSTOM_ITEMS' ? 'bg-white text-[#1B1B1B] shadow-sm' : 'text-[#8A8A78] hover:text-[#1B1B1B]'}`}
          >
            Custom Menus
          </button>
        </div>
      </div>

      {activeTab === 'PRODUCT_CATEGORIES' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Sidebar Mapping Card */}
          <div className="bg-white border border-gray-100 p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiList className="text-[#3A5A40]" size={20} />
                <h3 className="text-lg font-black uppercase tracking-tight">
                  Main Sidebar Menu
                </h3>
              </div>
              <button
                onClick={() => saveProductMapping('SIDEBAR')}
                disabled={isUpdating}
                className="bg-[#3A5A40] text-white px-5 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all disabled:opacity-50"
              >
                <FiSave /> {isUpdating ? 'Saving...' : 'Save Order'}
              </button>
            </div>

            <p className="text-[11px] text-[#8A8A78] uppercase font-bold tracking-wider leading-relaxed">
              Select product categories to show in the left sidebar. The order
              of selection determines the display serial.
            </p>

            <div className="max-h-[500px] overflow-y-auto border border-gray-50 divide-y divide-gray-50 admin-scrollbar">
              {categoryList.map(cat => (
                <label
                  key={cat.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#3A5A40]"
                      checked={orderedSidebarIds.includes(cat.id)}
                      onChange={() => handleToggleSelection(cat.id, 'SIDEBAR')}
                    />
                    <span className="text-sm font-bold text-[#1B1B1B] uppercase tracking-tight">
                      {cat.name}
                    </span>
                  </div>
                  {orderedSidebarIds.includes(cat.id) && (
                    <span className="font-mono text-[10px] font-bold text-[#3A5A40] bg-[#E8F0EA] px-2 py-1">
                      SERIAL: {orderedSidebarIds.indexOf(cat.id) + 1}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Featured Mapping Card */}
          <div className="bg-white border border-gray-100 p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiStar className="text-[#F59E0B]" size={20} />
                <h3 className="text-lg font-black uppercase tracking-tight">
                  Home Featured
                </h3>
              </div>
              <button
                onClick={() => saveProductMapping('FEATURED')}
                disabled={isUpdating}
                className="bg-[#1B1B1B] text-white px-5 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-[#3A5A40] transition-all disabled:opacity-50"
              >
                <FiSave /> {isUpdating ? 'Saving...' : 'Save Order'}
              </button>
            </div>

            <p className="text-[11px] text-[#8A8A78] uppercase font-bold tracking-wider leading-relaxed">
              Select categories to feature on the homepage dashboard.
            </p>

            <div className="max-h-[500px] overflow-y-auto border border-gray-50 divide-y divide-gray-50 admin-scrollbar">
              {categoryList.map(cat => (
                <label
                  key={cat.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#1B1B1B]"
                      checked={orderedFeaturedIds.includes(cat.id)}
                      onChange={() => handleToggleSelection(cat.id, 'FEATURED')}
                    />
                    <span className="text-sm font-bold text-[#1B1B1B] uppercase tracking-tight">
                      {cat.name}
                    </span>
                  </div>
                  {orderedFeaturedIds.includes(cat.id) && (
                    <span className="font-mono text-[10px] font-bold text-white bg-[#1B1B1B] px-2 py-1">
                      SERIAL: {orderedFeaturedIds.indexOf(cat.id) + 1}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Custom Items Manager (Existing Logic) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-md w-full bg-white border border-gray-100 p-1">
              <div className="relative">
                <FiSearch
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A78]"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="SEARCH CUSTOM MENUS..."
                  className="w-full h-10 pl-10 pr-4 bg-transparent rounded-none text-sm font-mono focus:outline-none uppercase tracking-tight placeholder:text-gray-300"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <Link href="/admin/sidebar/new">
              <button className="bg-[#3A5A40] text-white px-8 py-3.5 rounded-none font-bold text-xs tracking-widest flex items-center gap-2 hover:bg-[#1B1B1B] transition-all cursor-pointer uppercase">
                <FiPlus size={18} /> Add Custom Item
              </button>
            </Link>
          </div>

          <div className="bg-white border border-gray-100 rounded-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[#1B1B1B] text-[11px] uppercase tracking-[0.2em] font-bold">
                    <th className="px-8 py-4 text-left border-r border-gray-100 w-20">
                      Icon
                    </th>
                    <th className="px-8 py-4 text-left border-r border-gray-100">
                      Title
                    </th>
                    <th className="px-8 py-4 text-left border-r border-gray-100">
                      System Reference
                    </th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customLoading ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-8 py-20 text-center font-mono text-xs animate-pulse"
                      >
                        FETCHING_CUSTOM_DATA...
                      </td>
                    </tr>
                  ) : filteredCustomItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-8 py-20 text-center flex flex-col items-center gap-4 text-[#8A8A78]"
                      >
                        <FiGrid size={40} />
                        <p className="font-mono text-sm font-bold uppercase">
                          No Custom Items Found
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomItems.map(item => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50/50 transition-colors duration-200"
                      >
                        <td className="px-8 py-4 border-r border-gray-100">
                          <div className="w-10 h-10 relative bg-white border border-gray-100 flex items-center justify-center">
                            <Image
                              src={
                                item.image_url ||
                                '/assets/images/placeholder.png'
                              }
                              alt={item.title}
                              fill
                              className="object-contain p-1"
                              unoptimized
                            />
                          </div>
                        </td>
                        <td className="px-8 py-6 border-r border-gray-100">
                          <span className="font-bold text-[#1B1B1B] text-sm uppercase tracking-tight">
                            {item.title}
                          </span>
                        </td>
                        <td className="px-8 py-6 border-r border-gray-100 font-mono text-[10px] text-[#8A8A78]">
                          CUSTOM_ID_{item.id}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/sidebar/edit/${item.id}`}>
                              <button className="w-9 h-9 border border-gray-200 flex items-center justify-center text-[#1B1B1B] hover:bg-[#3A5A40] hover:text-white transition-all cursor-pointer shadow-none">
                                <FiEdit2 size={14} />
                              </button>
                            </Link>
                            <button
                              onClick={() =>
                                handleDeleteCustom(item.id, item.title)
                              }
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
        </div>
      )}
    </div>
  );
}
