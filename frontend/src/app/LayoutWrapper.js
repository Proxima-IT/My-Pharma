'use client';

import { usePathname } from 'next/navigation';
import Header from './(public)/components/Header';
import Footer from './(public)/components/Footer';
import Sidebar from './(public)/components/Sidebar';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  // Define paths that should NOT have the global Header, Footer, and Sidebar
  const authPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ];

  // Define paths that should NOT have the global Sidebar but SHOULD have Header/Footer
  const dashboardPaths = ['/user'];

  const isAuthPage = authPaths.some(path => pathname.startsWith(path));
  const isDashboardPage = dashboardPaths.some(path =>
    pathname.startsWith(path),
  );

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      {/* website header */}
      <Header />

      {/* main content */}
      <div
        className={`${isDashboardPage ? 'w-full' : 'lg:flex lg:gap-8 w-full px-2.5 lg:px-7 py-6'}`}
      >
        {!isDashboardPage && (
          <div className="hidden lg:block lg:w-3/12">
            <Sidebar />
          </div>
        )}
        <div className="flex-1">{children}</div>
      </div>

      {/* footer section */}
      <Footer />
    </>
  );
}
