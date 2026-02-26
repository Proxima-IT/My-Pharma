import { CART_ENDPOINTS } from '@/app/(user)/lib/apiConfig';

/**
 * Pure API functions for Cart management
 */

// GET /api/cart/
export const fetchCartApi = async token => {
  const response = await fetch(CART_ENDPOINTS.BASE, {
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

// POST /api/cart/add/
export const addToCartApi = async (token, productId, quantity) => {
  const response = await fetch(CART_ENDPOINTS.ADD, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product: productId,
      quantity: quantity,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to add item to cart');
  }
  return data;
};

// PATCH /api/cart/items/{id}/
export const updateCartItemApi = async (token, itemId, quantity) => {
  const response = await fetch(`${CART_ENDPOINTS.ITEMS}${itemId}/`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      quantity: quantity,
    }),
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
    throw new Error(data.detail || 'Failed to place order');
  }
  return data;
};
