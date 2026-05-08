'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './(public)/components/Header';
import Footer from './(public)/components/Footer';
import Sidebar from './(public)/components/Sidebar';
import NotificationPermissionPrompt from './(public)/components/NotificationPermissionPrompt';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  // 1. Pages with NO Header/Footer/Sidebar (Auth, Pharmacy, and Admin Panels)
  const authPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ];

  const isAuthPage = authPaths.some(path => pathname.startsWith(path));
  const isPharmacyPanel = pathname.startsWith('/pharmacy');
  const isAdminPanel = pathname.startsWith('/admin');

  // 2. Pages with Header/Footer but NO Global Public Sidebar
  const isUserDashboard = pathname.startsWith('/user');
  const isProductsListPage = pathname.startsWith('/products');
  const isCartPage = pathname.startsWith('/cart');
  const isCheckoutPage = pathname.startsWith('/checkout');
  const isUploadPrescriptionPage = pathname.startsWith('/upload-prescription');
  const isBlogsPage = pathname.startsWith('/blogs');

  // 3. Logic: Show Sidebar only on Home and Product Details
  const showSidebar =
    !isAuthPage &&
    !isUserDashboard &&
    !isPharmacyPanel &&
    !isAdminPanel &&
    !isProductsListPage &&
    !isCartPage &&
    !isUploadPrescriptionPage &&
    !isCheckoutPage &&
    !isBlogsPage;

  // Auth pages should not show notification prompt/layout chrome.
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Admin and pharmacy routes still need the push prompt so these users can
  // register FCM tokens and receive OS-level notifications.
  if (isPharmacyPanel || isAdminPanel) {
    return (
      <>
        <NotificationPermissionPrompt />
        {children}
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F2F3F5]">
      <NotificationPermissionPrompt />
      <Header />

      <main className="flex-grow w-full">
        <div
          className={`w-full px-4 md:px-7 py-6 ${
            showSidebar ? 'lg:flex lg:gap-8' : ''
          }`}
        >
          {showSidebar && (
            <aside className="hidden lg:block w-[320px] shrink-0">
              <div
                className="sticky top-36 self-start max-h-[calc(100vh-160px)] overflow-y-auto"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                <Sidebar />
              </div>
            </aside>
          )}

          {/* THE CONTENT */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
