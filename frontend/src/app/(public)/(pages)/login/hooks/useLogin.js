'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginApi } from '../api/loginApi';

export const useLogin = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    keepLogin: false,
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginApi({
        email: formData.email,
        password: formData.password,
      });

      // Store tokens and user data
      localStorage.setItem('access_token', result.access);
      localStorage.setItem('user', JSON.stringify(result.user));

      // Role-based redirection
      const routes = {
        SUPER_ADMIN: '/admin',
        PHARMACY_ADMIN: '/pharmacy',
        DOCTOR: '/doctor',
        REGISTERED_USER: '/user',
      };
      
      router.replace(routes[result.user.role] || '/');
    } catch (err) {
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