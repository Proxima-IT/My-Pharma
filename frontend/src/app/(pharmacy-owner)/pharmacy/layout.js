'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import PharmacySidebar from '../components/PharmacySidebar';
import AuthGuard from '@/app/(shared)/components/AuthGuard';
import LoadingOverlay from '../components/LoadingOverlay';

export default function PharmacyLayout({ children }) {
  const pathname = usePathname();
  const [showLoading, setShowLoading] = useState(false);

  const isHubPage = pathname === '/pharmacy';
  const pathSegments = pathname.split('/').filter(segment => segment);

  useEffect(() => {
    // Check if the panel was already loaded in this session
    const isLoaded = sessionStorage.getItem('pharma_panel_loaded');
    if (!isLoaded) {
      setShowLoading(true);
    }
  }, []);

  const handleLoadingFinish = () => {
    sessionStorage.setItem('pharma_panel_loaded', 'true');
    setShowLoading(false);
  };

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
      {/* System Boot Overlay */}
      {showLoading && <LoadingOverlay onFinish={handleLoadingFinish} />}

      <div
        className={`flex flex-col lg:flex-row min-h-screen bg-(--color-admin-bg) rounded-none ${showLoading ? 'overflow-hidden h-screen' : ''}`}
      >
        {/* Fixed Sidebar for Desktop */}
        <aside
          className={`${isHubPage ? 'block' : 'hidden'} lg:block w-full lg:w-[280px] lg:fixed lg:inset-y-0 lg:left-0 z-50`}
        >
          <PharmacySidebar />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:pl-[280px]">
          {/* Top Header / Breadcrumbs */}
          <header className="sticky top-0 z-40 bg-(--color-admin-card) border-b border-(--color-admin-border) px-6 py-4 flex items-center justify-between rounded-none">
            <nav className="flex items-center">
              <ol className="flex items-center font-mono text-[11px] tracking-tight">
                <li className="flex items-center">
                  <Link
                    href="/"
                    className="text-(--color-text-secondary) hover:text-(--color-admin-navy) transition-colors"
                  >
                    ROOT
                  </Link>
                  <span className="mx-2 text-(--color-border)">/</span>
                </li>
                {breadcrumbs.map(crumb => (
                  <li key={crumb.href} className="flex items-center">
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
              </ol>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <div className="font-mono text-[10px] border border-(--color-admin-border) px-3 py-1 bg-(--color-admin-bg) font-bold text-(--color-admin-navy)">
                SYS_STATUS:{' '}
                <span className="text-(--color-admin-success)">ONLINE</span>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6 lg:p-10 min-h-[calc(100vh-68px)]">
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
