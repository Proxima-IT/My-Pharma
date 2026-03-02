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
      if (!token) {
        setAddresses([]);
        setIsLoading(false);
        return;
      }

      const [addressResponse, districtList] = await Promise.all([
        addressApi.getAddresses(token),
        addressApi.getDistricts(token),
      ]);

      // Handle paginated response structure { results: [...] }
      const addressList =
        addressResponse.results ||
        (Array.isArray(addressResponse) ? addressResponse : []);

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
      await addressApi.createAddress(token, formData);
      setShowSuccess(true);
      await loadData();
      return true;
    } catch (err) {
      // Parse field-specific errors if they exist
      try {
        const parsedError = JSON.parse(err.message);
        const firstKey = Object.keys(parsedError)[0];
        setError(`${firstKey}: ${parsedError[firstKey][0]}`);
      } catch {
        setError(err.message);
      }
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

  const setDefaultAddress = async id => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('access_token');
      await addressApi.updateAddress(token, id, { is_default: true });
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
    setDefaultAddress,
    refresh: loadData,
  };
};
