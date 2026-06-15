'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import UserSidebar from './components/UserSidebar';
import AuthGuard from '../(shared)/components/AuthGuard';

export default function UserDashboardLayout({ children }) {
  const pathname = usePathname();
  const isHubPage = pathname === '/user';
  const pathSegments = pathname.split('/').filter(segment => segment);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const isLast = index === pathSegments.length - 1;
    let name =
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    if (name.toLowerCase() === 'user') name = 'Dashboard';
    return { name, href, isLast };
  });

  return (
    <AuthGuard>
      <div className="w-full py-6 md:py-10 px-4 md:px-6 lg:px-10 flex flex-col lg:flex-row gap-5 items-start">
        <aside
          className={`${isHubPage ? 'block' : 'hidden'} lg:block w-full lg:w-[320px] lg:shrink-0 sticky top-10`}
        >
          <UserSidebar />
        </aside>

        <div
          className={`${isHubPage ? 'hidden' : 'block'} lg:block flex-1 w-full space-y-5`}
        >
          {!isHubPage && (
            <nav className="bg-white border border-gray-100/50 rounded-full px-4 md:px-6 py-2 w-fit mb-6 lg:mb-5">
              <ol className="flex items-center gap-2 text-[10px] sm:text-xs lg:text-[11px] whitespace-nowrap uppercase tracking-wider">
                <li className="flex items-center gap-2">
                  <Link
                    href="/"
                    className="text-gray-400 hover:text-(--color-primary-500) transition-colors font-bold"
                  >
                    Home
                  </Link>
                  <span className="text-gray-300 font-light">{'>'}</span>
                </li>
                {breadcrumbs.map(crumb => (
                  <li key={crumb.href} className="flex items-center gap-2">
                    {crumb.isLast ? (
                      <span className="text-gray-900 font-black truncate max-w-[150px] lg:max-w-none">
                        {crumb.name}
                      </span>
                    ) : (
                      <>
                        <Link
                          href={crumb.href}
                          className="text-gray-400 hover:text-(--color-primary-500) transition-colors font-bold"
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
