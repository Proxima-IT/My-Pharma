'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { confirmPasswordResetApi } from '../api/resetPasswordApi';

export const useResetPassword = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const token = sessionStorage.getItem('reset_token');
    if (!token) {
      router.replace('/forgot-password');
    }
  }, [router]);

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem('reset_token');
      await confirmPasswordResetApi({
        registration_token: token,
        new_password: formData.password
      });

      sessionStorage.clear();
      router.push('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData, setFormData,
    showPassword, setShowPassword,
    showConfirmPassword, setShowConfirmPassword,
    isLoading, error,
    handleResetSubmit
  };
};