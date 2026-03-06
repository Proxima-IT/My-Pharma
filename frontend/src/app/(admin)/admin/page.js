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
} from 'react-icons/fi';
import Link from 'next/link';

export default function AdminDashboardPage() {
  // Mock Stats for Super Admin Overview
  const stats = [
    {
      label: 'TOTAL_USERS',
      value: '1,240',
      change: '+12%',
      icon: <FiUsers />,
      color: 'text-blue-600',
    },
    {
      label: 'PHARMACY_PARTNERS',
      value: '86',
      change: '+4',
      icon: <FiDatabase />,
      color: 'text-[#3A5A40]',
    },
    {
      label: 'SYSTEM_REVENUE',
      value: '৳ 1,45,230',
      change: '+18%',
      icon: <FiShoppingBag />,
      color: 'text-amber-600',
    },
    {
      label: 'ACTIVE_DOCTORS',
      value: '42',
      change: '+2',
      icon: <FiShield />,
      color: 'text-purple-600',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      event: 'New Pharmacy Registered',
      target: 'Lazz Pharma Ltd.',
      time: '2 mins ago',
      type: 'REG',
    },
    {
      id: 2,
      event: 'System Update Deployed',
      target: 'v1.0.4-stable',
      time: '45 mins ago',
      type: 'SYS',
    },
    {
      id: 3,
      event: 'High Value Order',
      target: 'ORD-99283 (৳ 12,400)',
      time: '1 hour ago',
      type: 'TRX',
    },
    {
      id: 4,
      event: 'User Role Escalated',
      target: 'admin_rahat',
      time: '3 hours ago',
      type: 'SEC',
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
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#E8F0EA] border border-[#3A5A40]/20 text-[#3A5A40] font-mono text-[10px] font-bold uppercase">
            <div className="w-1.5 h-1.5 bg-[#3A5A40] animate-pulse" />
            Live_Status: Operational
          </div>
        </div>
      </div>

      {/* 2. Light Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-100 p-6 flex flex-col gap-4 hover:border-[#3A5A40] transition-colors group"
          >
            <div className="flex justify-between items-start">
              <div className={`text-xl ${stat.color} p-2 bg-gray-50`}>
                {stat.icon}
              </div>
              <span className="font-mono text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5">
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
              <FiActivity className="text-[#3A5A40]" /> Recent_Activity_Log
            </h2>
            <button className="text-[10px] font-bold text-[#3A5A40] hover:underline uppercase tracking-tighter">
              View_All_Logs
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity.map(item => (
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
            ))}
          </div>
        </div>

        {/* Quick Actions & System Health */}
        <div className="space-y-6">
          <div className="bg-white p-6 flex flex-col gap-6 border border-gray-100">
            {/* REMOVED THE VERTICAL BAR (|) HERE */}
            <h3 className="text-[#1B1B1B] text-xs font-bold uppercase tracking-widest">
              Quick_Actions
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
              Resource_Usage
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[10px] font-bold uppercase">
                  <span>Database_Load</span>
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
                  <span>Server_Storage</span>
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
