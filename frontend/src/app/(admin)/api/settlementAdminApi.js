import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

/**
 * My Pharma - Super Admin Settlement Management API
 * Handles financial ledgers, cash deposits, payouts, and refunds for orders.
 */
export const settlementAdminApi = {
  /**
   * List all order settlements with pagination and filtering.
   * Filters: page, payment_method, payment_status, search, status.
   */
  getSettlements: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/settlements/?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch settlements');
    return res.json();
  },

  /**
   * Retrieve details for a specific order settlement.
   */
  getSettlementById: async (token, id) => {
    const res = await fetch(`${API_BASE_URL}/settlements/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to fetch settlement with ID: ${id}`);
    return res.json();
  },

  /**
   * Record a cash deposit (Primarily for COD orders).
   * Updates status to CASH_DEPOSITED.
   */
  recordCashDeposit: async (token, id, data) => {
    const res = await fetch(`${API_BASE_URL}/settlements/${id}/cash-deposit/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  /**
   * Record a payout to the pharmacy.
   * Updates status to SETTLED.
   */
  recordPayout: async (token, id, data) => {
    const res = await fetch(`${API_BASE_URL}/settlements/${id}/payout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  /**
   * Record a refund for a settlement.
   * Updates status to REFUNDED.
   */
  recordRefund: async (token, id, data) => {
    const res = await fetch(`${API_BASE_URL}/settlements/${id}/refund/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
};
