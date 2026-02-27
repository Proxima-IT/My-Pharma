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
  // Mock stats for the initial delivery
  const stats = [
    {
      label: 'Total Orders',
      value: '124',
      icon: <FiShoppingBag />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Revenue',
      value: '৳ 45,230',
      icon: <FiTrendingUp />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Active Products',
      value: '856',
      icon: <FiBox />,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Total Customers',
      value: '1.2k',
      icon: <FiUsers />,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      {/* 1. Welcome Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Pharmacy Overview
        </h1>
        <p className="text-gray-500 font-medium">
          Welcome back! Here is what is happening with your store today.
        </p>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-100 rounded-[32px] p-8 flex flex-col gap-4 transition-all hover:border-(--color-primary-100)"
          >
            <div
              className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center text-2xl`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                {stat.label}
              </p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Preview */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[32px] p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <Link
              href="/pharmacy/orders"
              className="text-sm font-bold text-(--color-primary-500) hover:underline flex items-center gap-1"
            >
              View All <FiArrowRight />
            </Link>
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map(order => (
              <div
                key={order}
                className="flex items-center justify-between p-4 rounded-[24px] border border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs">
                    #{3950 + order}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      Customer Name
                    </p>
                    <p className="text-xs text-gray-400 font-medium">
                      2 mins ago • 3 Items
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase border border-amber-100">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 px-2">
            Quick Actions
          </h2>

          <Link href="/pharmacy/products/new" className="block">
            <div className="bg-(--color-primary-500) text-white rounded-[32px] p-8 flex flex-col gap-4 hover:bg-(--color-primary-600) transition-all group">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                <FiPlus strokeWidth={3} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Add New Product</h3>
                <p className="text-white/70 text-sm mt-1">
                  List a new medicine or healthcare item in your store.
                </p>
              </div>
            </div>
          </Link>

          <div className="bg-white border border-gray-100 rounded-[32px] p-8 space-y-4">
            <h3 className="font-bold text-gray-900">Inventory Alert</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              There are{' '}
              <span className="text-red-500 font-bold text-base">12</span>{' '}
              products currently low in stock.
            </p>
            <Link href="/pharmacy/products?filter=low-stock">
              <button className="w-full py-3 rounded-full border border-gray-100 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer">
                Review Inventory
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
