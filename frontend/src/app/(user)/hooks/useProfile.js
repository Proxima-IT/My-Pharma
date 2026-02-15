'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  fetchProfileApi,
  updateProfileApi,
  requestVerificationOtpApi,
  verifyIdentityOtpApi,
} from '../api/profileApi';

export const useProfile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Verification States
  const [verifyingType, setVerifyingType] = useState(null);
  const [verificationStep, setVerificationStep] = useState(1);
  const [tempIdentifier, setTempIdentifier] = useState('');
  const [otp, setOtp] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    gender: '',
    date_of_birth: '',
    profile_picture: null,
    avatar_preview: null,
  });

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const data = await fetchProfileApi(token);
      setFormData({
        username: data.username || '',
        email: data.email || '',
        phone: data.phone || '',
        gender: data.gender || '',
        date_of_birth: data.date_of_birth || '',
        avatar_preview: data.profile_picture || null,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleUpdate = async e => {
    if (e) e.preventDefault();
    setIsUpdating(true);
    setError(null);

    const token = localStorage.getItem('access_token');
    const data = new FormData();

    data.append('username', formData.username);
    data.append('gender', formData.gender);
    data.append('date_of_birth', formData.date_of_birth);

    if (formData.email) data.append('email', formData.email);
    if (formData.phone) data.append('phone', formData.phone);

    if (formData.profile_picture instanceof File) {
      data.append('profile_picture', formData.profile_picture);
    }

    try {
      await updateProfileApi(token, data);
      setShowSuccess(true);
      await loadProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const requestVerification = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      const payload =
        verifyingType === 'email'
          ? { email: tempIdentifier }
          : { phone: tempIdentifier };
      await requestVerificationOtpApi(payload);
      setVerificationStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const verifyCode = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      const payload =
        verifyingType === 'email'
          ? { email: tempIdentifier, otp }
          : { phone: tempIdentifier, otp };

      // 1. Verify the OTP
      await verifyIdentityOtpApi(payload);

      // 2. CALL API TO CHANGE DATABASE
      const token = localStorage.getItem('access_token');
      const data = new FormData();
      data.append(verifyingType, tempIdentifier);
      await updateProfileApi(token, data);

      // 3. Reset states and show success
      setVerifyingType(null);
      setVerificationStep(1);
      setTempIdentifier('');
      setOtp('');
      await loadProfile();
      setShowSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    formData,
    setFormData,
    isLoading,
    isUpdating,
    error,
    showSuccess,
    setShowSuccess,
    verifyingType,
    setVerifyingType,
    verificationStep,
    tempIdentifier,
    setTempIdentifier,
    otp,
    setOtp,
    handleUpdate,
    requestVerification,
    verifyCode,
  };
};
