'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestOtpApi } from '../api/registerApi';

export const useRegister = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const handleStartRegistration = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const identifier = formData.email.trim();
    const isEmail = identifier.includes('@');

    try {
      // 1. Request OTP from Backend
      await requestOtpApi(identifier, 'register');

      // 2. Store details in sessionStorage to "remember" them after redirect
      // These will be used in the verify step to complete the registration
      sessionStorage.setItem('temp_reg_name', formData.fullName);
      sessionStorage.setItem('temp_reg_email', identifier);
      sessionStorage.setItem('temp_reg_type', isEmail ? 'email' : 'phone');
      sessionStorage.setItem('temp_reg_password', formData.password);

      // 3. Redirect to the separate OTP verification page
      router.push('/register/verify');
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
    setError,
    handleStartRegistration,
  };
};
