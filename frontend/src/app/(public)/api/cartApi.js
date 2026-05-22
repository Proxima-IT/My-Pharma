import {
  CART_ENDPOINTS,
  API_BASE_URL,
  fetchWithAuth,
  parseJsonResponse,
} from '@/app/(shared)/lib/apiConfig';

/**
 * Pure API functions for Cart and Delivery management.
 * Refactored: Uses fetchWithAuth interceptor for silent token refresh and session persistence.
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
export const fetchCartApi = async (token, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = `${CART_ENDPOINTS.BASE}${queryString ? `?${queryString}` : ''}`;

  const response = await fetchWithAuth(url, {
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
 */
export const fetchDeliveryMethodsApi = async () => {
  const response = await fetchWithAuth(`${API_BASE_URL}/delivery-methods/`, {
    method: 'GET',
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error('Failed to fetch delivery methods');
  }
  return data;
};

/**
 * POST /api/cart/add/
 */
export const addToCartApi = async (
  token,
  productId,
  quantity,
  dosage = null,
) => {
  const body = {
    product: productId,
    quantity: quantity,
  };
  if (dosage) body.dosage = dosage;

  const response = await fetchWithAuth(CART_ENDPOINTS.ADD, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, 'Failed to add item to cart'));
  }
  return data;
};

/**
 * PATCH /api/cart/items/{id}/
 */
export const updateCartItemApi = async (
  token,
  itemId,
  quantity,
  dosage = null,
) => {
  const body = { quantity: quantity };
  if (dosage) body.dosage = dosage;

  const response = await fetchWithAuth(`${CART_ENDPOINTS.ITEMS}${itemId}/`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, 'Failed to update cart quantity'));
  }
  return data;
};

/**
 * DELETE /api/cart/items/{id}/
 */
export const removeFromCartApi = async (token, itemId) => {
  const response = await fetchWithAuth(`${CART_ENDPOINTS.ITEMS}${itemId}/`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const data = await parseJsonResponse(response, {});
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
export const placeOrderApi = async (token, orderData) => {
  const response = await fetchWithAuth(CART_ENDPOINTS.PLACE_ORDER, {
    method: 'POST',
    body: JSON.stringify(orderData),
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, 'Failed to place order'));
  }
  return data;
};

/**
 * POST /api/cart/apply-coupon/
 */
export const applyCartCouponApi = async (token, code) => {
  const response = await fetchWithAuth(`${CART_ENDPOINTS.BASE}apply-coupon/`, {
    method: 'POST',
    body: JSON.stringify({ coupon_code: code }),
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, 'Invalid or expired coupon code'));
  }
  return data;
};

/**
 * POST /api/cart/remove-coupon/
 */
export const removeCartCouponApi = async token => {
  const response = await fetchWithAuth(`${CART_ENDPOINTS.BASE}remove-coupon/`, {
    method: 'POST',
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, 'Failed to remove coupon'));
  }
  return data;
};

/**
 * POST /api/orders/buy-now-preview/
 */
export const buyNowPreviewApi = async orderData => {
  const response = await fetchWithAuth(`${API_BASE_URL}/orders/buy-now-preview/`, {
    method: 'POST',
    body: JSON.stringify(orderData),
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, 'Failed to preview order'));
  }
  return data;
};

/**
 * POST /api/orders/buy-now/
 */
export const buyNowPlaceOrderApi = async orderData => {
  const response = await fetchWithAuth(`${API_BASE_URL}/orders/buy-now/`, {
    method: 'POST',
    body: JSON.stringify(orderData),
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, 'Failed to place order'));
  }
  return data;
};

/**
 * POST /api/coupons/validate/
 */
export const validateCouponApi = async (code, subtotal) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/coupons/validate/`, {
    method: 'POST',
    body: JSON.stringify({ code, subtotal }),
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, 'Failed to validate coupon'));
  }
  return data;
};
