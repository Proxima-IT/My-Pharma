'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  fetchPharmacyPrescriptionsApi,
  fetchPharmacyPrescriptionDetailsApi,
  verifyPharmacyPrescriptionApi,
  deletePharmacyPrescriptionApi,
} from '../api/prescriptionApi';

/**
 * usePharmacyPrescriptions Hook
 * Fixed: Added strict parameter cleaning to prevent sending "status=All" to the backend.
 * Backend Enums do not recognize "All", so it must be stripped from the query string.
 */
export const usePharmacyPrescriptions = (
  initialFilters = { status: 'All' },
) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescriptionDetails, setPrescriptionDetails] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState(initialFilters);

  /**
   * Load Paginated Prescriptions List
   * Cleans the "All" filter before sending the request to avoid 400 Bad Request.
   */
  const loadPrescriptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      // Construct clean parameters
      const params = { page };

      // Only add status to params if it's not "All"
      if (filters.status && filters.status !== 'All') {
        params.status = filters.status.toUpperCase();
      }

      const data = await fetchPharmacyPrescriptionsApi(token, params);

      setPrescriptions(data.results || []);
      const count = data.count || 0;
      setTotalCount(count);
      setTotalPages(Math.ceil(count / 10) || 1);
    } catch (err) {
      setError(err.message);
      setPrescriptions([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [page, filters]);

  const loadPrescriptionDetails = useCallback(async id => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const data = await fetchPharmacyPrescriptionDetailsApi(token, id);
      setPrescriptionDetails(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyRx = async (id, payload) => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Unauthorized');
      const updatedRx = await verifyPharmacyPrescriptionApi(token, id, payload);
      setPrescriptionDetails(updatedRx);
      setPrescriptions(prev => prev.map(rx => (rx.id === id ? updatedRx : rx)));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteRx = async id => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('access_token');
      await deletePharmacyPrescriptionApi(token, id);
      setPrescriptions(prev => prev.filter(rx => rx.id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFilterChange = newFilters => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page whenever filters change
  };

  useEffect(() => {
    if (!prescriptionDetails) {
      loadPrescriptions();
    }
  }, [loadPrescriptions, prescriptionDetails]);

  return {
    prescriptions,
    prescriptionDetails,
    isLoading,
    isUpdating,
    error,
    page,
    setPage,
    totalPages,
    totalCount,
    filters,
    handleFilterChange,
    loadPrescriptionDetails,
    verifyRx,
    deleteRx,
    refresh: loadPrescriptions,
  };
};
