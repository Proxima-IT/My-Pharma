'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiPackage,
  FiFileText,
  FiMapPin,
  FiCreditCard,
  FiShield,
  FiInfo,
  FiRefreshCw,
  FiHelpCircle,
  FiLogOut,
  FiChevronRight,
  FiUser,
} from 'react-icons/fi';

const UserSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [userData, setUserData] = useState({
    name: 'Loading...',
    identifier: '...',
    avatar: null,
  });

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const response = await fetch('http://localhost:8000/api/auth/me/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (response.ok) {
          setUserData({
            name:
              `${data.first_name || ''} ${data.last_name || ''}`.trim() ||
              data.username,
            identifier: data.email || data.phone || data.username,
            avatar: data.profile_picture,
          });
        }
      } catch (err) {
        console.error('Sidebar data fetch error:', err);
      }
    };

    fetchSidebarData();
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch('http://localhost:8000/api/auth/logout/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      router.replace('/login');
    }
  };

  const menuItems = [
    { name: 'Profile', icon: <FiUser />, href: '/user/profile' },
    { name: 'Orders', icon: <FiPackage />, href: '/user/orders' },
    {
      name: 'Prescriptions',
      icon: <FiFileText />,
      href: '/user/prescriptions',
    },
    { name: 'Manage Address', icon: <FiMapPin />, href: '/user/address' },
    {
      name: 'Transaction History',
      icon: <FiCreditCard />,
      href: '/user/transactions',
    },
  ];

  const legalItems = [
    { name: 'Terms & Conditions', icon: <FiShield />, href: '/user/terms' },
    { name: 'Privacy Policy', icon: <FiInfo />, href: '/user/privacy' },
    {
      name: 'Return & Refund Policy',
      icon: <FiRefreshCw />,
      href: '/user/return-policy',
    },
    { name: 'FAQ', icon: <FiHelpCircle />, href: '/user/faq' },
  ];

  const NavItem = ({ item }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        className={`flex items-center justify-between px-4 py-2.5 rounded-full transition-all duration-300 group ${
          isActive
            ? 'bg-primary-500 text-white'
            : 'text-gray-600 hover:bg-gray-50 hover:text-primary-500'
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`text-lg ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-500 transition-colors'}`}
          >
            {item.icon}
          </span>
          <span className="text-sm font-bold tracking-tight">{item.name}</span>
        </div>
        <FiChevronRight
          className={`transition-transform duration-300 ${isActive ? 'opacity-100 translate-x-0 text-white' : 'opacity-0 lg:opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'} lg:block`}
        />
      </Link>
    );
  };

  return (
    <aside className="w-full lg:max-w-[320px] flex flex-col gap-6">
      {/* 1. Account Container */}
      <div className="bg-white rounded-[32px] p-3 border border-gray-100/50">
        <div className="px-5 py-2 mb-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            Account
          </span>
        </div>
        <nav className="flex flex-col gap-1">
          {menuItems.map(item => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
      </div>

      {/* 2. Legal & Support Container */}
      <div className="bg-white rounded-[32px] p-3 border border-gray-100/50">
        <div className="px-5 py-2 mb-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            Legal & Support
          </span>
        </div>
        <nav className="flex flex-col gap-1">
          {legalItems.map(item => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
      </div>

      {/* 3. Logout Container */}
      <div className="bg-white rounded-[32px] p-3 border border-gray-100/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-red-600 hover:bg-red-50 transition-all duration-300 group cursor-pointer"
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

export default UserSidebar;
