'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { orderAdminApi } from '../api/orderAdminApi';
import { prescriptionAdminApi } from '../api/prescriptionAdminApi';

/**
 * Akkhar-Labs :: Admin Context
 * ==============================
 * Global Notification Bus for the Admin Panel.
 * Synchronizes real-time unseen counts across the sidebar,
 * dashboard stats, and table views.
 */

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [unseenOrderCount, setUnseenOrderCount] = useState(0);
  const [unseenPrescriptionCount, setUnseenPrescriptionCount] = useState(0);
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);

  /**
   * refreshCounts
   * Fetches the global "Unseen" state directly from the backend.
   * Moving from frontend-length counting to Server-Side Truth.
   */
  const refreshCounts = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setIsLoadingCounts(true);
    try {
      // 1. Fetch global unseen count for Standard Orders
      const orderData = await orderAdminApi.getOrders(token, {
        is_seen: false,
        page_size: 1,
      });

      // 2. Fetch global unseen count for Prescription Orders
      const rxData = await prescriptionAdminApi.getPrescriptions(token, {
        is_seen: false,
        page_size: 1,
      });

      setUnseenOrderCount(orderData.count || 0);
      setUnseenPrescriptionCount(rxData.count || 0);
    } catch (err) {
      console.error('Failed to synchronize global admin counts:', err);
    } finally {
      setIsLoadingCounts(false);
    }
  }, []);

  // Initial synchronization upon panel initialization
  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  return (
    <AdminContext.Provider
      value={{
        unseenOrderCount,
        unseenPrescriptionCount,
        isLoadingCounts,
        refreshCounts,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminContext must be used within an AdminProvider');
  }
  return context;
};
