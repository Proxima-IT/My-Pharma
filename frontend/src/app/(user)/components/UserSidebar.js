'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiPackage,
  FiFileText,
  FiHeart,
  FiMapPin,
  FiCreditCard,
  FiActivity,
  FiShield,
  FiInfo,
  FiRefreshCw,
  FiHelpCircle,
  FiLogOut,
  FiChevronRight,
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
      // Optional: Notify backend of logout
      await fetch('http://localhost:8000/api/auth/logout/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear all auth data
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      sessionStorage.clear();

      // Redirect to login
      router.replace('/login');
    }
  };

  const menuItems = [
    { name: 'Orders', icon: <FiPackage />, href: '/user/orders' },
    {
      name: 'Prescriptions',
      icon: <FiFileText />,
      href: '/user/prescriptions',
    },
    { name: 'Wishlist', icon: <FiHeart />, href: '/user/wishlist' },
    { name: 'Manage Address', icon: <FiMapPin />, href: '/user/address' },
    {
      name: 'Transaction History',
      icon: <FiCreditCard />,
      href: '/user/transactions',
    },
    { name: 'Health Tips', icon: <FiActivity />, href: '/user/health-tips' },
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
        className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group ${
          isActive
            ? 'bg-primary-50 text-primary-500'
            : 'text-gray-600 hover:bg-gray-50 hover:text-primary-500'
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`text-lg ${isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-primary-500 transition-colors'}`}
          >
            {item.icon}
          </span>
          <span className="text-sm font-semibold tracking-tight">
            {item.name}
          </span>
        </div>
        <FiChevronRight
          className={`transition-transform duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 lg:opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'} lg:block`}
        />
      </Link>
    );
  };

  return (
    <aside className="w-full lg:max-w-[320px] flex flex-col gap-6">
      <div className="bg-white rounded-[24px] p-6 flex flex-col items-center text-center shadow-sm border border-gray-100/50">
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-full bg-primary-50 border-2 border-white ring-4 ring-primary-25 overflow-hidden">
            <img
              src={
                userData.avatar ||
                `https://ui-avatars.com/api/?name=${userData.name}&background=233b8c&color=fff`
              }
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-1 right-1 w-4 h-4 bg-success-500 border-2 border-white rounded-full"></div>
        </div>
        <h3 className="text-lg font-bold text-gray-900 leading-tight">
          {userData.name}
        </h3>
        <p className="text-xs font-medium text-gray-500 mt-1">
          {userData.identifier}
        </p>

        <Link
          href="/user/profile"
          className="mt-4 text-[11px] font-black uppercase tracking-widest text-primary-500 hover:text-primary-700 transition-colors border border-primary-100 px-4 py-2 rounded-full hover:bg-primary-50"
        >
          View Profile
        </Link>
      </div>

      <div className="bg-white rounded-[24px] p-3 shadow-sm border border-gray-100/50">
        <nav className="flex flex-col gap-1">
          {menuItems.map(item => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
        <div className="mt-6 mb-2 px-4">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            Legal & Support
          </span>
        </div>
        <nav className="flex flex-col gap-1">
          {legalItems.map(item => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
        <div className="mt-4 pt-4 border-t border-gray-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-300 group"
          >
            <span className="text-lg">
              <FiLogOut />
            </span>
            <span className="text-sm font-bold tracking-tight">
              Logout Session
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default UserSidebar;
