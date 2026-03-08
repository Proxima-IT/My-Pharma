import { CART_ENDPOINTS } from '@/app/(shared)/lib/apiConfig';

/**
 * Pure API functions for Cart management
 */

// GET /api/cart/
export const fetchCartApi = async (token, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = `${CART_ENDPOINTS.BASE}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch cart');
  }
  return data;
};

// POST /api/cart/add/ - Updated to accept dosage
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

  const response = await fetch(CART_ENDPOINTS.ADD, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to add item to cart');
  }
  return data;
};

// PATCH /api/cart/items/{id}/ - Updated to accept dosage
export const updateCartItemApi = async (
  token,
  itemId,
  quantity,
  dosage = null,
) => {
  const body = { quantity: quantity };
  if (dosage) body.dosage = dosage;

  const response = await fetch(`${CART_ENDPOINTS.ITEMS}${itemId}/`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to update cart quantity');
  }
  return data;
};

// DELETE /api/cart/items/{id}/
export const removeFromCartApi = async (token, itemId) => {
  const response = await fetch(`${CART_ENDPOINTS.ITEMS}${itemId}/`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to remove item from cart');
  }
  return true;
};

// POST /api/cart/place-order/
export const placeOrderApi = async (token, orderData) => {
  const response = await fetch(CART_ENDPOINTS.PLACE_ORDER, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data.detail || JSON.stringify(data);
    throw new Error(errorMsg);
  }
  return data;
};
