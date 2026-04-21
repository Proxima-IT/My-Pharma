'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authenticatedFetch } from '../lib/authenticatedApi';

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
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      const userJson = localStorage.getItem('user');

      // 1. Check if logged in at all
      if (!token || !userJson) {
        router.replace('/login');
        return;
      }

      let user;
      try {
        user = JSON.parse(userJson);
      } catch {
        // Invalid user data
        handleLogout();
        return;
      }

      // 2. Try to validate token by making a test API call
      try {
        // Make a lightweight API call to validate the token
        const response = await authenticatedFetch('/auth/me/', {
          method: 'GET',
        });

        if (!response.ok) {
          // Token is invalid and refresh failed
          handleLogout();
          return;
        }
      } catch (error) {
        // Token refresh failed or network error
        handleLogout();
        return;
      }

      // 3. Role-Based Access Control (RBAC)
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

      // 4. If role matches and token is valid, authorize the view
      setIsAuthorized(true);
      setIsValidating(false);
    };

    const handleLogout = () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      router.replace('/login');
    };

    checkAuth();
  }, [router, allowedRoles]);

  if (isValidating) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">
          Verifying Permissions...
        </p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-red-400 uppercase tracking-widest animate-pulse">
          Access Denied
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
