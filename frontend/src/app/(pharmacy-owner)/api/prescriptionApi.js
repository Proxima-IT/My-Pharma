import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

/**
 * Pure API functions for Pharmacy Prescription Management
 * Handles the verification workflow for prescription-based orders.
 */

/**
 * List all prescriptions for the pharmacy
 * @param {string} token - Pharmacy owner access token
 * @param {Object} params - { page, status }
 */
export const fetchPharmacyPrescriptionsApi = async (token, params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null && v !== ''),
  );

  const queryString = new URLSearchParams(cleanParams).toString();
  const url = `${API_BASE_URL}/prescriptions/${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch prescriptions');
  }
  return data;
};

/**
 * Get details for a specific prescription review
 * @param {string} token
 * @param {number} id
 */
export const fetchPharmacyPrescriptionDetailsApi = async (token, id) => {
  const response = await fetch(`${API_BASE_URL}/prescriptions/${id}/`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch prescription details');
  }
  return data;
};

/**
 * Verify or Reject a prescription
 * This is where the pharmacist adds products and quantities to the order.
 * @param {string} token
 * @param {number} id
 * @param {Object} payload - { status, notes, doctor_name, doctor_reg_number, items: [...] }
 */
export const verifyPharmacyPrescriptionApi = async (token, id, payload) => {
  const response = await fetch(`${API_BASE_URL}/prescriptions/${id}/verify/`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    // Extract nested errors if items validation fails
    const errorMsg =
      data.detail ||
      (data.items ? 'Invalid items provided' : JSON.stringify(data));
    throw new Error(errorMsg);
  }
  return data;
};

/**
 * Delete a prescription record
 * @param {string} token
 * @param {number} id
 */
export const deletePharmacyPrescriptionApi = async (token, id) => {
  const response = await fetch(`${API_BASE_URL}/prescriptions/${id}/`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to delete prescription');
  }
  return true;
};
