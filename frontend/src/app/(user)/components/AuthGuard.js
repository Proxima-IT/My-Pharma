'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }) {
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
      // Only allow 'REGISTERED_USER' to access this specific route group
      if (user.role !== 'REGISTERED_USER') {
        // Redirect other roles to their respective homes
        const routes = {
          SUPER_ADMIN: '/admin',
          PHARMACY_ADMIN: '/pharmacy',
          DOCTOR: '/doctor',
        };

        router.replace(routes[user.role] || '/');
        return;
      }

      // 3. If everything is correct
      setIsAuthorized(true);
    };

    checkAuth();
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">
          Verifying Permissions...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
