'use client';
import { useState, useEffect, useCallback } from 'react';
import { fetchProfileApi } from '../api/profileApi';
import { updateAddressApi } from '../api/addressApi';

export const useAddress = () => {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const loadAddress = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const data = await fetchProfileApi(token);
      setAddress(data.address || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAddress();
  }, [loadAddress]);

  const saveAddress = async newAddress => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await updateAddressApi(token, newAddress);
      setAddress(newAddress);
      setShowSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const clearAddress = async () => {
    await saveAddress('');
  };

  return {
    address,
    setAddress,
    isLoading,
    isUpdating,
    error,
    showSuccess,
    setShowSuccess,
    saveAddress,
    clearAddress,
  };
};
