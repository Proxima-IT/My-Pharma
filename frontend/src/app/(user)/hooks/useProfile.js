'use client';
import { useState, useEffect, useCallback } from 'react';
import { 
  fetchProfileApi, 
  updateProfileApi 
} from '../api/profileApi';

export const useProfile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Verification States
  const [verifyingType, setVerifyingType] = useState(null); // 'email' or 'phone'
  const [verificationStep, setVerificationStep] = useState(1); // 1: Input, 2: OTP
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

  const [initialData, setInitialData] = useState({});

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const data = await fetchProfileApi(token);
      const mappedData = {
        username: data.username || '',
        email: data.email || '',
        phone: data.phone || '',
        gender: data.gender || '',
        date_of_birth: data.date_of_birth || '',
        avatar_preview: data.profile_picture || null,
      };
      setFormData(mappedData);
      setInitialData(mappedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    setIsUpdating(true);
    setError(null);

    const token = localStorage.getItem('access_token');
    const data = new FormData();
    
    // Use keys exactly as defined in API Docs
    data.append('username', formData.username);
    data.append('gender', formData.gender);
    data.append('date_of_birth', formData.date_of_birth);
    data.append('address', formData.address || '');

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

  const requestVerification = async (type) => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const value = formData[type];
      // As per docs: Send only email or only phone to /me/ to trigger OTP
      const data = new FormData();
      data.append(type, value);
      
      await updateProfileApi(token, data);
      setVerifyingType(type);
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
      const token = localStorage.getItem('access_token');
      const data = new FormData();
      data.append(verifyingType, formData[verifyingType]);
      data.append('otp', otp);
      
      // As per docs: Send value + otp to /me/ to confirm and save
      await updateProfileApi(token, data);

      setVerifyingType(null);
      setVerificationStep(1);
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
    formData, setFormData, initialData,
    isLoading, isUpdating, error, showSuccess, setShowSuccess,
    verifyingType, setVerifyingType,
    verificationStep, setVerificationStep,
    otp, setOtp,
    handleUpdate, requestVerification, verifyCode
  };
};