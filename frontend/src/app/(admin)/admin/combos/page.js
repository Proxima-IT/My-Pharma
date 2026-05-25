'use client';

import React from 'react';
import Link from 'next/link';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiPackage,
  FiExternalLink,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import { useComboAdmin } from '@/app/(admin)/hooks/useComboAdmin';
import Image from 'next/image';

/**
 * Super Admin - Combo Management List
 * Design: Minimalist Sharp, border-gray-100, rounded-none, shadow-none.
 */
export default function ComboListPage() {
  const { combos, loading, error, deleteCombo } = useComboAdmin();

  const getEffectiveCartPrice = combo =>
    combo.discount_price ?? combo.custom_price ?? null;

  const handleDelete = async (id, title) => {
    if (
      window.confirm(`Are you sure you want to delete the combo: "${title}"?`)
    ) {
      try {
        await deleteCombo(id);
      } catch (err) {
        alert('Failed to delete combo');
      }
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-black text-[#1B1B1B] tracking-tighter uppercase leading-none">
            Combo Management
          </h1>
          <p className="text-[13px] text-[#6B6B5E] mt-2 font-medium">
            Manage product bundles, promotional kits, and health packages.
          </p>
        </div>
        <Link
          href="/admin/combos/new"
          className="h-12 px-6 bg-[#3A5A40] text-white font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-[#1B1B1B] transition-all rounded-none"
        >
          <FiPlus size={16} /> Create New Combo
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 font-mono text-xs uppercase">
          Error: {error}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-gray-100 p-6 bg-white">
          <span className="block font-mono text-[10px] font-bold text-[#8A8A78] uppercase tracking-widest mb-1">
            Total Bundles
          </span>
          <span className="text-3xl font-black text-[#1B1B1B] font-mono">
            {combos.count}
          </span>
        </div>
        <div className="border border-gray-100 p-6 bg-white">
          <span className="block font-mono text-[10px] font-bold text-[#8A8A78] uppercase tracking-widest mb-1">
            Active Offers
          </span>
          <span className="text-3xl font-black text-[#3A5A40] font-mono">
            {combos.results.filter(c => c.is_active).length}
          </span>
        </div>
        <div className="border border-gray-100 p-6 bg-[#F1F1E6]">
          <span className="block font-mono text-[10px] font-bold text-[#8A8A78] uppercase tracking-widest mb-1">
            System Status
          </span>
          <span className="text-sm font-bold text-[#1B1B1B] uppercase tracking-tight">
            Operational
          </span>
        </div>
      </div>

      {/* Combo Table */}
      <div className="border border-gray-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-5 font-mono text-[10px] font-black text-[#8A8A78] uppercase tracking-widest">
                  Preview
                </th>
                <th className="p-5 font-mono text-[10px] font-black text-[#8A8A78] uppercase tracking-widest">
                  Combo Details
                </th>
                <th className="p-5 font-mono text-[10px] font-black text-[#8A8A78] uppercase tracking-widest text-right">
                  Pricing
                </th>
                <th className="p-5 font-mono text-[10px] font-black text-[#8A8A78] uppercase tracking-widest text-center">
                  Order
                </th>
                <th className="p-5 font-mono text-[10px] font-black text-[#8A8A78] uppercase tracking-widest text-center">
                  Status
                </th>
                <th className="p-5 font-mono text-[10px] font-black text-[#8A8A78] uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && combos.results.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="p-20 text-center font-mono text-xs text-gray-400 uppercase tracking-widest"
                  >
                    Loading Combo Data...
                  </td>
                </tr>
              ) : combos.results.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="p-20 text-center font-mono text-xs text-gray-400 uppercase tracking-widest"
                  >
                    No Combos Found
                  </td>
                </tr>
              ) : (
                combos.results.map(combo => (
                  <tr
                    key={combo.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="p-5 w-24">
                      <div className="w-16 h-16 bg-gray-50 border border-gray-100 relative overflow-hidden">
                        {combo.image_url ? (
                          <Image
                            src={combo.image_url}
                            alt={combo.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <FiPackage
                            className="absolute inset-0 m-auto text-gray-200"
                            size={24}
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#1B1B1B] uppercase tracking-tight">
                          {combo.title}
                        </span>
                        <span className="text-[11px] text-[#8A8A78] line-clamp-1 mt-1">
                          {combo.description || 'No description provided'}
                        </span>
                        {combo.link && (
                          <a
                            href={combo.link}
                            target="_blank"
                            className="text-[9px] text-[#3A5A40] font-mono mt-1 flex items-center gap-1 hover:underline"
                          >
                            <FiExternalLink size={10} /> {combo.link}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-5 text-right font-mono">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[9px] text-[#8A8A78] uppercase tracking-widest">
                          Display: ৳{combo.price}
                        </span>
                        {combo.original_price && (
                          <span className="text-[10px] text-red-400 line-through">
                            ৳{combo.original_price}
                          </span>
                        )}
                        {getEffectiveCartPrice(combo) != null ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 border border-emerald-100 mt-1">
                            CART: ৳{getEffectiveCartPrice(combo)}
                          </span>
                        ) : (
                          <span className="text-[9px] text-[#8A8A78] mt-1 uppercase tracking-widest">
                            Cart: sum products
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-5 text-center font-mono text-xs text-[#1B1B1B]">
                      {combo.order}
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex justify-center">
                        {combo.is_active ? (
                          <span className="px-2 py-1 bg-green-50 text-green-700 font-mono text-[9px] font-bold uppercase border border-green-100 flex items-center gap-1">
                            <FiEye size={10} /> Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-50 text-gray-400 font-mono text-[9px] font-bold uppercase border border-gray-100 flex items-center gap-1">
                            <FiEyeOff size={10} /> Hidden
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/combos/edit/${combo.id}`}
                          className="p-2 text-[#1B1B1B] hover:bg-[#E8F0EA] hover:text-[#3A5A40] transition-all border border-transparent hover:border-gray-100"
                          title="Edit Combo"
                        >
                          <FiEdit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(combo.id, combo.title)}
                          className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 cursor-pointer"
                          title="Delete Combo"
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

      {/* Technical Metadata Footer */}
      <div className="flex items-center justify-between font-mono text-[9px] text-[#8A8A78] uppercase tracking-widest pt-4">
        <div className="flex items-center gap-4">
          <span>Sync Status: Real-time</span>
          <span>Database: Combos v1</span>
        </div>
        <div>Last Updated: {new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  );
}
