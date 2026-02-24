# 7. Order Management Workflow

Order status state machine and actions by status. Aligned with [ADMIN_API.md](ADMIN_API.md).

---

## Order Status State Machine

```
PLACED → VERIFIED → PACKED → SHIPPED → DELIVERED

CANCELLED (allowed before SHIPPED status)
```

| Status | Description |
|--------|-------------|
| **PLACED** | Order placed; awaiting verification (e.g. Rx check). |
| **VERIFIED** | Verified (e.g. prescription verified); ready to pack. |
| **PACKED** | Packed; ready to ship. |
| **SHIPPED** | Shipped; in transit. |
| **DELIVERED** | Delivered to customer. |
| **CANCELLED** | Cancelled (only before SHIPPED). |

---

## Order Actions by Status

| Status | User actions | Admin actions | System actions |
|--------|--------------|---------------|----------------|
| **Placed** | Cancel, Track | Verify Rx, Cancel | Send confirmation |
| **Verified** | Cancel, Track | Pack, Cancel | Update inventory |
| **Packed** | Track | Ship, Cancel | Generate invoice |
| **Shipped** | Track | Mark Delivered | Send tracking updates |
| **Delivered** | Rate, Return* | Process Return | Request review |

\*Returns allowed within **7 days** for **unopened items** only (see constants: `RETURN_ALLOWED_DAYS`).

---

## Backend Implementation

- **Order model:** `status` one of PLACED, VERIFIED, PACKED, SHIPPED, DELIVERED, CANCELLED.
- **User cancel:** PATCH order with `status=CANCELLED` allowed only when status is PLACED, VERIFIED, or PACKED (`can_cancel_order()`).
- **Admin:** Pharmacy/Super can set any status via PATCH `/api/orders/{id}/`.
- **Returns:** Logic (7 days, unopened) implemented in business rules; return processing is admin action.

---

## References

- [ADMIN_API.md](ADMIN_API.md) – Orders endpoints
- [CART_CHECKOUT.md](CART_CHECKOUT.md) – Checkout flow
- [PAYMENT_LOGIC.md](PAYMENT_LOGIC.md) – Payment flow
