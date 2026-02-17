'use client';

import { usePathname } from 'next/navigation';
import UserSidebar from './components/UserSidebar';
import AuthGuard from './components/AuthGuard';

export default function UserDashboardLayout({ children }) {
  const pathname = usePathname();

  // Identify if we are on the main dashboard "Hub" page (The Menu)
  const isHubPage = pathname === '/user';

  return (
    <AuthGuard>
      <div className="max-w-[1440px] mx-auto py-6 md:py-10 px-4 md:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 
            SIDEBAR (The Hub): 
            - Always visible on Desktop (lg:block)
            - On Mobile: Only visible if we are exactly on the /user route
          */}
          <aside
            className={`${isHubPage ? 'block' : 'hidden'} lg:block lg:col-span-4 xl:col-span-3 sticky top-10`}
          >
            <UserSidebar />
          </aside>

          {/* 
            CONTENT (The Spokes): 
            - Always visible on Desktop (lg:block)
            - On Mobile: Hidden on the /user route (to show the Hub), visible on all other routes
          */}
          <div
            className={`${isHubPage ? 'hidden' : 'block'} lg:block lg:col-span-8 xl:col-span-9`}
          >
            {children}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
