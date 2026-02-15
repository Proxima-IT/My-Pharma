# My Pharma – Admin Panel REST API

REST API for the admin panel, aligned with [RBAC](RBAC.md) (User Hierarchy & Role Permissions Matrix).

**Base URL:** `http://localhost:8001` (or your API host)  
**Auth:** Send `Authorization: Bearer <access_token>` for all endpoints below unless noted.

---

## 1. Manage All Users (SUPER_ADMIN only)

| Method      | Path                          | Description                                                                  |
| ----------- | ----------------------------- | ---------------------------------------------------------------------------- |
| GET         | `/api/auth/admin/users/`      | List users (filter: role, status, is_active; search: username, email, phone) |
| POST        | `/api/auth/admin/users/`      | Create user (email or phone, password, username, role, profile_picture, address, gender, date_of_birth, etc.) |
| GET         | `/api/auth/admin/users/{id}/` | Retrieve user (includes address, gender, date_of_birth)                     |
| PUT / PATCH | `/api/auth/admin/users/{id}/` | Update user (optional password; profile fields: address, gender, date_of_birth) |
| DELETE      | `/api/auth/admin/users/{id}/` | Soft-delete user                                                             |

**Permission:** `IsSuperAdmin` (SUPER_ADMIN only). User model includes **gender** (`MALE` / `FEMALE` / `OTHER`), **address**, and **date_of_birth**.

---

## 2. Prescriptions (list/retrieve own; verify: Pharmacy/Super)

| Method | Path                               | Description |
|--------|------------------------------------|-------------|
| GET    | `/api/prescriptions/`              | List prescriptions. **Pharmacy/Super:** all. **User:** own only. Filter: `status`. |
| GET    | `/api/prescriptions/{id}/`         | Retrieve prescription (includes items when approved). Users see only own. |
| POST   | `/api/prescriptions/`              | Upload prescription (REGISTERED_USER only). Body: **file** (required; JPG/PNG/PDF, max 10MB), optional: issue_date, patient_name_on_rx, doctor_name, doctor_reg_number. Creates PENDING. |
| PATCH  | `/api/prescriptions/{id}/`          | Verify or reject (PHARMACY_ADMIN, SUPER_ADMIN only). Body: **status** = APPROVED or REJECTED, notes; when approving: doctor_name, doctor_reg_number, has_signature (true), optional patient_name_on_rx, **items** [{ product, quantity_prescribed }]. Sets verified_by, verified_at. |
| PATCH  | `/api/prescriptions/{id}/verify/`  | Alias for PATCH prescription (verify/reject). |

**Permission:** List/retrieve: any authenticated user (queryset filtered so users see only own). Upload: `IsRegisteredUserOnly`. Verify (PATCH): `IsPharmacyAdminOrSuper`. See [PRESCRIPTION_MANAGEMENT.md](PRESCRIPTION_MANAGEMENT.md).

---

## 3. Manage Products (SUPER_ADMIN, PHARMACY_ADMIN)

| Method      | Path                              | Description                                                                                                                                 |
| ----------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| GET         | `/api/products/`                  | List products. Filter: `category`, `is_active`, `brand_id`, `ingredient_id`, `price_min`, `price_max`, `requires_prescription`. Search: `search` (name, fuzzy). Order: `ordering=price`, `-price`, etc. Public/guest: only active. |
| GET         | `/api/products/{slug}/`           | Retrieve product by slug                                                                                                                     |
| POST        | `/api/products/`                  | Create product (category, brand, ingredient, requires_prescription, name, price, etc.)                                                       |
| PUT / PATCH | `/api/products/{slug}/`           | Update product                                                                                                                               |
| DELETE      | `/api/products/{slug}/`           | Delete product                                                                                                                               |
| PATCH       | `/api/products/{slug}/inventory/` | Update quantity_in_stock (Manage Inventory)                                                                                                  |

**Permission:** `IsPharmacyAdminOrSuper` for create/update/delete/inventory; list/retrieve allow any (guests see active only). See [PRODUCT_CATALOG.md](PRODUCT_CATALOG.md) for search & filter logic.

**Categories (hierarchy: parent / children):**  
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/categories/` | List categories (filter: `parent`, `is_active`; search: name, slug) |
| GET | `/api/categories/tree/` | Category hierarchy (roots with nested children) |
| POST | `/api/categories/` | Create category |
| GET | `/api/categories/{slug}/` | Retrieve category |
| PUT / PATCH | `/api/categories/{slug}/` | Update category |
| DELETE | `/api/categories/{slug}/` | Delete category |

**Permission:** `IsPharmacyAdminOrSuper`.

**Brands (autocomplete for product search):**  
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/brands/` | List brands (search: name, slug). Use for autocomplete and `brand_id` filter on products. |
| POST | `/api/brands/` | Create brand (Pharmacy/Super only) |
| GET | `/api/brands/{slug}/` | Retrieve brand |
| PUT / PATCH | `/api/brands/{slug}/` | Update brand |
| DELETE | `/api/brands/{slug}/` | Delete brand |

**Permission:** List/retrieve: any (including guest). Create/update/delete: `IsPharmacyAdminOrSuper`.

**Ingredients (generic search: map to branded products):**  
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/ingredients/` | List ingredients (search: name, slug). Use `ingredient_id` on products for generic search. |
| POST | `/api/ingredients/` | Create ingredient (Pharmacy/Super only) |
| GET | `/api/ingredients/{slug}/` | Retrieve ingredient |
| PUT / PATCH | `/api/ingredients/{slug}/` | Update ingredient |
| DELETE | `/api/ingredients/{slug}/` | Delete ingredient |

**Permission:** List/retrieve: any (including guest). Create/update/delete: `IsPharmacyAdminOrSuper`.

---

## 4. View/Manage Orders (SUPER_ADMIN, PHARMACY_ADMIN – all; REGISTERED_USER – own)

| Method | Path                | Description                                                                                                                                 |
| ------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/orders/`      | List orders (Pharmacy/Super: all; User: own). Filter: status                                                                                |
| GET    | `/api/orders/{id}/` | Retrieve order (includes prescription when linked)                                                                                           |
| POST   | `/api/orders/`      | Place order (REGISTERED_USER only). Body: shipping_address, notes, **items** [{ product, quantity }], optional **prescription** (id). If any product has requires_prescription, prescription is required (must be APPROVED, owned by user); medicine match and quantity limit validated. Prescription set to USED and linked to order. |
| PATCH  | `/api/orders/{id}/` | Update order status (Pharmacy/Super only)                                                                                                    |

**Permission:** Create: `IsRegisteredUserOnly`. List/retrieve: `IsRegisteredUser` (queryset filtered by role). PATCH: Pharmacy/Super only.

---

## 5. Doctor Consultations (SUPER_ADMIN, DOCTOR – manage; REGISTERED_USER – request)

| Method | Path                               | Description                                                                                 |
| ------ | ---------------------------------- | ------------------------------------------------------------------------------------------- |
| GET    | `/api/consultations/`              | List consultations (Doctor/Super: all; User: own). Filter: status; search: subject, message |
| GET    | `/api/consultations/{id}/`         | Retrieve consultation                                                                       |
| POST   | `/api/consultations/`              | Request consultation (subject, message) – REGISTERED_USER (Request)                         |
| PATCH  | `/api/consultations/{id}/`         | Doctor respond (response, status) – DOCTOR or SUPER_ADMIN                                   |
| PATCH  | `/api/consultations/{id}/respond/` | Alias for PATCH consultation (doctor response)                                              |

**Permission:** Create: `IsRegisteredUser`. List/retrieve: `IsRegisteredUser` (queryset filtered). PATCH: `IsDoctorOrSuper`.

---

## 6. CMS Management (SUPER_ADMIN full; PHARMACY_ADMIN limited)

| Method      | Path                 | Description                                    |
| ----------- | -------------------- | ---------------------------------------------- |
| GET         | `/api/pages/`        | List pages (public: published only; auth: all) |
| GET         | `/api/pages/{slug}/` | Retrieve page by slug                          |
| POST        | `/api/pages/`        | Create page (SUPER_ADMIN only)                 |
| PUT / PATCH | `/api/pages/{slug}/` | Update page (PHARMACY_ADMIN or SUPER_ADMIN)    |
| DELETE      | `/api/pages/{slug}/` | Delete page (SUPER_ADMIN only)                 |

**Permission:** List/retrieve: any (guests see published only). Create/delete: `IsSuperAdmin`. Update: `IsPharmacyAdminOrSuper`.

---

## 7. Summary by role

| Role                | Endpoints                                                                                                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SUPER_ADMIN**     | All: users, categories, products, orders, prescriptions, consultations, pages (full CRUD + inventory, verify, respond, CMS create/delete)                                                     |
| **PHARMACY_ADMIN**  | Categories, products, orders, prescriptions, pages (no user management; no consultation respond; no CMS create/delete)                                                                        |
| **DOCTOR**          | Consultations list/retrieve/respond; own profile (me)                                                                                                                                         |
| **REGISTERED_USER** | Own orders (list, retrieve, create/place order); own prescriptions (list, retrieve, upload); own consultations (list, retrieve, create); products list/retrieve (browse); pages list/retrieve |
| **GUEST**           | Products list/retrieve (active only); pages list/retrieve (published only)                                                                                                                    |

---

## 8. References

- [RBAC.md](RBAC.md) – User hierarchy and permissions matrix
- [API_REFERENCE.md](API_REFERENCE.md) – Auth endpoints (login, register, me, etc.)
- [PRODUCT_CATALOG.md](PRODUCT_CATALOG.md) – Product catalog business logic (category hierarchy, search & filter)
- [PRESCRIPTION_MANAGEMENT.md](PRESCRIPTION_MANAGEMENT.md) – Prescription flow (status machine, validation rules)
