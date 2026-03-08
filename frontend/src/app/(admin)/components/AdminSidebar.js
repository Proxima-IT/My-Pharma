'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiUsers,
  FiSettings,
  FiPieChart,
  FiLogOut,
  FiShoppingBag,
  FiBox,
  FiGrid,
  FiAward,
  FiDroplet,
  FiLayout,
  FiArchive,
  FiImage,
} from 'react-icons/fi';

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    router.replace('/login');
  };

  // Grouped Menu Structure
  const menuGroups = [
    {
      title: 'Dashboard',
      items: [{ name: 'Overview', icon: <FiPieChart />, href: '/admin' }],
    },
    {
      title: 'Logistics & Sales',
      items: [
        {
          name: 'Order Records',
          icon: <FiShoppingBag />,
          href: '/admin/orders',
        },
        {
          name: 'Inventory Control',
          icon: <FiArchive />,
          href: '/admin/inventory',
        },
      ],
    },
    {
      title: 'Product Catalog',
      items: [
        { name: 'Medicine List', icon: <FiBox />, href: '/admin/products' },
        {
          name: 'Generic Names',
          icon: <FiDroplet />,
          href: '/admin/ingredients',
        },
        { name: 'Company Registry', icon: <FiAward />, href: '/admin/brands' },
        {
          name: 'Medicine Groups',
          icon: <FiGrid />,
          href: '/admin/categories',
        },
      ],
    },
    {
      title: 'Website Content',
      items: [
        { name: 'Sidebar Menu', icon: <FiLayout />, href: '/admin/sidebar' },
        { name: 'Ads Management', icon: <FiImage />, href: '/admin/ads' },
      ],
    },
    {
      title: 'Access Control',
      items: [
        { name: 'User Management', icon: <FiUsers />, href: '/admin/users' },
      ],
    },
    {
      title: 'Configuration',
      items: [
        {
          name: 'Global Settings',
          icon: <FiSettings />,
          href: '/admin/settings',
        },
      ],
    },
  ];

  const NavItem = ({ item }) => {
    const isActive =
      pathname === item.href ||
      (item.href !== '/admin' && pathname.startsWith(item.href));

    return (
      <Link href={item.href} className="flex items-center px-6 py-0.5 group">
        <div
          className={`flex items-center gap-3 px-5 py-2.5 transition-all duration-200 rounded-none w-full border-l-2 ${
            isActive
              ? 'bg-[#E8F0EA] text-[#1F3324] border-[#3A5A40]'
              : 'text-[#6B6B5E] border-transparent hover:bg-gray-50 hover:text-[#1B1B1B]'
          }`}
        >
          <span
            className={`text-lg ${isActive ? 'text-[#3A5A40]' : 'text-[#B7B7A4] group-hover:text-[#1B1B1B]'}`}
          >
            {item.icon}
          </span>
          <span
            className={`text-[14px] tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}
          >
            {item.name}
          </span>
        </div>
      </Link>
    );
  };

  return (
    /* Applied admin-scrollbar class here */
    <div className="w-full h-full flex flex-col bg-white border-r border-gray-100 admin-scrollbar overflow-y-auto">
      {/* Brand Header */}
      <div className="p-10 mb-4 shrink-0">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[9px] font-bold text-[#B7B7A4] uppercase tracking-[0.2em]">
            Admin Console
          </span>
          <h2 className="text-[#1B1B1B] font-black text-2xl tracking-tight">
            MY_PHARMA<span className="text-[#588157]">.</span>
          </h2>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex flex-col flex-1 pb-10">
        {menuGroups.map((group, gIdx) => (
          <div key={group.title} className={gIdx !== 0 ? 'mt-6' : ''}>
            <div className="px-6 mb-2">
              <div className="px-5 border-l-2 border-transparent">
                <span className="text-[10px] font-bold text-[#DAD7CD] uppercase tracking-[0.2em]">
                  {group.title}
                </span>
              </div>
            </div>
            {group.items.map(item => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-8 mt-auto shrink-0">
        <div className="px-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-5 py-3 text-[#B7B7A4] hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer font-bold text-[11px] uppercase tracking-widest border border-transparent hover:border-red-100 w-full"
          >
            <FiLogOut className="text-lg" />
            <span>Exit System</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
