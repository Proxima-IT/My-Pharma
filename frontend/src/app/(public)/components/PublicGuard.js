'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, getStoredUser } from '../../(user)/lib/auth';

export default function PublicGuard({ children }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSession = () => {
      const token = getAccessToken();
      const user = getStoredUser();

      // If user is already logged in, redirect them away from Auth pages
      if (token && user) {
        const routes = {
          SUPER_ADMIN: '/admin',
          PHARMACY_ADMIN: '/pharmacy',
          DOCTOR: '/doctor',
          REGISTERED_USER: '/user',
        };

        router.replace(routes[user.role] || '/');
      } else {
        // No session found, allow them to see the Login/Register pages
        setIsChecking(false);
      }
    };

    checkSession();
  }, [router]);

  // Show nothing (or a very subtle loader) while checking to prevent form flickering
  if (isChecking) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
