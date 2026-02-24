'use client';

import { usePathname } from 'next/navigation';
import Header from './(public)/components/Header';
import Footer from './(public)/components/Footer';
import Sidebar from './(public)/components/Sidebar';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  // 1. Pages with NO Header/Footer/Sidebar (Auth)
  const authPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ];
  const isAuthPage = authPaths.some(path => pathname.startsWith(path));

  // 2. Pages with Header/Footer but NO Global Sidebar (Dashboard & Products)
  const isDashboardPage = pathname.startsWith('/user');
  const isProductsPage = pathname.startsWith('/products');

  // 3. Logic: Show Sidebar only on Home and other public pages, NOT on Products or Dashboard
  const showSidebar = !isAuthPage && !isDashboardPage && !isProductsPage;

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow w-full">
        <div
          className={`w-full px-4 md:px-7 py-6 ${
            showSidebar ? 'lg:flex lg:gap-8' : ''
          }`}
        >
          {/* 
            THE GLOBAL SIDEBAR:
            - Now hidden on /products page as well.
          */}
          {showSidebar && (
            <aside className="hidden lg:block w-[320px] shrink-0">
              <div
                className="sticky top-36 self-start max-h-[calc(100vh-160px)] overflow-y-auto"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                <style jsx>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                <Sidebar />
              </div>
            </aside>
          )}

          {/* THE CONTENT: Takes full width if sidebar is hidden */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
