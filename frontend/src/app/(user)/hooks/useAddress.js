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

      // FIXED: Handle paginated response structure
      // If the backend returns { results: [...] }, use that. Otherwise use the raw array.
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

  const handleAddAddress = async formData => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await addressApi.createAddress(token, formData);
      setShowSuccess(true);
      await loadData();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveAddress = async id => {
    try {
      const token = localStorage.getItem('access_token');
      await addressApi.deleteAddress(token, id);
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSetDefault = async (id, isDefaultValue = true) => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('access_token');
      await addressApi.updateAddress(token, id, { is_default: isDefaultValue });
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
    handleAddAddress,
    handleRemoveAddress,
    handleSetDefault,
    refresh: loadData,
  };
};
