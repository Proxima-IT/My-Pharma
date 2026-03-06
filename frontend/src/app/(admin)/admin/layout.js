'use client';
import React, { Suspense, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiMenu, FiX } from 'react-icons/fi';
import AdminSidebar from '../components/AdminSidebar';
import AuthGuard from '@/app/(shared)/components/AuthGuard';
import LoadingOverlay from '@/app/(pharmacy-owner)/components/LoadingOverlay';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [showLoading, setShowLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const isLoaded = sessionStorage.getItem('admin_panel_loaded');
    if (!isLoaded) setShowLoading(true);
  }, []);

  // Close mobile menu when changing pages
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLoadingFinish = () => {
    sessionStorage.setItem('admin_panel_loaded', 'true');
    setShowLoading(false);
  };

  const pathSegments = pathname.split('/').filter(segment => segment);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const isLast = index === pathSegments.length - 1;
    let name =
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    if (name.toLowerCase() === 'admin') name = 'ROOT';
    return { name, href, isLast };
  });

  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN']}>
      {showLoading && <LoadingOverlay onFinish={handleLoadingFinish} />}

      <div className="flex min-h-screen bg-(--color-admin-bg) relative">
        {/* 1. DESKTOP SIDEBAR (Static - Always visible on LG screens) */}
        <aside className="hidden lg:block w-[320px] shrink-0 h-screen sticky top-0 bg-white border-r border-gray-100 overflow-y-auto">
          <AdminSidebar />
        </aside>

        {/* 2. MOBILE SIDEBAR DRAWER (Fixed Overlay - Only for Mobile) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[100]">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Drawer Content */}
            <div className="absolute inset-y-0 left-0 w-[280px] bg-white shadow-2xl animate-in slide-in-from-left duration-300">
              <div className="p-4 flex justify-end border-b border-gray-100">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-[#8A8A78]"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="h-[calc(100vh-65px)] overflow-y-auto">
                <AdminSidebar />
              </div>
            </div>
          </div>
        )}

        {/* 3. MAIN CONTENT WRAPPER */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 md:px-8 py-5 flex items-center justify-between w-full shrink-0">
            <div className="flex items-center gap-4">
              {/* Hamburger Button (Mobile Only) */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 text-[#1B1B1B] hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <FiMenu size={22} />
              </button>

              {/* Breadcrumbs (Desktop/Tablet) */}
              <nav className="hidden sm:flex items-center font-mono text-[11px] tracking-tight">
                <Link
                  href="/"
                  className="text-[#8A8A78] hover:text-black transition-colors"
                >
                  SYSTEM
                </Link>
                <span className="mx-3 text-[#DAD7CD]">/</span>
                {breadcrumbs.map(crumb => (
                  <span key={crumb.href} className="flex items-center">
                    <Link
                      href={crumb.href}
                      className={`${crumb.isLast ? 'text-black font-bold' : 'text-[#8A8A78] hover:text-black'} uppercase transition-colors`}
                    >
                      {crumb.name}
                    </Link>
                    {!crumb.isLast && (
                      <span className="mx-3 text-[#DAD7CD]">/</span>
                    )}
                  </span>
                ))}
              </nav>

              {/* Mobile Title */}
              <span className="sm:hidden font-black text-xs uppercase tracking-tighter text-[#1B1B1B]">
                {breadcrumbs[breadcrumbs.length - 1]?.name || 'Overview'}
              </span>
            </div>

            <div className="font-mono text-[9px] md:text-[10px] border border-red-100 px-2 md:px-3 py-1 bg-red-50 font-bold text-red-600 uppercase tracking-widest">
              <span className="hidden xs:inline">SUPER_ADMIN_MODE</span>
              <span className="xs:hidden">ADMIN</span>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6 md:p-8 lg:p-12 w-full">
            <Suspense
              fallback={
                <div className="font-mono text-sm p-10 animate-pulse text-[#3A5A40]">
                  INITIALIZING_ADMIN_CORE...
                </div>
              }
            >
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
