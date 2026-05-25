'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AUTH_ENDPOINTS, fetchWithAuth } from '@/app/(shared)/lib/apiConfig';

/**
 * AuthGuard Component
 * Optimized: Uses stable dependency checking and prevents re-validation loops.
 * Handles Role-Based Access Control (RBAC) and Silent Token Refresh.
 */
export default function AuthGuard({
  children,
  allowedRoles = ['REGISTERED_USER'],
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  // Use a ref to track the stringified roles to prevent reference-based loops
  const rolesString = JSON.stringify(allowedRoles);
  const hasVerified = useRef(false);

  useEffect(() => {
    const verifySession = async () => {
      // If we already verified in this mount cycle and roles haven't changed, skip
      if (hasVerified.current) {
        setIsValidating(false);
        return;
      }

      const token = localStorage.getItem('access_token');
      const userJson = localStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;

      // 1. Quick Local Check
      if (!token || !user) {
        router.replace('/login');
        return;
      }

      try {
        // 2. Proactive Server-Side Verification (Handles silent refresh internally)
        const response = await fetchWithAuth(AUTH_ENDPOINTS.ME);

        if (!response.ok) {
          throw new Error('Unauthorized session');
        }

        // 3. Role-Based Access Control
        const hasPermission = allowedRoles.includes(user.role);

        if (!hasPermission) {
          const routes = {
            SUPER_ADMIN: '/admin',
            PHARMACY_ADMIN: '/pharmacy',
            DOCTOR: '/doctor',
            REGISTERED_USER: '/user',
          };

          const targetPath = routes[user.role] || '/';

          // Prevent infinite redirect if already at target
          if (pathname !== targetPath) {
            router.replace(targetPath);
          }
          setIsAuthorized(false);
        } else {
          setIsAuthorized(true);
          hasVerified.current = true; // Mark as verified to stop loops
        }
      } catch (err) {
        console.error('AuthGuard: Session verification failed', err);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        router.replace('/login');
      } finally {
        setIsValidating(false);
      }
    };

    verifySession();

    // Reset verification flag if the specific roles required change
  }, [router, pathname, rolesString]);

  // Loading UI: Sharp Industrial Loader
  if (isValidating) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">
          Securing Session...
        </p>
      </div>
    );
  }

  // Access Denied UI
  if (!isAuthorized) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white p-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight mb-2">
          Unauthorized Access
        </h2>
        <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
          Your current account role does not permit access to this directory.
        </p>
        <button
          onClick={() => router.back()}
          className="text-xs font-bold uppercase tracking-widest text-(--color-primary-500) underline cursor-pointer"
        >
          Return Back
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
