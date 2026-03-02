# 6. Cart & Checkout Logic

Cart and checkout flow: add to cart, cart review, prescription check, address, payment, confirm. Aligned with [ADMIN_API.md](ADMIN_API.md).

---

## Checkout Process Flow

```
ADD TO CART (product selection)
    → CART REVIEW (qty adjustments)
    → RX CHECK (prescription validation for Rx items)
    → ADDRESS (delivery location)
    → PAYMENT (payment method)
    → CONFIRM (order placed)
```

---

## Cart Business Rules

| Rule | Implementation |
|------|-----------------|
| **Cart persistence** | Cart data in **localStorage** for guests (frontend); **synced to DB** for logged-in users via `/api/cart/`. |
| **Stock validation** | Real-time inventory check before adding; block if quantity exceeds available stock. |
| **Prescription items** | Items with `requires_prescription` are flagged; checkout blocked until valid (APPROVED) prescription uploaded and linked. |
| **Price lock** | Prices locked at time of adding to cart for **24 hours**; recalculated after (`price_locked_until`). |
| **Minimum order** | Minimum order value **BDT 100**; validated at order create. |
| **Delivery** | Base fee **BDT 50** within city, **BDT 100** suburbs, **BDT 150+** other; **waived for orders above BDT 500**. |

---

## API Summary

- **GET** `/api/cart/` – Get current user cart (items, subtotal, `has_prescription_items`). Registered users only.
- **POST** `/api/cart/items/` – Add item. Body: `product` (id), `quantity`. Stock validated; price locked 24h.
- **PATCH** `/api/cart/items/<product_id>/` – Update quantity. Body: `quantity`. Remove if quantity 0.
- **DELETE** `/api/cart/items/<product_id>/` – Remove item.

Place order: **POST** `/api/orders/` with `shipping_address`, `notes`, `items`, optional `prescription`, `delivery_zone`, `payment_method`. Min order BDT 100; delivery fee by zone; prescription required if cart has Rx items.

---

## References

- [ADMIN_API.md](ADMIN_API.md) – Cart and Orders endpoints
- [ORDER_WORKFLOW.md](ORDER_WORKFLOW.md) – Order status flow
- [PRESCRIPTION_MANAGEMENT.md](PRESCRIPTION_MANAGEMENT.md) – Prescription validation
