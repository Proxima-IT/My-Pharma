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
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { useSidebarAdmin } from '../../hooks/useSidebarAdmin';

export default function AdminSidebarManagementPage() {
  const { sidebarItems, loading, fetchSidebarItems, deleteSidebarItem } =
    useSidebarAdmin();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSidebarItems();
  }, [fetchSidebarItems]);

  const handleDelete = async (id, title) => {
    if (
      confirm(`Are you sure you want to remove "${title}" from the sidebar?`)
    ) {
      await deleteSidebarItem(id);
    }
  };

  // Filter items based on search input
  const filteredItems = sidebarItems.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#1B1B1B] tracking-tighter uppercase">
            Sidebar Menu
          </h1>
          <p className="text-[13px] text-[#6B6B5E] mt-1 font-medium">
            Manage the categories and icons shown on the main website&apos;s side
            menu.
          </p>
        </div>
        <Link href="/admin/sidebar/new">
          <button className="bg-[#3A5A40] text-white px-8 py-3.5 rounded-none font-bold text-xs tracking-widest flex items-center gap-2 hover:bg-[#F59E0B] transition-all duration-300 cursor-pointer uppercase border border-transparent">
            <FiPlus size={18} /> Add New Menu
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
            placeholder="SEARCH MENU BY TITLE..."
            className="w-full h-10 pl-10 pr-4 bg-transparent rounded-none text-sm font-mono focus:outline-none uppercase tracking-tight placeholder:text-gray-300 text-[#1B1B1B]"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Management Table */}
      <div className="bg-white border border-gray-100 rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[#1B1B1B] text-[11px] uppercase tracking-[0.2em] font-bold">
                <th className="px-8 py-4 text-left border-r border-gray-100 w-20">
                  Icon
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Menu Title
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  System ID
                </th>
                <th className="px-8 py-4 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && sidebarItems.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="font-mono text-sm animate-pulse text-[#3A5A40]">
                      LOADING_SIDEBAR_DATA...
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-8 py-20 text-center flex flex-col items-center gap-4 text-[#8A8A78]"
                  >
                    <FiGrid size={40} />
                    <p className="font-mono text-sm font-bold uppercase">
                      No Menu Items Found
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 transition-colors duration-200 group"
                  >
                    <td className="px-8 py-4 border-r border-gray-100">
                      <div className="w-10 h-10 relative bg-gray-50 border border-gray-100 flex items-center justify-center p-1">
                        <Image
                          src={item.image_url || '/assets/images/applogo.png'}
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
                    <td className="px-8 py-6 border-r border-gray-100">
                      <span className="font-mono text-[11px] font-bold text-[#8A8A78]">
                        #SID_{item.id}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/sidebar/edit/${item.id}`}>
                          <button className="w-9 h-9 border border-gray-200 flex items-center justify-center text-[#1B1B1B] hover:bg-[#3A5A40] hover:text-white transition-all duration-300 cursor-pointer">
                            <FiEdit2 size={14} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
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

      {/* Footer Info */}
      <div className="px-2">
        <p className="font-mono text-[10px] font-bold text-[#8A8A78] uppercase">
          Total Active Menus:{' '}
          <span className="text-[#1B1B1B]">{filteredItems.length}</span>
        </p>
      </div>
    </div>
  );
}
