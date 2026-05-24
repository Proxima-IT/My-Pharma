'use client';

import { useState, useCallback } from 'react';
import { prescriptionAdminApi } from '../api/prescriptionAdminApi';
import { useAdminContext } from '../context/AdminContext';

/**
 * My Pharma - Admin Prescription Management Hook
 * Manages state for reviewing, verifying, and assigning products to prescription orders.
 */
export const usePrescriptionAdmin = () => {
  const { refreshCounts } = useAdminContext();
  const [prescriptions, setPrescriptions] = useState({ results: [], count: 0 });
  const [prescriptionDetails, setPrescriptionDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all prescription requests
   */
  const fetchPrescriptions = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Unauthorized');

      const data = await prescriptionAdminApi.getPrescriptions(token, params);
      setPrescriptions(data);

      // 🟢 Automatic Bulk Seen logic for active pagination page (mirrors useAdminOrders).
      // Uses Promise.all to ensure backend persistence before triggering a global count refresh.
      const unseenIds =
        data.results?.filter(rx => !rx.is_seen).map(rx => rx.id) || [];
      if (unseenIds.length > 0) {
        await Promise.all(
          unseenIds.map(id =>
            prescriptionAdminApi
              .updatePrescription(token, id, { is_seen: true })
              .catch(err =>
                console.error(`Failed to mark prescription ${id} as seen`, err),
              ),
          ),
        );

        // Optimistic UI Update: Ensure local state reflects "seen" immediately
        setPrescriptions(prev => ({
          ...prev,
          results: prev.results.map(rx => ({ ...rx, is_seen: true })),
        }));

        // Refresh global counts only AFTER Promise.all ensures DB state is updated.
        refreshCounts();
      }
    } catch (err) {
      setError(err.message || 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch details for a specific prescription review
   */
  const fetchPrescriptionDetails = useCallback(async id => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Unauthorized');

      const data = await prescriptionAdminApi.getPrescriptionById(token, id);
      setPrescriptionDetails(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load prescription details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Verify (Approve) or Reject a prescription
   * Used to assign products and quantities to the order.
   * @param {number} id
   * @param {Object} data - { status, notes, items, doctor_name, etc. }
   */
  const verifyRx = async (id, data) => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Unauthorized');

      const updatedRx = await prescriptionAdminApi.verifyPrescription(
        token,
        id,
        data,
      );

      // Update local state
      setPrescriptionDetails(updatedRx);
      setPrescriptions(prev => ({
        ...prev,
        results: prev.results.map(rx => (rx.id === id ? updatedRx : rx)),
      }));

      // Synchronize global counts in the context bus after verification action.
      refreshCounts();

      return true;
    } catch (err) {
      // Extract detail from backend error object if available
      const msg =
        err.detail ||
        (typeof err === 'object' ? 'Validation error occurred' : err.message);
      setError(msg);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Delete a prescription request
   */
  const removeRx = async id => {
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await prescriptionAdminApi.deletePrescription(token, id);

      setPrescriptions(prev => ({
        ...prev,
        results: prev.results.filter(rx => rx.id !== id),
        count: prev.count - 1,
      }));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  /**
   * Update a prescription's fields (e.g. is_seen)
   * Used for marking individual prescriptions as seen on detail page arrival.
   */
  const updatePrescription = async (id, payload) => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Unauthorized');

      const updatedRx = await prescriptionAdminApi.updatePrescription(
        token,
        id,
        payload,
      );

      // Update local state
      setPrescriptionDetails(updatedRx);
      setPrescriptions(prev => ({
        ...prev,
        results: prev.results.map(rx => (rx.id === id ? updatedRx : rx)),
      }));

      // Synchronize global counts after seen update.
      refreshCounts();

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    prescriptions,
    prescriptionDetails,
    loading,
    isUpdating,
    error,
    fetchPrescriptions,
    fetchPrescriptionDetails,
    verifyRx,
    updatePrescription,
    removeRx,
  };
};
