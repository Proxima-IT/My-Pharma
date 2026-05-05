'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
} from 'react-icons/fi';
import { useUserAdmin } from '../../hooks/useUserAdmin';
import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

export default function UserManagementPage() {
  const { users, loading, fetchUsers, deleteUser } = useUserAdmin();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('NORMAL');

  useEffect(() => {
    // Determine role filter based on active tab
    const roleFilter = activeTab === 'NORMAL' ? 'REGISTERED_USER' : '';
    fetchUsers({ page, search, role: roleFilter });
  }, [page, search, fetchUsers, activeTab]);

  const handleDelete = async (id, name) => {
    if (confirm(`Are you sure you want to remove access for ${name}?`)) {
      await deleteUser(id);
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_BASE_URL}/auth/admin/users/export-csv/`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Failed to export user data.');
    }
  };

  const getRoleStyle = role => {
    const styles = {
      SUPER_ADMIN: 'text-red-600 bg-red-50 border-red-100',
      PHARMACY_ADMIN: 'text-[#3A5A40] bg-[#E8F0EA] border-[#3A5A40]/20',
      DOCTOR: 'text-blue-600 bg-blue-50 border-blue-100',
      REGISTERED_USER: 'text-gray-600 bg-gray-50 border-gray-200',
    };
    return styles[role] || styles.REGISTERED_USER;
  };

  // Filter results for System Users tab to exclude REGISTERED_USER since we fetch all when role is empty
  const displayedUsers =
    activeTab === 'NORMAL'
      ? users.results
      : users.results.filter(u => u.role !== 'REGISTERED_USER');

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#1B1B1B] tracking-tight uppercase">
            Manage Accounts
          </h1>
          <p className="text-[13px] text-[#6B6B5E] mt-1 font-medium">
            Control who can access and manage the pharmacy system.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="bg-white text-black px-6 py-3.5 rounded-none font-bold text-xs tracking-widest flex items-center gap-2 hover:bg-gray-50 transition-all duration-300 cursor-pointer uppercase border border-gray-200"
          >
            <FiDownload size={18} /> Export CSV
          </button>
          <Link href="/admin/users/new">
            <button className="bg-[#3A5A40] text-white px-8 py-3.5 rounded-none font-bold text-xs tracking-widest flex items-center gap-2 hover:bg-[#F59E0B] transition-all duration-300 cursor-pointer uppercase border border-transparent">
              <FiPlus size={18} /> Add New User
            </button>
          </Link>
        </div>
      </div>

      {/* Tabs and Search Bar Row */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Tabs Selection */}
        <div className="flex bg-gray-50 p-1 border border-gray-100 rounded-none">
          <button
            onClick={() => {
              setActiveTab('NORMAL');
              setPage(1);
            }}
            className={`px-6 py-2 text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer rounded-none ${activeTab === 'NORMAL' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'}`}
          >
            Normal Users
          </button>
          <button
            onClick={() => {
              setActiveTab('SYSTEM');
              setPage(1);
            }}
            className={`px-6 py-2 text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer rounded-none ${activeTab === 'SYSTEM' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'}`}
          >
            System Users
          </button>
        </div>

        {/* Search Bar */}
        <div className="max-w-md w-full bg-white border border-gray-100 p-1">
          <div className="relative">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A78]"
              size={16}
            />
            <input
              type="text"
              placeholder="SEARCH BY NAME OR EMAIL..."
              className="w-full h-10 pl-10 pr-4 bg-transparent rounded-none text-sm font-mono focus:outline-none uppercase tracking-tight placeholder:text-gray-300"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white border border-gray-100 rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[#1B1B1B] text-[11px] uppercase tracking-[0.2em] font-bold">
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  User Details
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Access Level
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Status
                </th>
                <th className="px-8 py-4 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && displayedUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="font-mono text-sm animate-pulse text-[#3A5A40]">
                      SYNCING DATABASE...
                    </div>
                  </td>
                </tr>
              ) : displayedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-8 py-20 text-center flex flex-col items-center gap-4 text-[#8A8A78]"
                  >
                    <FiUser size={40} />
                    <p className="font-mono text-sm font-bold uppercase">
                      No Users Found
                    </p>
                  </td>
                </tr>
              ) : (
                displayedUsers.map(user => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/50 transition-colors duration-200 group"
                  >
                    <td className="px-8 py-6 border-r border-gray-100">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1B1B1B] text-sm uppercase">
                          {user.username}
                        </span>
                        <span className="font-mono text-[10px] text-[#8A8A78]">
                          {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100">
                      <span
                        className={`px-3 py-1 border font-mono text-[9px] font-bold uppercase tracking-tighter ${getRoleStyle(user.role)}`}
                      >
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100">
                      <span
                        className={`px-3 py-1 border font-mono text-[10px] font-bold uppercase ${user.is_active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}
                      >
                        {user.is_active ? 'ACTIVE' : 'LOCKED'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/users/edit/${user.id}`}>
                          <button className="w-9 h-9 border border-gray-200 flex items-center justify-center text-[#1B1B1B] hover:bg-[#3A5A40] hover:text-white transition-all duration-300 cursor-pointer shadow-none">
                            <FiEdit2 size={14} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(user.id, user.username)}
                          className="w-9 h-9 border border-gray-200 flex items-center justify-center text-[#1B1B1B] hover:bg-red-600 hover:text-white transition-all duration-300 cursor-pointer shadow-none"
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

      {/* Simple Pagination */}
      <div className="flex items-center justify-between px-2">
        <p className="font-mono text-[11px] font-bold text-[#8A8A78] uppercase">
          Total Records: <span className="text-[#1B1B1B]">{users.count}</span>
        </p>
        <div className="flex items-center gap-0 border border-gray-200 bg-white shadow-none">
          <button
            disabled={page === 1 || loading}
            onClick={() => setPage(p => p - 1)}
            className="w-10 h-10 flex items-center justify-center border-r border-gray-200 hover:bg-gray-50 disabled:opacity-20 cursor-pointer rounded-none"
          >
            <FiChevronLeft size={18} />
          </button>
          <div className="px-4 font-mono text-xs font-bold text-[#1B1B1B] flex items-center h-10">
            PAGE {page}
          </div>
          <button
            disabled={users.results.length < 10 || loading}
            onClick={() => setPage(p => p + 1)}
            className="w-10 h-10 flex items-center justify-center border-l border-gray-200 hover:bg-gray-50 disabled:opacity-20 cursor-pointer rounded-none"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
