# 8. Payment Processing Logic

Payment methods (MVP – Bangladesh) and processing flow. Aligned with [ADMIN_API.md](ADMIN_API.md).

---

## Payment Methods (MVP – Bangladesh)

| Method | Description | Transaction fee |
|--------|-------------|-----------------|
| **Cash on Delivery (COD)** | Pay when you receive | No fee |
| **bKash** | Mobile wallet payment | 1.5% |
| **Nagad** | Mobile wallet payment | 1.5% |

---

## Payment Processing Flow

| Step | Process description |
|------|----------------------|
| **1. Initiate** | User selects payment method; system calculates total with fees (delivery + payment fee). |
| **2. Validate** | Check order total, verify cart items still in stock, confirm address. |
| **3. Process** | **COD:** Reserve order (create PaymentTransaction PENDING → SUCCESS). **bKash/Nagad:** Redirect to payment gateway. |
| **4. Confirm** | Receive webhook/callback from payment gateway with transaction ID. |
| **5. Record** | Log transaction in `payment_transactions` table with status (SUCCESS/FAILED). |
| **6. Complete** | Order status already PLACED at create; send confirmation to user (frontend/email). |

---

## Backend Implementation

- **Order create:** `payment_method` (COD, BKASH, NAGAD); `delivery_fee` and payment fee calculated; `PaymentTransaction` created (COD: PENDING then SUCCESS; gateway: INITIATED).
- **Webhook:** **POST** `/api/payments/webhook/` – Body: `transaction_id`, `order_id`, `status`. Updates `PaymentTransaction` (gateway_transaction_id, status SUCCESS/FAILED). Permission: AllowAny (gateway callback).
- **Constants:** `core.constants`: `PAYMENT_FEE_RATES` (COD 0, bKash/Nagad 1.5%).

---

## References

- [ADMIN_API.md](ADMIN_API.md) – Orders and payment webhook
- [ORDER_WORKFLOW.md](ORDER_WORKFLOW.md) – Order status
