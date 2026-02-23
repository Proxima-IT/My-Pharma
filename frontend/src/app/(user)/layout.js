'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import UserSidebar from './components/UserSidebar';
import AuthGuard from './components/AuthGuard';

export default function UserDashboardLayout({ children }) {
  const pathname = usePathname();

  // Identify if we are on the main dashboard "Hub" page (The Menu)
  const isHubPage = pathname === '/user';

  // Generate Breadcrumbs from Pathname
  const pathSegments = pathname.split('/').filter(segment => segment);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const isLast = index === pathSegments.length - 1;

    // Format segment name (e.g., 'user' -> 'Dashboard', 'profile' -> 'Profile')
    let name =
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    if (name.toLowerCase() === 'user') name = 'Dashboard';

    return { name, href, isLast };
  });

  return (
    <AuthGuard>
      <div className="w-full py-6 md:py-10 px-4 md:px-6 lg:px-10 flex flex-col lg:flex-row gap-5 items-start">
        {/* 
          SIDEBAR (The Hub): 
          - Always visible on Desktop (lg:block)
          - On Mobile: Only visible if we are exactly on the /user route
        */}
        <aside
          className={`${isHubPage ? 'block' : 'hidden'} lg:block w-full lg:w-[320px] lg:shrink-0 sticky top-10`}
        >
          <UserSidebar />
        </aside>

        {/* 
          CONTENT (The Spokes): 
          - Always visible on Desktop (lg:block)
          - On Mobile: Hidden on the /user route (to show the Hub), visible on all other routes
        */}
        <div
          className={`${isHubPage ? 'hidden' : 'block'} lg:block flex-1 w-full space-y-5`}
        >
          {/* Breadcrumb Navigation - Fully Rounded & Content Width */}
          {!isHubPage && (
            <nav className="bg-white border border-gray-100/50 rounded-full px-6 py-2.5 w-fit">
              <ol className="flex items-center gap-2 text-xs md:text-sm whitespace-nowrap">
                <li className="flex items-center gap-2">
                  <Link
                    href="/"
                    className="text-gray-400 hover:text-primary-500 transition-colors font-medium"
                  >
                    Home
                  </Link>
                  <span className="text-gray-300 font-light">{'>'}</span>
                </li>
                {breadcrumbs.map((crumb, index) => (
                  <li key={crumb.href} className="flex items-center gap-2">
                    {crumb.isLast ? (
                      <span className="text-gray-900 font-bold">
                        {crumb.name}
                      </span>
                    ) : (
                      <>
                        <Link
                          href={crumb.href}
                          className="text-gray-400 hover:text-primary-500 transition-colors font-medium"
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

          <div className="w-full">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
}
