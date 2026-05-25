import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

/**
 * My Pharma - Admin/Pharmacy Prescription Management API
 * Handles verification, rejection, and product assignment for prescription orders.
 */
export const prescriptionAdminApi = {
  /**
   * List all prescriptions with pagination and status filters
   * @param {string} token - Admin/Pharmacy token
   * @param {Object} params - { page, status }
   */
  getPrescriptions: async (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/prescriptions/?${query}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch prescriptions');
    return response.json();
  },

  /**
   * Get details for a specific prescription
   */
  getPrescriptionById: async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/prescriptions/${id}/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Prescription not found');
    return response.json();
  },

  /**
   * Verify or Reject a prescription
   * This is the core endpoint for adding products to the order.
   * @param {Object} data - { status: 'APPROVED'|'REJECTED', notes, items: [{product: id, quantity_prescribed: int}], ... }
   */
  verifyPrescription: async (token, id, data) => {
    const response = await fetch(
      `${API_BASE_URL}/prescriptions/${id}/verify/`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    );

    const result = await response.json();
    if (!response.ok) {
      throw result;
    }
    return result;
  },

  /**
   * Update a prescription's fields (e.g. is_seen, notes)
   * Generic PATCH on the prescription resource.
   * @param {string} token
   * @param {number} id
   * @param {Object} payload - { is_seen: true, ... }
   */
  updatePrescription: async (token, id, payload) => {
    const response = await fetch(`${API_BASE_URL}/prescriptions/${id}/`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to update prescription');
    return response.json();
  },

  /**
   * Delete a prescription record
   */
  deletePrescription: async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/prescriptions/${id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to delete prescription');
    }
    return true;
  },
};
