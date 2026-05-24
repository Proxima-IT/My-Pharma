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

      // 🟢 ARCHITECT FIX: Aligning definitions to resolve 4/11/8 mismatch.
      // As per the latest directive, Prescription counting is suppressed (set to 0) 
      // to focus strictly on Standard Order synchronization.
      setUnseenOrderCount(orderData.count || 0);
      setUnseenPrescriptionCount(0); 
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
