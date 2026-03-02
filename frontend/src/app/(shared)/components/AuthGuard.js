'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * AuthGuard Component
 * @param {string[]} allowedRoles - Array of roles permitted to view the children
 */
export default function AuthGuard({
  children,
  allowedRoles = ['REGISTERED_USER'],
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      const userJson = localStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;

      // 1. Check if logged in at all
      if (!token || !user) {
        router.replace('/login');
        return;
      }

      // 2. Role-Based Access Control (RBAC)
      // Check if the user's role is in the list of allowed roles for this section
      const hasPermission = allowedRoles.includes(user.role);

      if (!hasPermission) {
        // If not permitted, send them to their specific dashboard
        const routes = {
          SUPER_ADMIN: '/admin',
          PHARMACY_ADMIN: '/pharmacy',
          DOCTOR: '/doctor',
          REGISTERED_USER: '/user',
        };

        // Prevent infinite redirect: only replace if the target is different from current path
        const targetPath = routes[user.role] || '/';
        if (window.location.pathname !== targetPath) {
          router.replace(targetPath);
        }
        return;
      }

      // 3. If role matches, authorize the view
      setIsAuthorized(true);
    };

    checkAuth();
  }, [router, allowedRoles]);

  if (!isAuthorized) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">
          Verifying Permissions...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
