'use client';
import { useState, useCallback } from 'react';
import { inventoryAdminApi } from '../api/inventoryAdminApi';

export const useInventoryAdmin = () => {
  const [inventory, setInventory] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(false);
  const [isPatching, setIsPatching] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch Inventory with Search/Pagination
  const fetchInventory = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const data = await inventoryAdminApi.getInventoryList(token, params);
      setInventory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Inline Stock Update (Self-Healing UI)
  const updateStockLevel = async (slug, newQty) => {
    setIsPatching(true);
    try {
      const token = localStorage.getItem('access_token');
      const updatedItem = await inventoryAdminApi.patchStock(token, slug, {
        quantity_in_stock: parseInt(newQty),
      });

      // Update local state immediately so the numbers change without a full refresh
      setInventory(prev => ({
        ...prev,
        results: prev.results.map(item =>
          item.slug === slug ? { ...item, ...updatedItem } : item,
        ),
      }));
      return true;
    } catch (err) {
      setError('Failed to update stock.');
      return false;
    } finally {
      setIsPatching(false);
    }
  };

  // 3. Global Stats Calculation (Frontend-side)
  const stats = {
    totalItems: inventory.count,
    outOfStock:
      inventory.results?.filter(i => i.quantity_in_stock <= 0).length || 0,
    lowStock: inventory.results?.filter(i => i.is_low_stock).length || 0,
    totalValue:
      inventory.results?.reduce(
        (acc, i) => acc + parseFloat(i.price) * i.quantity_in_stock,
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
    updateStockLevel,
  };
};
