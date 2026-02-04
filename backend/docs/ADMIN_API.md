# My Pharma – Admin Panel REST API

REST API for the admin panel, aligned with [RBAC](RBAC.md) (User Hierarchy & Role Permissions Matrix).

**Base URL:** `http://localhost:8001` (or your API host)  
**Auth:** Send `Authorization: Bearer <access_token>` for all endpoints below unless noted.

---

## 1. Manage All Users (SUPER_ADMIN only)

| Method      | Path                          | Description                                                                  |
| ----------- | ----------------------------- | ---------------------------------------------------------------------------- |
| GET         | `/api/auth/admin/users/`      | List users (filter: role, status, is_active; search: username, email, phone) |
| POST        | `/api/auth/admin/users/`      | Create user (email or phone, password, username, role, etc.)                 |
| GET         | `/api/auth/admin/users/{id}/` | Retrieve user                                                                |
| PUT / PATCH | `/api/auth/admin/users/{id}/` | Update user (optional password)                                              |
| DELETE      | `/api/auth/admin/users/{id}/` | Soft-delete user                                                             |

**Permission:** `IsSuperAdmin` (SUPER_ADMIN only).

---

## 2. Manage Products (SUPER_ADMIN, PHARMACY_ADMIN)

| Method      | Path                              | Description                                                                                              |
| ----------- | --------------------------------- | -------------------------------------------------------------------------------------------------------- |
| GET         | `/api/products/`                  | List products (filter: category, is_active; search: name, slug, description). Public/guest: only active. |
| GET         | `/api/products/{slug}/`           | Retrieve product by slug                                                                                 |
| POST        | `/api/products/`                  | Create product                                                                                           |
| PUT / PATCH | `/api/products/{slug}/`           | Update product                                                                                           |
| DELETE      | `/api/products/{slug}/`           | Delete product                                                                                           |
| PATCH       | `/api/products/{slug}/inventory/` | Update quantity_in_stock (Manage Inventory)                                                              |

**Permission:** `IsPharmacyAdminOrSuper` for create/update/delete/inventory; list/retrieve allow any (guests see active only).

**Categories:**  
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/categories/` | List categories |
| POST | `/api/categories/` | Create category |
| GET | `/api/categories/{slug}/` | Retrieve category |
| PUT / PATCH | `/api/categories/{slug}/` | Update category |
| DELETE | `/api/categories/{slug}/` | Delete category |

**Permission:** `IsPharmacyAdminOrSuper`.

---

## 3. Verify Prescriptions (SUPER_ADMIN, PHARMACY_ADMIN)

| Method | Path                       | Description                                                         |
| ------ | -------------------------- | ------------------------------------------------------------------- |
| GET    | `/api/prescriptions/`      | List prescriptions (Pharmacy/Super: all; User: own). Filter: status |
| GET    | `/api/prescriptions/{id}/` | Retrieve prescription                                               |
| POST   | `/api/prescriptions/`      | Upload prescription (REGISTERED_USER only – Upload Prescriptions)   |
| PATCH  | `/api/prescriptions/{id}/` | Verify or reject (status, notes). Sets verified_by, verified_at     |

**Permission:** Create: `IsRegisteredUserOnly`. List/retrieve/update: `IsPharmacyAdminOrSuper` (users see only own for list/retrieve).

---

## 4. View/Manage Orders (SUPER_ADMIN, PHARMACY_ADMIN – all; REGISTERED_USER – own)

| Method | Path                | Description                                                                                                           |
| ------ | ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/orders/`      | List orders (Pharmacy/Super: all; User: own). Filter: status                                                          |
| GET    | `/api/orders/{id}/` | Retrieve order                                                                                                        |
| POST   | `/api/orders/`      | Place order (Purchase Products – REGISTERED_USER only). Body: shipping_address, notes, items: [{ product, quantity }] |
| PATCH  | `/api/orders/{id}/` | Update order status (Pharmacy/Super only)                                                                             |

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
