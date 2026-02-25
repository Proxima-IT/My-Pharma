'use client';
import { useState, useEffect, useCallback } from 'react';
import { addressApi } from '../api/addressApi';

export const useAddress = () => {
  const [addresses, setAddresses] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const [addressList, districtList] = await Promise.all([
        addressApi.getAddresses(token),
        addressApi.getDistricts(token).catch(() => []), // Fallback if districts endpoint fails
      ]);

      setAddresses(addressList);
      setDistricts(districtList);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addAddress = async formData => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Authentication required');

      console.log('Sending Address Data:', formData); // Debugging line

      const result = await addressApi.createAddress(token, formData);

      if (result) {
        setShowSuccess(true);
        await loadData();
        return true;
      }
    } catch (err) {
      console.error('Add Address Hook Error:', err);
      setError(err.message);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const removeAddress = async id => {
    try {
      const token = localStorage.getItem('access_token');
      await addressApi.deleteAddress(token, id);
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const setAsDefault = async id => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('access_token');
      await addressApi.updateAddress(token, id, { is_default: true });
      setShowSuccess(true);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    addresses,
    districts,
    isLoading,
    isUpdating,
    error,
    showSuccess,
    setShowSuccess,
    addAddress,
    removeAddress,
    setAsDefault,
    refresh: loadData,
  };
};
