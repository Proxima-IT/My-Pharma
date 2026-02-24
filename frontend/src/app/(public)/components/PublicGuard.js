'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAccessToken, getStoredUser } from '../../(user)/lib/auth';

export default function PublicGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSession = () => {
      const token = getAccessToken();
      const user = getStoredUser();

      // Define paths that logged-in users should be redirected AWAY from
      const authPaths = [
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
      ];

      const isAuthPage = authPaths.some(path => pathname.startsWith(path));

      // ONLY redirect if the user is logged in AND trying to access an Auth page
      if (token && user && isAuthPage) {
        const routes = {
          SUPER_ADMIN: '/admin',
          PHARMACY_ADMIN: '/pharmacy',
          DOCTOR: '/doctor',
          REGISTERED_USER: '/user',
        };

        router.replace(routes[user.role] || '/user');
      } else {
        // Allow access to the page
        setIsChecking(false);
      }
    };

    checkSession();
  }, [router, pathname]);

  if (isChecking) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
