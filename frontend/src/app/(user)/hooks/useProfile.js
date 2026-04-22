'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  fetchProfileApi,
  updateProfileApi,
  requestVerificationOtpApi,
  verifyIdentityOtpApi,
} from '../api/profileApi';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';

export const useProfile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [verifyingType, setVerifyingType] = useState(null);
  const [otp, setOtp] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    gender: '',
    date_of_birth: '',
    profile_picture: null,
    avatar_preview: null,
  });

  const [initialData, setInitialData] = useState({});

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const data = await fetchProfileApi(token);

      // Normalize profile picture URL so it loads via Next.js proxy (same-origin)
      let profilePicUrl = data.profile_picture || null;
      if (profilePicUrl) profilePicUrl = getMediaUrl(profilePicUrl);

      const mappedData = {
        fullName: data.username || '',
        username: data.username || '',
        email: data.email || '',
        phone: data.phone || '',
        gender: data.gender || '',
        date_of_birth: data.date_of_birth || '',
        avatar_preview: profilePicUrl,
      };
      setFormData(mappedData);
      setInitialData(mappedData);
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
    setShowSuccess(false);

    const token = localStorage.getItem('access_token');
    const data = new FormData();
    const [firstName, ...lastNameParts] = formData.fullName.trim().split(/\s+/);

    data.append('first_name', firstName || '');
    data.append('last_name', lastNameParts.join(' ') || '');
    data.append('username', formData.fullName);
    data.append('gender', formData.gender);
    data.append('date_of_birth', formData.date_of_birth);

    if (formData.profile_picture instanceof File) {
      data.append('profile_picture', formData.profile_picture);
    }

    try {
      await updateProfileApi(token, data);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      await loadProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const requestVerification = async type => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await requestVerificationOtpApi(token, { [type]: formData[type] });
      setVerifyingType(type);
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
      const token = localStorage.getItem('access_token');
      const payload = { [verifyingType]: formData[verifyingType], otp };
      await verifyIdentityOtpApi(token, payload);
      setVerifyingType(null);
      setOtp('');
      await loadProfile();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    formData,
    setFormData,
    initialData,
    isLoading,
    isUpdating,
    error,
    showSuccess,
    verifyingType,
    setVerifyingType,
    otp,
    setOtp,
    handleUpdate,
    requestVerification,
    verifyCode,
  };
};
