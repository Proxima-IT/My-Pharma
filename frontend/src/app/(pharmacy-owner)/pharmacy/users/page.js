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
} from 'react-icons/fi';
import { useUserAdmin } from '../../hooks/useUserAdmin';

export default function UserManagementPage() {
  const { users, loading, fetchUsers, deleteUser } = useUserAdmin();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchUsers({ page, search });
  }, [page, search, fetchUsers]);

  const handleDelete = async (id, name) => {
    if (confirm(`Are you sure you want to remove access for ${name}?`)) {
      await deleteUser(id);
    }
  };

  const getRoleBadge = role => {
    const styles = {
      SUPER_ADMIN: 'bg-red-50 text-red-700 border-red-200',
      PHARMACY_ADMIN:
        'bg-green-50 text-(--color-admin-primary) border-(--color-admin-primary)',
      DOCTOR: 'bg-blue-50 text-blue-700 border-blue-200',
      REGISTERED_USER: 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return styles[role] || styles.REGISTERED_USER;
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20 bg-(--color-admin-bg)">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-(--color-admin-border) pb-6">
        <div>
          <span className="font-mono text-xs font-bold text-(--color-admin-primary) uppercase tracking-widest">
            System / Accounts / Access Control
          </span>
          <h1 className="text-4xl font-black text-(--color-admin-navy) tracking-tighter uppercase">
            Manage Accounts
          </h1>
          <p className="font-mono text-[11px] text-(--color-text-secondary) mt-2 uppercase">
            Control who can access the pharmacy system
          </p>
        </div>
        <Link href="/pharmacy/users/new">
          <button className="bg-(--color-admin-primary) text-white px-8 py-3.5 rounded-none font-bold text-xs tracking-widest flex items-center gap-2 hover:bg-(--color-admin-accent) transition-all duration-300 cursor-pointer uppercase border border-(--color-admin-border)">
            <FiPlus size={18} /> ADD NEW USER
          </button>
        </Link>
      </div>

      <div className="max-w-md bg-(--color-admin-card) border border-(--color-admin-border) p-1">
        <div className="relative">
          <FiSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-(--color-text-secondary)"
            size={16}
          />
          <input
            type="text"
            placeholder="SEARCH BY NAME OR EMAIL..."
            className="w-full h-10 pl-10 pr-4 bg-transparent rounded-none text-sm font-mono focus:outline-none uppercase tracking-tight"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-(--color-admin-card) border border-(--color-admin-border) rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-(--color-admin-navy) text-white text-[11px] uppercase tracking-[0.2em] font-bold">
                <th className="px-8 py-4 text-left border-r border-white/10">
                  USER DETAILS
                </th>
                <th className="px-8 py-4 text-left border-r border-white/10">
                  ACCESS LEVEL
                </th>
                <th className="px-8 py-4 text-left border-r border-white/10">
                  STATUS
                </th>
                <th className="px-8 py-4 text-right">OPTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-admin-border)">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-8 py-20 text-center font-mono text-sm animate-pulse"
                  >
                    SYNCING_USER_DATABASE...
                  </td>
                </tr>
              ) : users.results.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-8 py-20 text-center flex flex-col items-center gap-4 text-(--color-text-secondary)"
                  >
                    <FiUser size={40} />
                    <p className="font-mono text-sm font-bold uppercase">
                      No Users Found
                    </p>
                  </td>
                </tr>
              ) : (
                users.results.map(user => (
                  <tr
                    key={user.id}
                    className="hover:bg-white transition-colors duration-200 group"
                  >
                    <td className="px-8 py-6 border-r border-(--color-admin-border)">
                      <div className="flex flex-col">
                        <span className="font-bold text-(--color-admin-navy) text-sm uppercase">
                          {user.username}
                        </span>
                        <span className="font-mono text-[10px] text-(--color-text-secondary)">
                          {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 border-r border-(--color-admin-border)">
                      <span
                        className={`px-3 py-1 border font-mono text-[9px] font-bold uppercase tracking-tighter ${getRoleBadge(user.role)}`}
                      >
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6 border-r border-(--color-admin-border)">
                      <span
                        className={`px-3 py-1 border font-mono text-[10px] font-bold uppercase ${user.is_active ? 'bg-green-50 text-(--color-admin-success) border-(--color-admin-success)' : 'bg-red-50 text-(--color-admin-error) border-(--color-admin-error)'}`}
                      >
                        {user.is_active ? 'ACTIVE' : 'LOCKED'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/pharmacy/users/edit/${user.id}`}>
                          <button className="w-10 h-10 border border-(--color-admin-border) flex items-center justify-center text-(--color-admin-navy) hover:bg-(--color-admin-accent) hover:text-white transition-all duration-300">
                            <FiEdit2 size={16} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(user.id, user.username)}
                          className="w-10 h-10 border border-(--color-admin-border) flex items-center justify-center text-(--color-admin-navy) hover:bg-(--color-admin-error) hover:text-white transition-all duration-300"
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
    </div>
  );
}
