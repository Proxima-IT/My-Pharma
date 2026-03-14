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

**Fields:** `name`, `parent`, `image` (optional), `is_active`. Use multipart/form-data when uploading `image`.

**Permission:** `IsPharmacyAdminOrSuper`.

**Sidebar categories (left sidebar: image + title):**  
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/sidebar-categories/` | List sidebar categories (public) |
| GET | `/api/sidebar-categories/{id}/` | Retrieve one (public) |
| POST | `/api/sidebar-categories/` | Create (Pharmacy/Super only) |
| PUT / PATCH | `/api/sidebar-categories/{id}/` | Update (Pharmacy/Super only) |
| DELETE | `/api/sidebar-categories/{id}/` | Delete (Pharmacy/Super only) |

**Permission:** List/retrieve: any (including guest). Create/update/delete: `IsPharmacyAdminOrSuper`.

**Ads (banners: image + link):**  
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/ads/` | List ads (public: active only; auth: filter by `is_active`) |
| GET | `/api/ads/{id}/` | Retrieve one (public: active only) |
| POST | `/api/ads/` | Create ad (Pharmacy/Super only) |
| PUT / PATCH | `/api/ads/{id}/` | Update ad (Pharmacy/Super only) |
| DELETE | `/api/ads/{id}/` | Delete ad (Pharmacy/Super only) |

**Permission:** List/retrieve: any (guests see active only). Create/update/delete: `IsPharmacyAdminOrSuper`.

**Combos (combo packages: image + price + link):**  
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/combos/` | List combos (public: active only; auth: filter by `is_active`) |
| GET | `/api/combos/{id}/` | Retrieve one combo (public: active only) |
| POST | `/api/combos/` | Create combo (Pharmacy/Super only) |
| PUT / PATCH | `/api/combos/{id}/` | Update combo (Pharmacy/Super only) |
| DELETE | `/api/combos/{id}/` | Delete combo (Pharmacy/Super only) |

**Fields:** Include `title`, `description`, `image`, `link`, `price`, `original_price`, `bg_color`, `order`, `is_active`.

**Permission:** List/retrieve: any (guests see active only). Create/update/delete: `IsPharmacyAdminOrSuper`.

**App logos (slug + image):**  
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/logos/` | List app logos (public) |
| GET | `/api/logos/{slug}/` | Retrieve one app logo (public) |
| POST | `/api/logos/` | Create app logo (Pharmacy/Super only) |
| PUT / PATCH | `/api/logos/{slug}/` | Update app logo (Pharmacy/Super only) |
| DELETE | `/api/logos/{slug}/` | Delete app logo (Pharmacy/Super only) |

**Permission:** List/retrieve: any (including guest). Create/update/delete: `IsPharmacyAdminOrSuper`.

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
| GET    | `/api/orders/{id}/` | Retrieve order (items, images, prescription, duration, message, **status_history** timeline in Bangladesh time)                             |
| POST   | `/api/orders/`      | Place order (REGISTERED_USER only). Body: shipping_address, notes, **message** (optional), **items** [{ product, quantity, dosage? }], optional **prescription** (id), optional **duration** (id). Use **multipart/form-data** to upload multiple **images** (field name `images`); when multipart, send `items` as JSON string. Prescription rules unchanged. |
| PATCH  | `/api/orders/{id}/` | Update order status and/or duration (Pharmacy/Super only). Body: `status`, `duration` (optional).                                             |

**Permission:** Create: `IsRegisteredUserOnly`. List/retrieve: `IsRegisteredUser` (queryset filtered by role). PATCH: Pharmacy/Super only.

**Delivery durations (admin CRUD):**  
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/delivery-durations/` | List delivery durations |
| GET | `/api/delivery-durations/{id}/` | Retrieve one |
| POST | `/api/delivery-durations/` | Create (Pharmacy/Super) |
| PUT / PATCH | `/api/delivery-durations/{id}/` | Update (Pharmacy/Super) |
| DELETE | `/api/delivery-durations/{id}/` | Delete (Pharmacy/Super) |

**Fields:** `name`, `days` (optional), `order` (display order).

---

**Product reviews (rating + comment + images):**  
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/reviews/` | List reviews (public). Filter: `product`, `product_slug`, `rating`. |
| GET | `/api/reviews/{id}/` | Retrieve one review (public). |
| POST | `/api/reviews/` | Create review (REGISTERED_USER only; must have purchased the product – delivered order). Body: `product`, `rating` (1–5), `title`, `comment`; multipart: multiple `images`. |
| PUT / PATCH | `/api/reviews/{id}/` | Update review (owner only). |
| DELETE | `/api/reviews/{id}/` | Delete review (owner only). |

**Permission:** List/retrieve: any. Create: `IsRegisteredUserOnly` (and product must be purchased). Update/delete: owner only.

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
| **REGISTERED_USER** | Own orders (list, retrieve, create/place order); own prescriptions (list, retrieve, upload); own consultations (list, retrieve, create); product reviews (list, retrieve, create for purchased products, update/delete own); products list/retrieve (browse); pages list/retrieve |
| **GUEST**           | Products list/retrieve (active only); pages list/retrieve (published only); reviews list/retrieve                                                                                                                              |

---

## 8. References

- [RBAC.md](RBAC.md) – User hierarchy and permissions matrix
- [API_REFERENCE.md](API_REFERENCE.md) – Auth endpoints (login, register, me, etc.)
- [PRODUCT_CATALOG.md](PRODUCT_CATALOG.md) – Product catalog business logic (category hierarchy, search & filter)
- [PRESCRIPTION_MANAGEMENT.md](PRESCRIPTION_MANAGEMENT.md) – Prescription flow (status machine, validation rules)
