'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestPasswordResetApi } from '../api/forgotPasswordApi';

export const useForgotPassword = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [methodError, setMethodError] = useState(null);
  const [email, setEmail] = useState('');

  const handleRequestReset = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMethodError(null);

    try {
      await requestPasswordResetApi(email);
      // Store email for the verification step
      sessionStorage.setItem('reset_email', email);
      // Redirect to verification page
      router.push('/forgot-password/verify');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerMethodError = () => {
    setMethodError('Currently no other options available');
    setTimeout(() => setMethodError(null), 3000);
  };

  return {
    email,
    setEmail,
    isLoading,
    error,
    methodError,
    handleRequestReset,
    triggerMethodError,
  };
};
