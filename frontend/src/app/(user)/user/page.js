'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserDashboardRoot() {
  const router = useRouter();

  useEffect(() => {
    // On Desktop (lg breakpoint and above), automatically move to the profile spoke.
    // On Mobile, the layout hides this component anyway to show the Sidebar/Menu Hub.
    const handleRedirect = () => {
      if (window.innerWidth >= 1024) {
        router.replace('/user/profile');
      }
    };

    handleRedirect();

    // Optional: Listen for resize if user expands window from mobile to desktop
    window.addEventListener('resize', handleRedirect);
    return () => window.removeEventListener('resize', handleRedirect);
  }, [router]);

  return null;
}
