'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginApi } from '../api/loginApi';
import {
  notificationDebug,
  notificationError,
} from '../../../../(shared)/lib/notificationDebug';

/**
 * useLogin hook
 * Updated: Persists both access_token and refresh_token for silent authentication refresh.
 */
export const useLogin = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    keepLogin: false,
  });

  const handleLogin = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      notificationDebug(
        'Login started. Attempting notification-ready session.',
      );
      const email = (formData.email || '').trim().toLowerCase();
      const password = (formData.password || '').trim();
      const result = await loginApi({
        email,
        password,
      });

      // Store tokens and user data
      // Important: storing refresh_token to allow the interceptor to renew the session
      localStorage.setItem('access_token', result.access);
      localStorage.setItem('refresh_token', result.refresh);
      localStorage.setItem('user', JSON.stringify(result.user));

      notificationDebug(
        'Login success. Tokens saved for session persistence.',
        {
          role: result?.user?.role,
        },
      );

      // Role-based redirection
      const routes = {
        SUPER_ADMIN: '/admin',
        PHARMACY_ADMIN: '/pharmacy',
        DOCTOR: '/doctor',
        REGISTERED_USER: '/user',
      };

      router.replace(routes[result.user.role] || '/');
    } catch (err) {
      notificationError(
        'Login failed before notification setup.',
        err?.message || err,
      );
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    isLoading,
    error,
    handleLogin,
  };
};
