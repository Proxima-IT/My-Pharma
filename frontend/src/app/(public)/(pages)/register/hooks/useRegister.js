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

    try {
      // 1. Request OTP from Backend
      await requestOtpApi(formData.email);

      // 2. Store details in sessionStorage to "remember" them after redirect
      // These will be used in the verify step to complete the registration
      sessionStorage.setItem('temp_reg_name', formData.fullName);
      sessionStorage.setItem('temp_reg_email', formData.email);
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
