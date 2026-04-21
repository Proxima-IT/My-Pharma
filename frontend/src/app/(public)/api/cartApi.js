import { CART_ENDPOINTS, API_BASE_URL } from '@/app/(shared)/lib/apiConfig';
import {
  authenticatedFetch,
  parseJsonResponse,
} from '@/app/(shared)/lib/authenticatedApi';

/**
 * Pure API functions for Cart and Delivery management.
 * Updated to support dynamic delivery options (Standard, Same Day, Express).
 */

const getApiErrorMessage = (data, fallback) => {
  if (!data || typeof data !== 'object') return fallback;
  if (typeof data.detail === 'string' && data.detail.trim()) return data.detail;

  for (const value of Object.values(data)) {
    if (typeof value === 'string' && value.trim()) return value;
    if (Array.isArray(value) && value.length > 0) {
      const first = value[0];
      if (typeof first === 'string' && first.trim()) return first;
    }
  }

  return fallback;
};

/**
 * GET /api/cart/
 * Supports query params like ?delivery_duration_id= to fetch updated summary.
 */
export const fetchCartApi = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = `${CART_ENDPOINTS.BASE}${queryString ? `?${queryString}` : ''}`;

  const response = await authenticatedFetch(url, {
    method: 'GET',
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch cart');
  }
  return data;
};

/**
 * GET /api/delivery-durations/
 * Fetches available delivery options (Standard, Same Day, Express).
 * Updated: Now accepts token for authenticated retrieval.
 */
export const fetchDeliveryDurationsApi = async () => {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/delivery-durations/`,
    {
      method: 'GET',
    },
  );

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error('Failed to fetch delivery options');
  }
  return data;
};

// POST /api/cart/add/
export const addToCartApi = async (productId, quantity, dosage = null) => {
  const body = {
    product: productId,
    quantity: quantity,
  };
  if (dosage) body.dosage = dosage;

  const response = await authenticatedFetch(CART_ENDPOINTS.ADD, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, 'Failed to add item to cart'));
  }
  return data;
};

// PATCH /api/cart/items/{id}/
export const updateCartItemApi = async (itemId, quantity, dosage = null) => {
  const body = { quantity: quantity };
  if (dosage) body.dosage = dosage;

  const response = await authenticatedFetch(
    `${CART_ENDPOINTS.ITEMS}${itemId}/`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  );

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, 'Failed to update cart quantity'));
  }
  return data;
};

// DELETE /api/cart/items/{id}/
export const removeFromCartApi = async itemId => {
  const response = await authenticatedFetch(
    `${CART_ENDPOINTS.ITEMS}${itemId}/`,
    {
      method: 'DELETE',
    },
  );

  if (!response.ok) {
    const data = await parseJsonResponse(response);
    throw new Error(
      getApiErrorMessage(data, 'Failed to remove item from cart'),
    );
  }
  return true;
};

/**
 * POST /api/cart/place-order/
 * Accepts delivery_duration_id in orderData.
 */
export const placeOrderApi = async orderData => {
  const response = await authenticatedFetch(CART_ENDPOINTS.PLACE_ORDER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, 'Failed to place order'));
  }
  return data;
};

// POST /api/cart/apply-coupon/
export const applyCartCouponApi = async code => {
  const response = await authenticatedFetch(
    `${CART_ENDPOINTS.BASE}apply-coupon/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ coupon_code: code }),
    },
  );

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, 'Invalid or expired coupon code'));
  }
  return data;
};

// POST /api/cart/remove-coupon/
export const removeCartCouponApi = async () => {
  const response = await authenticatedFetch(
    `${CART_ENDPOINTS.BASE}remove-coupon/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, 'Failed to remove coupon'));
  }
  return data;
};
