# 5. Prescription Management Flow

Prescription handling is a critical compliance feature ensuring proper verification before dispensing prescription medicines. Aligned with [ADMIN_API.md](ADMIN_API.md) (Verify Prescriptions, Orders).

---

## Prescription Status State Machine

```
UPLOADED (user submits)
    → PENDING (in review queue)

PENDING
    → APPROVED (valid Rx)
    → REJECTED (Invalid/Expired)

APPROVED
    → USED (linked to order when order is placed with this prescription)
```

| Status   | Description |
|----------|-------------|
| **PENDING**  | User has uploaded; in review queue. |
| **APPROVED** | Valid prescription; can be linked to an order. |
| **REJECTED**| Invalid or expired; cannot be used. |
| **USED**    | Linked to an order; no longer available for new orders. |

**Backend:** Only transitions allowed: `PENDING → APPROVED`, `PENDING → REJECTED`, and `APPROVED → USED` (set automatically when order is created with this prescription).

---

## Prescription Validation Rules

| Rule | Implementation |
|------|----------------|
| **1. File format** | Accept only **JPG, PNG, PDF** with **max size 10MB**. Validated on upload (`POST /api/prescriptions/`). |
| **2. Validity** | Prescription **issue date** must not be older than **6 months**. Optional `issue_date` on upload; validated if provided. |
| **3. Doctor details** | When **approving** (`PATCH` verify): **doctor_name**, **doctor_reg_number**, and **has_signature** (true) are required. Stored on prescription at verification. |
| **4. Patient match** | **Patient name on prescription** (`patient_name_on_rx`) should match the **account holder** (e.g. username/email). Stored on upload or set at verification; pharmacy checks at approval. |
| **5. Medicine match** | When placing an order with prescription-only medicines: **ordered medicines must be listed on the prescription** (via prescription items set at approval). Validated at order create. |
| **6. Quantity limit** | Order quantity for each prescription medicine **cannot exceed** the **prescribed quantity** on the prescription. Validated at order create. |

---

## API Summary

### Upload (user)

- **POST** `/api/prescriptions/`  
  Body: `file` (required; JPG/PNG/PDF, max 10MB), optional: `issue_date`, `patient_name_on_rx`, `doctor_name`, `doctor_reg_number`.  
  Creates prescription in **PENDING** status.

### Verify (pharmacy / super)

- **GET** `/api/prescriptions/` – List (filter: `status`).
- **GET** `/api/prescriptions/{id}/` – Retrieve (includes `items` when approved).
- **PATCH** `/api/prescriptions/{id}/` or **PATCH** `/api/prescriptions/{id}/verify/`  
  Body: `status` = `APPROVED` or `REJECTED`, `notes`, and when approving: `doctor_name`, `doctor_reg_number`, `has_signature` (true), optional `patient_name_on_rx`, and **items**: `[{ "product": <id>, "quantity_prescribed": <int> }]`.  
  When **APPROVED**, prescription items (medicines and quantities) are stored for order validation.

### Order with prescription

- **POST** `/api/orders/`  
  Body: `shipping_address`, `notes`, **items** `[{ "product", "quantity" }]`, optional **prescription** (id).  
  If any item’s product has `requires_prescription=true`, **prescription** is required, must be **APPROVED** and owned by the user.  
  Validations: medicine match (product on prescription) and quantity limit (order qty ≤ prescribed qty).  
  On success, prescription status is set to **USED** and order is linked to the prescription.

---

## References

- [ADMIN_API.md](ADMIN_API.md) – Prescriptions and Orders endpoints
- [RBAC.md](RBAC.md) – User hierarchy and permissions
