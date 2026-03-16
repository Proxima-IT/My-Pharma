'use client';

import { useState, useCallback } from 'react';
import { prescriptionAdminApi } from '../api/prescriptionAdminApi';

/**
 * My Pharma - Admin Prescription Management Hook
 * Manages state for reviewing, verifying, and assigning products to prescription orders.
 */
export const usePrescriptionAdmin = () => {
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

  return {
    prescriptions,
    prescriptionDetails,
    loading,
    isUpdating,
    error,
    fetchPrescriptions,
    fetchPrescriptionDetails,
    verifyRx,
    removeRx,
  };
};
