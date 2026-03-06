'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiShoppingBag,
  FiBox,
  FiGrid,
  FiAward,
  FiPieChart,
  FiLogOut,
  FiChevronRight,
} from 'react-icons/fi';

const PharmacySidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    router.replace('/login');
  };

  const menuItems = [
    { name: 'DASHBOARD', icon: <FiPieChart />, href: '/pharmacy' },
    {
      name: 'ORDER MANAGEMENT',
      icon: <FiShoppingBag />,
      href: '/pharmacy/orders',
    },
    { name: 'PRODUCT MANAGEMENT', icon: <FiBox />, href: '/pharmacy/products' },
    { name: 'BRAND MANAGEMENT', icon: <FiAward />, href: '/pharmacy/brands' },
    {
      name: 'CATEGORY MANAGEMENT',
      icon: <FiGrid />,
      href: '/pharmacy/categories',
    },
  ];

  const NavItem = ({ item }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        className={`flex items-center justify-between px-5 py-4 transition-all duration-150 border-b border-[#DAD7CD] rounded-none group ${
          isActive
            ? 'bg-[#E8F0EA] text-[#1F3324]' // Primary-50 background, Primary-900 text
            : 'text-[#6B6B5E] hover:bg-[#F1F1E6] hover:text-[#1B1B1B]' // Neutral-600 text, Neutral-100 hover
        }`}
      >
        <div className="flex items-center gap-4">
          <span
            className={`text-xl ${isActive ? 'text-[#3A5A40]' : 'text-[#8A8A78]'}`}
          >
            {item.icon}
          </span>
          <span className="text-xs font-bold tracking-[0.1em] font-inter">
            {item.name}
          </span>
        </div>
        <FiChevronRight
          className={`transition-transform duration-200 ${isActive ? 'rotate-90 opacity-100' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`}
        />
      </Link>
    );
  };

  return (
    <aside className="w-full flex flex-col h-full bg-[#FAF7F2] border-r border-[#DAD7CD] rounded-none navy-scrollbar overflow-y-auto">
      {/* Brand Header */}
      <div className="p-8 border-b border-[#DAD7CD] bg-[#F1F1E6]">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] font-bold text-[#8A8A78] uppercase tracking-[0.3em]">
            System Terminal
          </span>
          <h2 className="text-[#1B1B1B] font-black text-xl tracking-tighter">
            MY_PHARMA<span className="text-[#588157]">_</span>
          </h2>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="px-6 py-4 bg-[#FAF7F2]">
        <span className="font-mono text-[9px] font-bold text-[#B7B7A4] uppercase tracking-[0.2em]">
          Core Modules
        </span>
      </div>

      <nav className="flex flex-col flex-1 bg-[#FAF7F2]">
        {menuItems.map(item => (
          <NavItem key={item.name} item={item} />
        ))}
      </nav>

      {/* Logout Footer */}
      <div className="p-6 mt-auto border-t border-[#DAD7CD] bg-[#F1F1E6]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#2B2B2B] text-[#2B2B2B] font-bold rounded-none hover:bg-[#1B1B1B] hover:text-white transition-colors cursor-pointer"
        >
          <FiLogOut className="text-lg" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
            Terminate Session
          </span>
        </button>
      </div>
    </aside>
  );
};

export default PharmacySidebar;
