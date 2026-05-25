# 6. Cart & Checkout Logic

Cart and checkout flow for authenticated users. This document reflects the current cart APIs (`/api/cart/*`) and combo-cart behavior.

---

## Checkout Process Flow

```text
ADD TO CART (product or combo)
  -> CART REVIEW (quantity, coupon)
  -> ADDRESS + DELIVERY METHOD
  -> PAYMENT METHOD
  -> PLACE ORDER
```

---

## Cart Business Rules

| Rule | Implementation |
|------|----------------|
| Cart owner | One cart per registered user (`/api/cart/`). |
| Item type | Cart line can be either a single `product` or a `combo` (not both). |
| Combo in cart | Combo appears as one cart line item (`item_type: COMBO`) on user APIs. |
| Combo price | Combo line `price_at_order` is determined at add time by `Combo.get_cart_price()`: `discount_price` (if set) → `custom_price` (if set) → sum of linked `Product.price` values (legacy fallback). Admin-set `discount_price` / `custom_price` on the Combo model control what is charged. |
| Stock validation | Stock is validated on add, quantity update, and place-order. Combo checks all linked products. |
| Coupon | Coupon discount is persisted by updating `price_at_order` on cart items. |
| Minimum order | Minimum order value BDT 100 is validated before place-order. |
| Order creation | Combo lines are expanded into normal product `OrderItem` rows at checkout (admin order flow unchanged). |

**Admin Pricing Override Note:** Pharmacy/Super admins can now set `custom_price` and/or `discount_price` directly on a Combo via the admin UI or API. When `discount_price` is populated it becomes the authoritative unit price for all *future* cart additions of that combo. Existing carts with the combo keep their previously locked prices. The marketing `price`/`original_price` fields are never used for cart or order totals.

---

## API Summary

- `GET /api/cart/`
  - Returns current user's cart with `items` and `summary`.

- `POST /api/cart/add/`
  - Add product or combo.
  - Body (product): `{ "product": <id>, "quantity": <int>, "dosage": "optional" }`
  - Body (combo): `{ "combo": <id>, "quantity": <int> }`
  - Exactly one of `product` or `combo` is required.

- `POST /api/cart/apply-coupon/`
  - Body: `{ "coupon_code": "SAVE10" }`
  - Persists coupon-adjusted pricing in cart lines.

- `POST /api/cart/remove-coupon/`
  - Removes applied coupon and restores original locked line prices.

- `PATCH /api/cart/items/{id}/`
  - Body: `{ "quantity": <int> }` or `{ "dosage": "..." }`.
  - `quantity: 0` removes the item.
  - Dosage updates are only valid for product lines (not combo lines).

- `DELETE /api/cart/items/{id}/`
  - Removes one cart line.

- `POST /api/cart/place-order/`
  - Body:
    - `shipping_address_id` (required)
    - `delivery_method_id` (optional)
    - `payment_method` (optional, default COD)
    - `coupon_code` (optional)
    - `notes` (optional)
  - Creates order, decrements stock, clears cart.
  - If online payment method is selected, returns SSLCommerz gateway URL.

---

## Direct Order (Buy Now)

For single-product checkout without cart:

- `POST /api/orders/buy-now-preview/`
- `POST /api/orders/buy-now/`

---

## References

- [ADMIN_API.md](ADMIN_API.md)
- [ORDER_WORKFLOW.md](ORDER_WORKFLOW.md)
- [PAYMENT_LOGIC.md](PAYMENT_LOGIC.md)
