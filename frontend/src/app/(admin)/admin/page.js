'use client';

import React from 'react';
import {
  FiUsers,
  FiActivity,
  FiShoppingBag,
  FiPlus,
  FiArrowUpRight,
  FiDatabase,
  FiShield,
  FiRefreshCw,
  FiFileText,
} from 'react-icons/fi';
import Link from 'next/link';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { useAdminContext } from '../context/AdminContext';

export default function AdminDashboardPage() {
  const { stats, recentActivity, isLoading, error, refetch } =
    useAdminDashboard();

  // 🟢 ARCHITECT FIX: Consume global unseen order count and loading state from the AdminContext bus.
  // Using isLoadingCounts ensures this specific card is decoupled from the general dashboard data fetcher.
  const { unseenOrderCount, unseenPrescriptionCount, isLoadingCounts } =
    useAdminContext();

  // Dynamic stats based on API data
  const dynamicStats = [
    {
      label: 'NEW ORDERS',
      value: isLoadingCounts ? '...' : unseenOrderCount.toString(),
      change: unseenOrderCount > 0 ? 'ACTION REQ' : 'CLEAN',
      icon: <FiShoppingBag />,
      color: unseenOrderCount > 0 ? 'text-red-600' : 'text-[#3A5A40]',
      isAlert: unseenOrderCount > 0,
    },
    {
      label: 'NEW PRESCRIPTIONS',
      value: isLoadingCounts ? '...' : unseenPrescriptionCount.toString(),
      change: unseenPrescriptionCount > 0 ? 'ACTION REQ' : 'CLEAN',
      icon: <FiFileText />,
      color: unseenPrescriptionCount > 0 ? 'text-red-600' : 'text-[#3A5A40]',
      isAlert: unseenPrescriptionCount > 0,
    },
    {
      label: 'TOTAL USERS',
      value: isLoading ? '...' : stats.totalUsers.toLocaleString(),
      change: '+12%',
      icon: <FiUsers />,
      color: 'text-blue-600',
    },
    {
      label: 'PHARMACY PARTNERS',
      value: isLoading ? '...' : stats.pharmacyPartners.toString(),
      change: '+4',
      icon: <FiDatabase />,
      color: 'text-[#3A5A40]',
    },
    {
      label: 'SYSTEM REVENUE',
      value: isLoading ? '...' : `৳ ${stats.systemRevenue.toLocaleString()}`,
      change: '+18%',
      icon: <FiShoppingBag />,
      color: 'text-amber-600',
    },
    {
      label: 'ACTIVE DOCTORS',
      value: isLoading ? '...' : stats.activeDoctors.toString(),
      change: '+2',
      icon: <FiShield />,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500">
      {/* 1. Minimal Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1B1B1B] tracking-tight uppercase">
            System Overview
          </h1>
          <p className="text-[13px] text-[#6B6B5E] mt-1 font-medium">
            Global monitoring and administrative control panel.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 border font-mono text-[10px] font-bold uppercase ${
              error
                ? 'bg-red-50 border-red-200 text-red-600'
                : isLoading
                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                  : 'bg-[#E8F0EA] border-[#3A5A40]/20 text-[#3A5A40]'
            }`}
          >
            <div
              className={`w-1.5 h-1.5 ${
                error
                  ? 'bg-red-500'
                  : isLoading
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-[#3A5A40] animate-pulse'
              }`}
            />
            {error
              ? 'Error'
              : isLoading
                ? 'Loading...'
                : 'Live Status: Operational'}
          </div>
        </div>
      </div>

      {/* 2. Light Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dynamicStats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-100 p-6 flex flex-col gap-4 hover:border-[#3A5A40] transition-colors group"
          >
            <div className="flex justify-between items-start">
              <div className={`text-xl ${stat.color} p-2 bg-gray-50`}>
                {stat.icon}
              </div>
              <span
                className={`font-mono text-[10px] font-bold px-1.5 py-0.5 ${stat.isAlert ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}
              >
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#8A8A78] uppercase tracking-widest">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-[#1B1B1B] mt-1 font-mono tracking-tighter">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent System Activity */}
        <div className="lg:col-span-2 bg-white border border-gray-100 flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-xs font-bold text-[#1B1B1B] uppercase tracking-widest flex items-center gap-2">
              <FiActivity className="text-[#3A5A40]" /> Recent Activity Log
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={refetch}
                disabled={isLoading}
                className="text-[10px] font-bold text-[#3A5A40] hover:underline uppercase tracking-tighter disabled:opacity-50 flex items-center gap-1"
              >
                <FiRefreshCw
                  className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`}
                />
                Refresh
              </button>
              <button className="text-[10px] font-bold text-[#3A5A40] hover:underline uppercase tracking-tighter">
                View All Logs
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {isLoading ? (
              <div className="px-6 py-8 text-center">
                <div className="inline-flex items-center gap-2 text-[#8A8A78] text-sm">
                  <FiRefreshCw className="w-4 h-4 animate-spin" />
                  Loading activity data...
                </div>
              </div>
            ) : error ? (
              <div className="px-6 py-8 text-center">
                <p className="text-red-600 text-sm font-medium">
                  Error loading activity: {error}
                </p>
                <button
                  onClick={refetch}
                  className="mt-2 text-[10px] font-bold text-[#3A5A40] hover:underline uppercase tracking-tighter"
                >
                  Try Again
                </button>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-[#8A8A78] text-sm">No recent activity</p>
              </div>
            ) : (
              recentActivity.map(item => (
                <div
                  key={item.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[9px] font-bold bg-[#F1F1E6] border border-gray-200 px-2 py-1 text-[#6B6B5E]">
                      {item.type}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[#1B1B1B] uppercase tracking-tight">
                        {item.event}
                      </p>
                      <p className="text-[11px] text-[#8A8A78] font-medium">
                        {item.target}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-[#B7B7A4]">
                    {item.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions & System Health */}
        <div className="space-y-6">
          <div className="bg-white p-6 flex flex-col gap-6 border border-gray-100">
            {/* REMOVED THE VERTICAL BAR (|) HERE */}
            <h3 className="text-[#1B1B1B] text-xs font-bold uppercase tracking-widest">
              Quick Actions
            </h3>
            <div className="flex flex-col gap-2">
              <Link
                href="/admin/users/new"
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-[#E8F0EA] text-[#1B1B1B] transition-all group border border-transparent hover:border-[#3A5A40]/20"
              >
                <span className="text-[11px] font-bold uppercase tracking-wide">
                  Provision New User
                </span>
                <FiPlus className="group-hover:rotate-90 transition-transform text-[#3A5A40]" />
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-[#E8F0EA] text-[#1B1B1B] transition-all group border border-transparent hover:border-[#3A5A40]/20"
              >
                <span className="text-[11px] font-bold uppercase tracking-wide">
                  Global Config
                </span>
                <FiArrowUpRight className="text-[#3A5A40]" />
              </Link>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-6 space-y-4">
            <h3 className="text-[11px] font-bold text-[#8A8A78] uppercase tracking-widest">
              Resource Usage
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[10px] font-bold uppercase">
                  <span>Database Load</span>
                  <span>24%</span>
                </div>
                <div className="w-full h-1 bg-gray-100">
                  <div
                    className="h-full bg-[#3A5A40]"
                    style={{ width: '24%' }}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[10px] font-bold uppercase">
                  <span>Server Storage</span>
                  <span>68%</span>
                </div>
                <div className="w-full h-1 bg-gray-100">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: '68%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
