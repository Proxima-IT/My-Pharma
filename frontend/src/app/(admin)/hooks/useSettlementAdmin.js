import { useState, useEffect, useCallback } from 'react';
import { settlementAdminApi } from '../api/settlementAdminApi';

/**
 * My Pharma - Super Admin Settlement Hook
 * Manages state for financial settlements, including pagination, filtering, and transaction actions.
 */
export const useSettlementAdmin = token => {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [filters, setFilters] = useState({
    page: 1,
    payment_method: '',
    payment_status: '',
    status: '',
    search: '',
  });

  const fetchSettlements = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      // Remove empty strings from filters to keep URL clean
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== ''),
      );
      const data = await settlementAdminApi.getSettlements(
        token,
        activeFilters,
      );
      setSettlements(data.results);
      setCount(data.count);
    } catch (err) {
      setError(err.message || 'Failed to load settlements');
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  useEffect(() => {
    fetchSettlements();
  }, [fetchSettlements]);

  const updateFilters = newFilters => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1,
    }));
  };

  const handleAction = async (actionType, id, data) => {
    if (!token) return;
    setActionLoading(true);
    setError(null);
    try {
      let result;
      switch (actionType) {
        case 'deposit':
          result = await settlementAdminApi.recordCashDeposit(token, id, data);
          break;
        case 'payout':
          result = await settlementAdminApi.recordPayout(token, id, data);
          break;
        case 'refund':
          result = await settlementAdminApi.recordRefund(token, id, data);
          break;
        default:
          throw new Error('Invalid action type');
      }
      // Refresh the list to show updated statuses and amounts
      await fetchSettlements();
      return result;
    } catch (err) {
      const errorMessage = err.detail || JSON.stringify(err);
      setError(errorMessage);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const nextPage = () => {
    if (filters.page * 10 < count) {
      updateFilters({ page: filters.page + 1 });
    }
  };

  const prevPage = () => {
    if (filters.page > 1) {
      updateFilters({ page: filters.page - 1 });
    }
  };

  return {
    settlements,
    loading,
    actionLoading,
    error,
    count,
    filters,
    updateFilters,
    recordDeposit: (id, data) => handleAction('deposit', id, data),
    recordPayout: (id, data) => handleAction('payout', id, data),
    recordRefund: (id, data) => handleAction('refund', id, data),
    refresh: fetchSettlements,
    nextPage,
    prevPage,
  };
};
