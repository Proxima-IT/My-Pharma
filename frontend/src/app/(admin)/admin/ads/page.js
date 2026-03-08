'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiImage,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
} from 'react-icons/fi';
import { useAdsAdmin } from '../../hooks/useAdsAdmin';

export default function AdminAdsListPage() {
  const { ads, loading, fetchAds, deleteAd } = useAdsAdmin();
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchAds({ page });
  }, [page, fetchAds]);

  const handleDelete = async id => {
    if (confirm(`Are you sure you want to delete this promotional banner?`)) {
      await deleteAd(id);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#1B1B1B] tracking-tighter uppercase">
            Promotional Banners
          </h1>
          <p className="text-[13px] text-[#6B6B5E] mt-1 font-medium">
            Manage the advertisement images shown on the website sidebar.
          </p>
        </div>
        <Link href="/admin/ads/new">
          <button className="bg-[#3A5A40] text-white px-8 py-3.5 rounded-none font-bold text-xs tracking-widest flex items-center gap-2 hover:bg-[#F59E0B] transition-all duration-300 cursor-pointer uppercase border border-transparent">
            <FiPlus size={18} /> Add New Banner
          </button>
        </Link>
      </div>

      {/* Ads Table */}
      <div className="bg-white border border-gray-100 rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[#1B1B1B] text-[11px] uppercase tracking-[0.2em] font-bold">
                <th className="px-8 py-4 text-left border-r border-gray-100 w-40">
                  Preview
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Target Link
                </th>
                <th className="px-8 py-4 text-center border-r border-gray-100">
                  Order
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Status
                </th>
                <th className="px-8 py-4 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && ads.results.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="font-mono text-sm animate-pulse text-[#3A5A40]">
                      LOADING_BANNERS...
                    </div>
                  </td>
                </tr>
              ) : ads.results.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-8 py-20 text-center flex flex-col items-center gap-4 text-[#8A8A78]"
                  >
                    <FiImage size={40} />
                    <p className="font-mono text-sm font-bold uppercase">
                      No Banners Found
                    </p>
                  </td>
                </tr>
              ) : (
                ads.results.map(ad => (
                  <tr
                    key={ad.id}
                    className="hover:bg-gray-50/50 transition-colors duration-200 group"
                  >
                    <td className="px-8 py-4 border-r border-gray-100">
                      <div className="w-32 h-20 relative bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                        <Image
                          src={ad.image_url || '/assets/images/applogo.png'}
                          alt="Banner"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-[#6B6B5E] max-w-xs truncate">
                        <FiExternalLink className="shrink-0" />
                        <span className="truncate">
                          {ad.link || 'No link set'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100 text-center">
                      <span className="font-mono text-sm font-bold text-[#1B1B1B]">
                        {ad.order}
                      </span>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100">
                      <span
                        className={`px-3 py-1 border font-mono text-[10px] font-bold uppercase tracking-tighter ${
                          ad.is_active
                            ? 'text-green-600 bg-green-50 border-green-100'
                            : 'text-red-600 bg-red-50 border-red-100'
                        }`}
                      >
                        {ad.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/ads/edit/${ad.id}`}>
                          <button className="w-9 h-9 border border-gray-200 flex items-center justify-center text-[#1B1B1B] hover:bg-[#3A5A40] hover:text-white transition-all duration-300 cursor-pointer">
                            <FiEdit2 size={14} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(ad.id)}
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
          Total Banners: <span className="text-[#1B1B1B]">{ads.count}</span>
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
            disabled={ads.results.length < 10 || loading}
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
