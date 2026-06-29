'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestPasswordResetApi } from '../api/forgotPasswordApi';
import { isValidBDPhone } from '@/app/(shared)/lib/validation';

export const useForgotPassword = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [methodError, setMethodError] = useState(null);
  const [email, setEmail] = useState('');

  const handleRequestReset = async e => {
    e.preventDefault();
    setIsLoading(true);
    setIsSuccess(false);
    setError(null);
    setMethodError(null);

    const identifier = email.trim();
    const isEmail = identifier.includes('@');
    if (!isEmail) {
      if (!isValidBDPhone(identifier)) {
        setError('Please enter a valid Bangladeshi phone number.');
        setIsLoading(false);
        return;
      }
    } else {
      if (!/\S+@\S+\.\S+/.test(identifier)) {
        setError('Please enter a valid email address.');
        setIsLoading(false);
        return;
      }
    }
    const payload = isEmail ? { email: identifier.toLowerCase() } : { phone: identifier };

    try {
      await requestPasswordResetApi(payload);
      if (isEmail) {
        setIsSuccess(true);
      } else {
        sessionStorage.setItem('reset_identifier', identifier);
        sessionStorage.setItem('reset_type', 'phone');
        router.push('/forgot-password/verify');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerMethodError = () => {
    setMethodError('Please type your email or phone number in the input above.');
    setTimeout(() => setMethodError(null), 3000);
  };

  return {
    email,
    setEmail,
    isLoading,
    isSuccess,
    error,
    methodError,
    handleRequestReset,
    triggerMethodError,
  };
};

