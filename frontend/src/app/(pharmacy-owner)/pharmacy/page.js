'use client';

import React from 'react';
import {
  FiShoppingBag,
  FiBox,
  FiTrendingUp,
  FiUsers,
  FiPlus,
  FiArrowRight,
} from 'react-icons/fi';
import Link from 'next/link';

export default function PharmacyDashboardPage() {
  const stats = [
    {
      label: 'TOTAL_ORDERS',
      value: '124',
      icon: <FiShoppingBag />,
      id: 'ST-ORD',
    },
    {
      label: 'TOTAL_REVENUE',
      value: '৳ 45,230',
      icon: <FiTrendingUp />,
      id: 'ST-REV',
    },
    {
      label: 'ACTIVE_PRODUCTS',
      value: '856',
      icon: <FiBox />,
      id: 'ST-PRD',
    },
    {
      label: 'TOTAL_CUSTOMERS',
      value: '1.2k',
      icon: <FiUsers />,
      id: 'ST-CST',
    },
  ];

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 bg-(--color-admin-bg) min-h-screen">
      {/* 1. Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-(--color-admin-border) pb-6">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs font-bold text-(--color-admin-primary) uppercase tracking-widest">
            System / Dashboard / Overview
          </span>
          <h1 className="text-4xl font-black text-(--color-admin-navy) tracking-tighter uppercase">
            Pharmacy Overview
          </h1>
        </div>
        <div className="font-mono text-sm bg-(--color-admin-navy) text-white px-4 py-2">
          SESSION_ACTIVE: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-0 border border-(--color-admin-border) bg-(--color-admin-border)">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-(--color-admin-card) p-8 flex flex-col gap-6 border-r border-(--color-admin-border) last:border-r-0 transition-colors hover:bg-white"
          >
            <div className="flex justify-between items-start">
              <div className="text-2xl text-(--color-admin-primary) border border-(--color-admin-border) p-2 bg-white">
                {stat.icon}
              </div>
              <span className="font-mono text-[10px] font-bold text-(--color-text-secondary)">
                {stat.id}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-(--color-text-secondary) uppercase tracking-[0.2em]">
                {stat.label}
              </p>
              <h3 className="text-4xl font-bold text-(--color-admin-navy) mt-2 font-mono tracking-tighter">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Orders Preview */}
        <div className="lg:col-span-2 bg-(--color-admin-card) border border-(--color-admin-border) p-0 space-y-0">
          <div className="flex justify-between items-center p-6 border-b border-(--color-admin-border) bg-(--color-admin-bg)">
            <h2 className="text-xl font-black text-(--color-admin-navy) uppercase tracking-tight">
              Recent Orders
            </h2>
            <Link
              href="/pharmacy/orders"
              className="text-xs font-bold bg-(--color-admin-primary) text-white px-4 py-2 hover:bg-(--color-admin-accent) transition-all duration-300 flex items-center gap-2"
            >
              VIEW_ALL_RECORDS <FiArrowRight />
            </Link>
          </div>

          <div className="divide-y divide-(--color-admin-border)">
            {[1, 2, 3, 4].map(order => (
              <div
                key={order}
                className="flex items-center justify-between p-6 hover:bg-white transition-colors group"
              >
                <div className="flex items-center gap-6">
                  <div className="font-mono text-sm font-bold bg-(--color-admin-bg) border border-(--color-admin-border) px-3 py-1 group-hover:bg-(--color-admin-accent) group-hover:text-white transition-all duration-300">
                    #{3950 + order}
                  </div>
                  <div>
                    <p className="font-bold text-(--color-admin-navy) text-sm uppercase tracking-tight">
                      Customer Name
                    </p>
                    <p className="font-mono text-[11px] text-(--color-text-secondary) uppercase">
                      2 mins ago • 3 Items • TXN_ID: 99283
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-bold text-(--color-admin-navy)">
                    ৳ 1,240.00
                  </span>
                  <span className="px-3 py-1 bg-(--color-admin-navy) text-white text-[10px] font-bold uppercase">
                    Pending
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-8">
          <h2 className="text-xl font-black text-(--color-admin-navy) uppercase tracking-tight border-l-4 border-(--color-admin-primary) pl-4">
            Quick Actions
          </h2>

          <Link href="/pharmacy/products/new" className="block group">
            <div className="bg-(--color-admin-primary) text-white p-8 flex flex-col gap-6 border border-(--color-admin-border) group-hover:bg-(--color-admin-accent) transition-all duration-300">
              <div className="w-12 h-12 border border-white flex items-center justify-center text-2xl">
                <FiPlus strokeWidth={3} />
              </div>
              <div>
                <h3 className="text-xl font-bold uppercase tracking-tight">
                  Add New Product
                </h3>
                <p className="text-white/80 text-xs mt-2 leading-relaxed font-medium uppercase tracking-wide">
                  Initialize new entry in medicine database.
                </p>
              </div>
            </div>
          </Link>

          <div className="bg-(--color-admin-card) border border-(--color-admin-border) p-8 space-y-6">
            <div className="flex items-center gap-2 text-(--color-admin-error)">
              <div className="w-2 h-2 bg-(--color-admin-error) animate-pulse" />
              <h3 className="font-bold uppercase text-sm tracking-widest">
                Inventory Alert
              </h3>
            </div>
            <p className="text-sm text-(--color-text-secondary) leading-relaxed font-medium">
              CRITICAL:{' '}
              <span className="text-(--color-admin-navy) font-bold font-mono text-lg">
                12
              </span>{' '}
              products are below minimum stock threshold.
            </p>
            <Link href="/pharmacy/products?filter=low-stock" className="block">
              <button className="w-full py-4 border border-(--color-admin-border) text-xs font-bold text-(--color-admin-navy) hover:bg-(--color-admin-accent) hover:text-white hover:border-(--color-admin-accent) transition-all duration-300 cursor-pointer uppercase tracking-[0.2em]">
                Review Inventory
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
