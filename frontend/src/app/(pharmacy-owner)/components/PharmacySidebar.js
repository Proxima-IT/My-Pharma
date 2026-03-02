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
    { name: 'Dashboard', icon: <FiPieChart />, href: '/pharmacy' },
    {
      name: 'Order Management',
      icon: <FiShoppingBag />,
      href: '/pharmacy/orders',
    },
    { name: 'Product Management', icon: <FiBox />, href: '/pharmacy/products' },
    { name: 'Brand Management', icon: <FiAward />, href: '/pharmacy/brands' },
    {
      name: 'Category Management',
      icon: <FiGrid />,
      href: '/pharmacy/categories',
    },
  ];

  const NavItem = ({ item }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        className={`flex items-center justify-between px-5 py-3.5 rounded-full transition-all duration-300 group ${
          isActive
            ? 'bg-(--color-primary-500) text-white'
            : 'text-gray-600 hover:bg-gray-50 hover:text-(--color-primary-500)'
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`text-lg ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-(--color-primary-500)'}`}
          >
            {item.icon}
          </span>
          <span className="text-sm font-bold tracking-tight">{item.name}</span>
        </div>
        <FiChevronRight
          className={`transition-transform duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`}
        />
      </Link>
    );
  };

  return (
    <aside className="w-full lg:max-w-[320px] flex flex-col gap-6">
      {/* Management Section */}
      <div className="bg-white rounded-[32px] p-4 border border-gray-100">
        <div className="px-5 py-2 mb-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            Pharmacy Admin
          </span>
        </div>
        <nav className="flex flex-col gap-1.5">
          {menuItems.map(item => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
      </div>

      {/* Logout Section */}
      <div className="bg-white rounded-[32px] p-3 border border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-3.5 rounded-full text-red-600 hover:bg-red-50 transition-all duration-300 group cursor-pointer"
        >
          <span className="text-lg">
            <FiLogOut />
          </span>
          <span className="text-sm font-bold tracking-tight uppercase">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default PharmacySidebar;
