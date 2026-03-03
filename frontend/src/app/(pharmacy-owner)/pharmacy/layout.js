'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import PharmacySidebar from '../components/PharmacySidebar';
import AuthGuard from '@/app/(shared)/components/AuthGuard';

export default function PharmacyLayout({ children }) {
  const pathname = usePathname();
  const isHubPage = pathname === '/pharmacy';
  const pathSegments = pathname.split('/').filter(segment => segment);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const isLast = index === pathSegments.length - 1;
    let name =
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    if (name.toLowerCase() === 'pharmacy') name = 'Admin Panel';
    return { name, href, isLast };
  });

  return (
    <AuthGuard allowedRoles={['PHARMACY_ADMIN', 'SUPER_ADMIN']}>
      <div className="w-full py-6 md:py-10 px-4 md:px-7 flex flex-col lg:flex-row gap-8 items-start min-h-screen bg-white">
        <aside
          className={`${isHubPage ? 'block' : 'hidden'} lg:block w-full lg:w-[320px] lg:shrink-0 sticky top-36`}
        >
          <PharmacySidebar />
        </aside>

        <div
          className={`${isHubPage ? 'hidden' : 'block'} lg:block flex-1 min-w-0 space-y-6`}
        >
          {!isHubPage && (
            <nav className="bg-white border border-gray-100 rounded-full px-6 py-2.5 w-fit animate-in fade-in slide-in-from-left-4 duration-500">
              <ol className="flex items-center gap-2 text-xs md:text-sm whitespace-nowrap">
                <li className="flex items-center gap-2">
                  <Link
                    href="/"
                    className="text-gray-400 hover:text-(--color-primary-500) transition-colors font-medium"
                  >
                    Home
                  </Link>
                  <span className="text-gray-300 font-light">{'>'}</span>
                </li>
                {breadcrumbs.map(crumb => (
                  <li key={crumb.href} className="flex items-center gap-2">
                    {crumb.isLast ? (
                      <span className="text-gray-900 font-bold">
                        {crumb.name}
                      </span>
                    ) : (
                      <>
                        <Link
                          href={crumb.href}
                          className="text-gray-400 hover:text-(--color-primary-500) transition-colors font-medium"
                        >
                          {crumb.name}
                        </Link>
                        <span className="text-gray-300 font-light">{'>'}</span>
                      </>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="w-full">
            <Suspense fallback={null}>{children}</Suspense>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
