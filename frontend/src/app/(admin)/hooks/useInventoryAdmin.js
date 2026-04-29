'use client';
import { useState, useCallback } from 'react';
import { inventoryAdminApi } from '../api/inventoryAdminApi';

/**
 * useInventoryAdmin Hook
 * Manages operational inventory state using dedicated backend endpoints.
 * Supports paginated inventory lists and focused stock/threshold updates.
 */
export const useInventoryAdmin = () => {
  const [inventory, setInventory] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(false);
  const [isPatching, setIsPatching] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch Inventory List
   * Uses GET /api/products/inventory-list/
   */
  const fetchInventory = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      // Aligned with backend's dedicated inventory-list endpoint
      const data = await inventoryAdminApi.getInventoryList(token, params);
      setInventory(data);
    } catch (err) {
      setError(err.message || 'Failed to sync inventory data.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update Inventory Settings (Stock & Threshold)
   * Uses PATCH /api/products/{slug}/inventory/
   * @param {string} slug - Product identifier
   * @param {object} updates - { quantity_in_stock, low_stock_threshold }
   */
  const updateInventorySettings = async (slug, updates) => {
    setIsPatching(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');

      // Clean updates to ensure integers are sent
      const payload = {};
      if (updates.quantity_in_stock !== undefined) {
        payload.quantity_in_stock = parseInt(updates.quantity_in_stock);
      }
      if (updates.low_stock_threshold !== undefined) {
        payload.low_stock_threshold = parseInt(updates.low_stock_threshold);
      }

      const updatedItem = await inventoryAdminApi.patchStock(
        token,
        slug,
        payload,
      );

      // Self-healing UI: Update local state without full re-fetch
      setInventory(prev => ({
        ...prev,
        results: prev.results.map(item =>
          item.slug === slug ? { ...item, ...updatedItem } : item,
        ),
      }));
      return true;
    } catch (err) {
      setError(err.message || 'Failed to update inventory settings.');
      return false;
    } finally {
      setIsPatching(false);
    }
  };

  /**
   * Global Operational Stats
   * Calculated based on current inventory batch for dashboard visualization.
   */
  const stats = {
    totalItems: inventory.count,
    outOfStock:
      inventory.results?.filter(i => i.quantity_in_stock <= 0).length || 0,
    // Uses the new backend is_low_stock flag for accuracy
    lowStock: inventory.results?.filter(i => i.is_low_stock).length || 0,
    totalValue:
      inventory.results?.reduce(
        (acc, i) => acc + parseFloat(i.price || 0) * (i.quantity_in_stock || 0),
        0,
      ) || 0,
  };

  return {
    inventory,
    loading,
    isPatching,
    error,
    stats,
    fetchInventory,
    updateInventorySettings, // Renamed from updateStockLevel to reflect broader capability
    updateStockLevel: (slug, qty) =>
      updateInventorySettings(slug, { quantity_in_stock: qty }), // Compatibility alias
  };
};
