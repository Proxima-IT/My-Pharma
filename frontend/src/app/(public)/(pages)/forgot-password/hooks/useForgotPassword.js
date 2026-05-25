'use client';
import { useState } from 'react';
import { requestPasswordResetApi } from '../api/forgotPasswordApi';

export const useForgotPassword = () => {
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

    try {
      await requestPasswordResetApi(email);
      setIsSuccess(true);
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
    isSuccess,
    error,
    methodError,
    handleRequestReset,
    triggerMethodError,
  };
};
