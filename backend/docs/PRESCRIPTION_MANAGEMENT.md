# 5. Prescription Management Flow

Prescription ordering: **user uploads prescription images only** (no product selection). **Pharmacy admin** sees pending prescriptions, **adds required products** (prescription items), and **approves to confirm the order**; the backend then creates an **Order** for the user so they can track it. Aligned with [ADMIN_API.md](ADMIN_API.md).

---

## Prescription ordering flow

1. **User:** Uploads one or multiple prescription images, selects shipping address, medicine supply duration, and prescription note. **User does not add or select products.**
2. **Pharmacy admin:** Lists PENDING prescriptions, opens one, **adds required products** (items with product id and quantity_prescribed), and **approves** (status = APPROVED with doctor details and items).
3. **Backend:** On approve with items, creates an **Order** (linked to the prescription) with those items, reduces stock, and sets prescription status to **USED**. The user sees the order in their orders list.

---

## Prescription Status State Machine

```
UPLOADED (user submits images + details, no products)
    → PENDING (in review queue)

PENDING
    → APPROVED (admin added products and approved; Order is created, prescription → USED)
    → REJECTED (Invalid/Expired)

APPROVED (with items) → USED (Order created automatically when admin confirms)
```

| Status       | Description                                                                 |
| ------------ | --------------------------------------------------------------------------- |
| **PENDING**  | User has uploaded; in review queue. Admin adds products and approves.       |
| **APPROVED** | Admin approved with items; an Order is created and prescription becomes USED. |
| **REJECTED** | Invalid or expired; cannot be used.                                         |
| **USED**     | Order was created from this prescription; user can track it under Orders.   |

**Backend:** `PENDING → APPROVED` (with items) creates an Order and sets prescription to USED. `PENDING → REJECTED` for invalid prescriptions.

---

## Prescription Validation Rules

| Rule                  | Implementation                                                                                                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. File format**    | Accept only **JPG, PNG, PDF** with **max size 10MB**. Validated on upload (`POST /api/prescriptions/`).                                                                                  |
| **2. Validity**       | Prescription **issue date** must not be older than **6 months**. Optional `issue_date` on upload; validated if provided.                                                                 |
| **3. Doctor details** | When **approving** (`PATCH` verify): **doctor_name**, **doctor_reg_number**, and **has_signature** (true) are required. Stored on prescription at verification.                          |
| **4. Patient match**  | **Patient name on prescription** (`patient_name_on_rx`) should match the **account holder** (e.g. username/email). Stored on upload or set at verification; pharmacy checks at approval. |
| **5. Medicine match** | When placing an order with prescription-only medicines: **ordered medicines must be listed on the prescription** (via prescription items set at approval). Validated at order create.    |
| **6. Quantity limit** | Order quantity for each prescription medicine **cannot exceed** the **prescribed quantity** on the prescription. Validated at order create.                                              |

---

## API Summary

### User (own prescriptions – prescription ordering)

- **POST** `/api/prescriptions/` – **Upload prescription order** (REGISTERED_USER only). Use **multipart/form-data**.  
  **Images:** multiple `images` or single `file` (JPG/PNG/PDF, max 10MB).  
  **Optional:** `shipping_address` (UserAddress id from `/api/auth/addresses/`), `save_prescription`, `medicine_supply_duration` (`7_DAYS`, `15_DAYS`, `1_MONTH`, `2_MONTHS`, `CUSTOM`), `custom_supply_days` (when CUSTOM), `prescription_note`, `issue_date`, `patient_name_on_rx`, `doctor_name`, `doctor_reg_number`.  
  Creates prescription in **PENDING** status; first entry added to **status_history** (Bangladesh time).
- **GET** `/api/prescriptions/` – **List** own prescriptions (filter: `status`).
- **GET** `/api/prescriptions/{id}/` – **Retrieve** own prescription (includes `images`, `shipping_address_detail`, `medicine_supply_duration`, `prescription_note`, `items`, **status_history** timeline in Bangladesh time).

Each user sees only their own uploaded prescriptions for list and retrieve.

### Admin (PHARMACY_ADMIN, SUPER_ADMIN) – add products and confirm order

- **GET** `/api/prescriptions/` – List **all** prescriptions (filter: `status`).
- **GET** `/api/prescriptions/{id}/` – Retrieve any prescription (full detail including status_history).
- **PATCH** or **PUT** `/api/prescriptions/{id}/` or **PATCH** `/api/prescriptions/{id}/verify/` – **Add required products and approve to confirm order**.  
  Body: `status` = `APPROVED` or `REJECTED`, `notes`, and when **approving**: `doctor_name`, `doctor_reg_number`, `has_signature` (true), optional `patient_name_on_rx`, and **items** (required when approving): `[{ "product": <id>, "quantity_prescribed": <int> }]`. At least one product with quantity is required. Stock is validated; if insufficient, approval fails. On success, an **Order** is created for the user (linked to this prescription), items are deducted from stock, and prescription status is set to **USED**. Status change recorded in **status_history** (Bangladesh time).
- **DELETE** `/api/prescriptions/{id}/` – Delete prescription (admin only).

### Order from prescription (automatic when admin confirms)

When admin **approves** a prescription with **items**, the backend creates an **Order** automatically: order is linked to the prescription, order items are created from the prescription items, stock is reduced, and prescription status is set to **USED**. The user sees this order in **GET** `/api/orders/` and can track it like any other order.

### Optional: Place order with existing approved prescription (cart flow)

- **POST** `/api/orders/`  
  Body: `shipping_address`, `notes`, **items** `[{ "product", "quantity" }]`, optional **prescription** (id).  
  If any item’s product has `requires_prescription=true`, **prescription** is required, must be **APPROVED** and owned by the user.  
  Validations: medicine match (product on prescription) and quantity limit (order qty ≤ prescribed qty).  
  On success, prescription status is set to **USED** and order is linked to the prescription.  
  *(This is the cart/checkout flow; the main prescription flow is upload → admin adds products and approves → order created automatically.)*

---

## References

- [ADMIN_API.md](ADMIN_API.md) – Prescriptions and Orders endpoints
- [RBAC.md](RBAC.md) – User hierarchy and permissions
