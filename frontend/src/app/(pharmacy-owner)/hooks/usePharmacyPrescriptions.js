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
 * Manages the state and logic for Pharmacy Owners to review and verify prescription orders.
 * Follows the "Sharp & Authoritative" industrial design logic.
 */
export const usePharmacyPrescriptions = (
  initialFilters = { status: 'PENDING' },
) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescriptionDetails, setPrescriptionDetails] = useState(null);

  const [isLoading, setIsLoading] = useState(false); // FIX 1: was `true`, caused premature render with null data
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState(initialFilters);

  /**
   * Load Paginated Prescriptions List
   */
  const loadPrescriptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const params = {
        page,
        ...filters,
      };

      const data = await fetchPharmacyPrescriptionsApi(token, params);

      setPrescriptions(data.results || []);
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / 10));
    } catch (err) {
      setError(err.message);
      setPrescriptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, filters]);

  /**
   * Load specific Prescription details for verification
   */
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

  /**
   * Verify (Approve/Reject) a prescription
   * Used to assign products and quantities to the order.
   */
  const verifyRx = async (id, payload) => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Unauthorized');

      const updatedRx = await verifyPharmacyPrescriptionApi(token, id, payload);

      // Update local state to reflect changes immediately
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

  /**
   * Delete a prescription record
   */
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
    setPage(1);
  };

  // FIX 2: Guard added — only auto-load the list when NOT on a detail page
  // (i.e. when prescriptionDetails is not being actively loaded).
  // This prevents loadPrescriptions() from racing against loadPrescriptionDetails()
  // and stomping on the shared isLoading flag with stale/null prescriptionDetails state.
  useEffect(() => {
    if (!prescriptionDetails) {
      loadPrescriptions();
    }
  }, [loadPrescriptions]);

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
