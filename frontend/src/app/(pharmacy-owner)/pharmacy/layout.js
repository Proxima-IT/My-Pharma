'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiMenu, FiX } from 'react-icons/fi';
import PharmacySidebar from '../components/PharmacySidebar';
import AuthGuard from '@/app/(shared)/components/AuthGuard';
import LoadingOverlay from '../components/LoadingOverlay';

export default function PharmacyLayout({ children }) {
  const pathname = usePathname();
  const [showLoading, setShowLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const isLoaded = sessionStorage.getItem('pharma_panel_loaded');
    if (!isLoaded) {
      setShowLoading(true);
    }
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLoadingFinish = () => {
    sessionStorage.setItem('pharma_panel_loaded', 'true');
    setShowLoading(false);
  };

  const pathSegments = pathname.split('/').filter(segment => segment);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const isLast = index === pathSegments.length - 1;
    let name =
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    if (name.toLowerCase() === 'pharmacy') name = 'DASHBOARD';
    return { name, href, isLast };
  });

  return (
    <AuthGuard allowedRoles={['PHARMACY_ADMIN', 'SUPER_ADMIN']}>
      {showLoading && <LoadingOverlay onFinish={handleLoadingFinish} />}

      <div className="flex min-h-screen bg-(--color-admin-bg) relative">
        {/* ১. ডেস্কটপ সাইডবার */}
        <aside className="hidden lg:block w-[300px] shrink-0 h-screen sticky top-0 bg-white border-r border-(--color-admin-border) overflow-y-auto">
          <PharmacySidebar />
        </aside>

        {/* ২. মোবাইল সাইডবার ড্রয়ার */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[100]">
            {/* ব্যাকড্রপ */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* ড্রয়ার কন্টেন্ট - h-full এবং flex flex-col নিশ্চিত করা হয়েছে */}
            <div className="absolute inset-y-0 left-0 w-[300px] bg-[#FAF7F2] animate-in slide-in-from-left duration-300 shadow-2xl flex flex-col h-full">
              {/* ক্লোজ বাটন - ফ্লোটিং */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 z-[110] p-2 bg-white border border-(--color-admin-border) text-(--color-admin-navy) hover:bg-gray-50 transition-all rounded-none"
              >
                <FiX size={20} />
              </button>

              {/* সাইডবার কম্পোনেন্ট - h-full দিয়ে পুরো জায়গা দখল করবে */}
              <div className="flex-1 h-full overflow-y-auto">
                <PharmacySidebar />
              </div>
            </div>
          </div>
        )}

        {/* ৩. মেইন কন্টেন্ট এরিয়া */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* হেডার */}
          <header className="sticky top-0 z-40 bg-(--color-admin-card) border-b border-(--color-admin-border) px-4 md:px-8 py-5 flex items-center justify-between w-full shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2.5 -ml-2 bg-white text-(--color-admin-navy) border border-(--color-admin-border) hover:bg-gray-50 transition-all rounded-none"
              >
                <FiMenu size={20} />
              </button>

              <nav className="hidden sm:flex items-center font-mono text-[11px] tracking-tight">
                <li className="flex items-center list-none">
                  <Link
                    href="/"
                    className="text-(--color-text-secondary) hover:text-(--color-admin-navy) transition-colors"
                  >
                    ROOT
                  </Link>
                  <span className="mx-2 text-(--color-border)">/</span>
                </li>
                {breadcrumbs.map(crumb => (
                  <li key={crumb.href} className="flex items-center list-none">
                    {crumb.isLast ? (
                      <span className="text-(--color-admin-navy) font-bold uppercase">
                        {crumb.name}
                      </span>
                    ) : (
                      <>
                        <Link
                          href={crumb.href}
                          className="text-(--color-text-secondary) hover:text-(--color-admin-navy) transition-colors uppercase"
                        >
                          {crumb.name}
                        </Link>
                        <span className="mx-2 text-(--color-border)">/</span>
                      </>
                    )}
                  </li>
                ))}
              </nav>

              <span className="sm:hidden font-black text-xs uppercase tracking-tighter text-(--color-admin-navy)">
                {breadcrumbs[breadcrumbs.length - 1]?.name || 'Dashboard'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="font-mono text-[9px] md:text-[10px] border border-(--color-admin-border) px-2 md:px-3 py-1 bg-(--color-admin-bg) font-bold text-(--color-admin-navy)">
                SYS_STATUS:{' '}
                <span className="text-(--color-admin-success)">ONLINE</span>
              </div>
            </div>
          </header>

          {/* পেজ কন্টেন্ট */}
          <main className="p-6 md:p-8 lg:p-10 min-h-[calc(100vh-68px)]">
            <div className="max-w-full">
              <Suspense
                fallback={
                  <div className="font-mono text-sm p-10 animate-pulse text-(--color-admin-primary)">
                    LOADING_SYSTEM_RESOURCES...
                  </div>
                }
              >
                {children}
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
