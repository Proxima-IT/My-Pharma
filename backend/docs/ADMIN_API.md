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

## 2. Prescription ordering (full CRUD – user upload; admin verify, delete)

| Method | Path                               | Description |
|--------|------------------------------------|-------------|
| GET    | `/api/prescriptions/`              | List prescriptions. **Pharmacy/Super:** all. **User:** own only. Filter: `status`. |
| GET    | `/api/prescriptions/{id}/`         | Retrieve prescription (images, shipping_address_detail, medicine_supply_duration, prescription_note, items, **status_history** in Bangladesh time). Users see only own. |
| POST   | `/api/prescriptions/`              | **Upload prescription order** (REGISTERED_USER only). Same behavior as `/api/prescription-orders/` below; kept for backward compatibility. |
| PATCH  | `/api/prescriptions/{id}/`          | Add products and approve or reject (PHARMACY_ADMIN, SUPER_ADMIN only). Body: **status** = APPROVED or REJECTED, notes; when approving: doctor_name, doctor_reg_number, has_signature (true), optional patient_name_on_rx, **items** (required) [{ product, quantity_prescribed }]. When approved with items, an **Order** is created for the user and prescription set to USED. Status change recorded in status_history (Bangladesh time). |
| PUT    | `/api/prescriptions/{id}/`         | Same as PATCH (admin). |
| DELETE | `/api/prescriptions/{id}/`         | Delete prescription (PHARMACY_ADMIN, SUPER_ADMIN only). |
| PATCH  | `/api/prescriptions/{id}/verify/`  | Alias for PATCH prescription (verify/reject). |

**Permission:** List/retrieve: any authenticated user (queryset filtered so users see only own). Upload: `IsRegisteredUserOnly`. Verify/PATCH/PUT/DELETE: `IsPharmacyAdminOrSuper`. See [PRESCRIPTION_MANAGEMENT.md](PRESCRIPTION_MANAGEMENT.md).

**Dedicated prescription ordering endpoint (preferred from frontend):**  
| Method | Path                          | Description |
|--------|-------------------------------|-------------|
| POST   | `/api/prescription-orders/`   | **Upload prescription order** (REGISTERED_USER only). **Multipart:** **images** (single or multiple files; repeat `images`) or single **file** (JPG/PNG/PDF, max 10MB); optional **shipping_address** (UserAddress id), **save_prescription**, **medicine_supply_duration** (7_DAYS, 15_DAYS, 1_MONTH, 2_MONTHS, CUSTOM), **custom_supply_days** (when CUSTOM), **prescription_note**, **additional_products_note**, issue_date, patient_name_on_rx, doctor_name, doctor_reg_number. Creates PENDING; status_history recorded. |

---

## 3. Manage Products (SUPER_ADMIN, PHARMACY_ADMIN)

| Method      | Path                              | Description                                                                                                                                 |
| ----------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| GET         | `/api/products/`                  | List products. Filter: `category`, `is_active`, `brand_id`, `ingredient_id`, `min_price`/`max_price` (legacy `price_min`/`price_max`), `available`/`in_stock`, `discounted`, `discount_min`/`discount_max`, `requires_prescription`. Search: `search` (name, fuzzy). Order: `ordering=price`, `-price`, etc. Public/guest: only active. |
| GET         | `/api/products/count-summary/`    | Get total active product count and active product count per category                                                                         |
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
| GET | `/api/categories/sidebar-category/` | Public sidebar menu categories selected from existing categories |
| PUT | `/api/categories/sidebar-category/` | Admin replace sidebar menu selection (ordered `category_ids`) |
| GET | `/api/categories/featured-category/` | Public featured categories for home section |
| PUT | `/api/categories/featured-category/` | Admin replace featured home selection (ordered `category_ids`) |
| POST | `/api/categories/` | Create category |
| GET | `/api/categories/{slug}/` | Retrieve category |
| PUT / PATCH | `/api/categories/{slug}/` | Update category |
| DELETE | `/api/categories/{slug}/` | Delete category |

**Fields:** `name`, `parent`, `sidebar_category`, `sidebar_category_title` (read-only), `image` (optional), `is_active`, `show_in_sidebar`, `sidebar_order`, `is_featured_home`, `is_home_categoery`, `featured_order`, `product_count` (read-only). Use multipart/form-data when uploading `image`.

`sidebar_category` links a product category to a custom sidebar menu item (`/api/sidebar-categories/{id}/`) so the category appears as a child under that specific sidebar menu on the public sidebar.

**Bulk selection body (`PUT /sidebar-category/` and `PUT /featured-category/`):**

```json
{
  "category_ids": [3, 7, 12]
}
```

Categories are saved in the given order (`sidebar_order` / `featured_order`).

**Permission:** `IsPharmacyAdminOrSuper`.

**Sidebar categories (left sidebar: image + title):**  
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/sidebar-categories/` | List sidebar categories (public) |
| GET | `/api/sidebar-categories/{id}/` | Retrieve one (public) |
| POST | `/api/sidebar-categories/` | Create (Pharmacy/Super only) |
| PUT / PATCH | `/api/sidebar-categories/{id}/` | Update (Pharmacy/Super only) |
| DELETE | `/api/sidebar-categories/{id}/` | Delete (Pharmacy/Super only) |

Preferred for category-based sidebar menus: use `/api/categories/sidebar-category/` so admins can select existing product categories directly.

Backward-compatible aliases are still available:
- `/api/categories/sidebar/`
- `/api/categories/featured/`

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

**Combos (combo packages: image + price + products):**  
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/combos/` | List combos (public: active only; auth: filter by `is_active`) |
| GET | `/api/combos/{id}/` | Retrieve one combo (public: active only) |
| POST | `/api/combos/` | Create combo (Pharmacy/Super only) |
| PUT / PATCH | `/api/combos/{id}/` | Update combo (Pharmacy/Super only) |
| DELETE | `/api/combos/{id}/` | Delete combo (Pharmacy/Super only) |

**Fields:** Include `title`, `description`, `image`, `products`, `product_ids`, `price`, `original_price`, `bg_color`, `order`, `is_active`.

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
| GET    | `/api/orders/{id}/` | Retrieve order (items, images, prescription, duration, message, **status_history** timeline in Bangladesh time; includes coupon/discount breakdown)                             |
| POST   | `/api/orders/`      | Place order (REGISTERED_USER only). Body: shipping_address, notes, **message** (optional), **items** [{ product, quantity, dosage? }], optional **prescription** (id), optional **duration** (id). Use **multipart/form-data** to upload multiple **images** (field name `images`); when multipart, send `items` as JSON string. Prescription rules unchanged. |
| PATCH  | `/api/orders/{id}/` | Update order status and/or duration (Pharmacy/Super only). Body: `status`, `duration` (optional).                                             |
| POST   | `/api/orders/buy-now-preview/` | Preview order summary for single product direct checkout (REGISTERED_USER). Body: `product` (id), `quantity`, optional `shipping_address_id`, `coupon_code`, `delivery_method_id`. |
| POST   | `/api/orders/buy-now/` | Place direct checkout order for single product bypassing cart (REGISTERED_USER only). Body: `product` (id), `quantity`, `shipping_address_id`, optional `coupon_code`, `notes`, `message`, `delivery_method_id`, `payment_method`, `prescription` (id). Enforces stock checks and prescription verification for Rx products. Returns payment gateway URL if online payment. |

**Permission:** Create/Buy Now: `IsRegisteredUserOnly`. Preview: `IsRegisteredUser`. List/retrieve: `IsRegisteredUser` (queryset filtered by role). PATCH: Pharmacy/Super only.

**Delivery durations:**  
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/delivery-durations/` | List delivery durations (any authenticated user) |
| GET | `/api/delivery-durations/{id}/` | Retrieve one (any authenticated user) |
| POST | `/api/delivery-durations/` | Create (Pharmacy/Super) |
| PUT / PATCH | `/api/delivery-durations/{id}/` | Update (Pharmacy/Super) |
| DELETE | `/api/delivery-durations/{id}/` | Delete (Pharmacy/Super) |

**Fields:** `name`, `days` (optional), `order` (display order). List/retrieve: any authenticated user; create/update/delete: Pharmacy/Super only.

---

## 4a. Coupons (flat / percent)

Admins can create discount coupons (flat amount or percent). Users can validate/apply coupons before checkout and then place orders with `coupon_code`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/coupons/` | List coupons (admin only). Search: `?search=CODE`. Filter: `discount_type`, `is_active`. |
| GET | `/api/coupons/{id}/` | Retrieve coupon (admin only). |
| POST | `/api/coupons/` | Create coupon (Pharmacy/Super only). |
| PUT / PATCH | `/api/coupons/{id}/` | Update coupon (Pharmacy/Super only). |
| DELETE | `/api/coupons/{id}/` | Delete coupon (Pharmacy/Super only). |
| POST | `/api/coupons/validate/` | Validate/apply coupon (REGISTERED_USER). Body: `code`, optional `subtotal` (if omitted, subtotal is calculated from cart). |

**Coupon fields:** `code` (unique), `discount_type` (`PERCENT` or `FIXED`), `discount_value` (percent 0–100 or flat amount), `min_order_amount`, `valid_from`, `valid_until`, `max_uses` (null=unlimited), `times_used`, `is_active`.

**Order/cart integration:**  
- `POST /api/cart/place-order/` supports `coupon_code` and will reject invalid/expired coupons.  
- When order is placed successfully with a coupon, `times_used` is incremented.

**Persist discounted prices in cart:**  
- `POST /api/cart/apply-coupon/` body: `{ "coupon_code": "SAVE10" }` → validates and **updates cart item unit prices** (`price_at_order`) to the discounted price, and stores the applied coupon on the cart.  
- `POST /api/cart/remove-coupon/` → restores cart item prices from `original_price_at_order` and clears the applied coupon.

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

## 6. Notifications (admin broadcast + user inbox + FCM subscriptions)

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/notifications/` | List current user's notifications. Filter: `is_read`. |
| GET | `/api/notifications/{id}/` | Retrieve current user's notification by id. |
| PATCH | `/api/notifications/{id}/read/` | Mark one notification as read (current user only). |
| PATCH | `/api/notifications/read-all/` | Mark all current user's unread notifications as read. Response: `{"marked_count": <int>}`. |
| GET | `/api/notifications/permission/` | Get current browser push permission state (`browser_permission`, `is_enabled`, `platform`). |
| POST | `/api/notifications/permission/` | Update browser permission state. |
| GET | `/api/notifications/subscriptions/` | List current user's FCM subscriptions. |
| POST | `/api/notifications/subscriptions/` | Upsert one FCM token. Body: `fcm_token`, optional `platform`, optional `is_active`. |
| DELETE | `/api/notifications/subscriptions/` | Deactivate token. Body: `fcm_token`; response: `{"removed_count": <int>}`. |
| POST | `/api/notifications/broadcast/` | Broadcast notification to **all non-guest active users** (SUPER_ADMIN / PHARMACY_ADMIN). Body: `title`, `message`, optional absolute `target_url` (`https://...`), optional `send_to_opted_in_only`. |

**Permission:**  
- Inbox endpoints (`list`, `retrieve`, `read`, `read-all`): `IsRegisteredUser` (authenticated non-guest users; queryset always own only).  
- Broadcast endpoint: `IsPharmacyAdminOrSuper`.

**Broadcast response (`201 Created`):**

```json
{
  "detail": "Notification broadcast sent.",
  "sent_count": 25,
  "title": "Offer",
  "send_to_opted_in_only": true,
  "target_url": "https://mypharma.com.bd/offers",
  "push_attempted": 20,
  "push_succeeded": 19,
  "push_failed": 1,
  "push_deactivated": 1,
  "push_async": true
}
```

---

## 7. CMS Management (SUPER_ADMIN full; PHARMACY_ADMIN limited)

| Method      | Path                 | Description                                    |
| ----------- | -------------------- | ---------------------------------------------- |
| GET         | `/api/pages/`        | List pages (public: published only; auth: all) |
| GET         | `/api/pages/{slug}/` | Retrieve page by slug                          |
| POST        | `/api/pages/`        | Create page (SUPER_ADMIN only)                 |
| PUT / PATCH | `/api/pages/{slug}/` | Update page (PHARMACY_ADMIN or SUPER_ADMIN)    |
| DELETE      | `/api/pages/{slug}/` | Delete page (SUPER_ADMIN only)                 |

**Permission:** List/retrieve: any (guests see published only). Create/delete: `IsSuperAdmin`. Update: `IsPharmacyAdminOrSuper`.

**Blog (categories + posts: title, category, full article text):**  
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/blog-categories/` | List blog categories (public: **is_active** only; Pharmacy/Super: all). Filter: `is_active`. Search: `name`, `slug`. |
| GET | `/api/blog-categories/{slug}/` | Retrieve category by slug |
| POST | `/api/blog-categories/` | Create category: **name**, **slug** (optional; auto from name), **is_active**, **order** (Pharmacy/Super) |
| PUT / PATCH | `/api/blog-categories/{slug}/` | Update category (admin) |
| DELETE | `/api/blog-categories/{slug}/` | Delete category (admin). **Note:** cannot delete if posts still reference it (`PROTECT`). |
| GET | `/api/blog-posts/` | List posts (public: **is_published** only; Pharmacy/Super: all). Filter: `is_published`, `category` (id). Search: **title**, **content**, **slug**. |
| GET | `/api/blog-posts/{slug}/` | Retrieve post by slug |
| POST | `/api/blog-posts/` | Create post: **title**, **slug** (optional; auto from title), **category** (BlogCategory id), **short_description** (optional), **article_image** (optional file), **content** (detailed body), **is_published** (Pharmacy/Super). Use **multipart/form-data** when uploading `article_image`. |
| PUT / PATCH | `/api/blog-posts/{slug}/` | Update post (admin) |
| DELETE | `/api/blog-posts/{slug}/` | Delete post (admin) |

**Permission:** List/retrieve: any (guests see active categories + published posts only). Create/update/delete categories and posts: `IsPharmacyAdminOrSuper`. Blog is also manageable in Django admin.

---

## 8. Payment Settlements (SUPER_ADMIN, PHARMACY_ADMIN)

Settlement tracking for orders (commission + cash deposit + payout).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/settlements/` | List settlements. Filter: `status`, `payment_method`, `payment_status`. |
| GET | `/api/settlements/{id}/` | Get a settlement row. |
| POST | `/api/settlements/{id}/cash-deposit/` | Mark COD cash deposited. Body: `cash_collected_amount`, optional `cash_deposit_reference`. |
| POST | `/api/settlements/{id}/payout/` | Mark payout as settled. Body: optional `payout_reference`. |
| POST | `/api/settlements/{id}/refund/` | Mark settlement as refunded. |

**Auto-create:** When an order is updated to `DELIVERED`, a settlement row is created automatically (idempotent).

---

## 9. B2B Customer Commissions (SUPER_ADMIN, PHARMACY_ADMIN)

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/b2b/customers/` | List/create B2B customers (commission rate). |
| GET/PUT/PATCH/DELETE | `/api/b2b/customers/{id}/` | Manage a B2B customer profile. |
| GET | `/api/b2b/commissions/` | List B2B commission ledger entries. Filter: `status`, `customer`. |
| GET | `/api/b2b/commissions/{id}/` | Get a commission entry. |
| POST | `/api/b2b/commissions/{id}/settle/` | Mark a commission entry as settled. |

---

## 8. Summary by role

| Role                | Endpoints                                                                                                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SUPER_ADMIN**     | All: users, categories, products, orders, prescriptions, consultations, notifications (broadcast + own inbox), pages (full CRUD + inventory, verify, respond, CMS create/delete), blog (full CRUD)                                                     |
| **PHARMACY_ADMIN**  | Categories, products, orders, prescriptions, notifications (broadcast + own inbox), pages (no user management; no consultation respond; no CMS create/delete), blog (full CRUD)                                                                        |
| **DOCTOR**          | Consultations list/retrieve/respond; own profile (me)                                                                                                                                         |
| **REGISTERED_USER** | Own orders (list, retrieve, create/place order); own prescriptions (list, retrieve, upload); own consultations (list, retrieve, create); own notifications (list/retrieve/mark-read); product reviews (list, retrieve, create for purchased products, update/delete own); products list/retrieve (browse); pages list/retrieve; blog categories/posts list/retrieve (published + active only, same as guest) |
| **GUEST**           | Products list/retrieve (active only); pages list/retrieve (published only); blog categories (active) and posts (published); reviews list/retrieve                                                                                                                              |

---

## 9. References

- [RBAC.md](RBAC.md) – User hierarchy and permissions matrix
- [API_REFERENCE.md](API_REFERENCE.md) – Auth endpoints (login, register, me, etc.)
- [PRODUCT_CATALOG.md](PRODUCT_CATALOG.md) – Product catalog business logic (category hierarchy, search & filter)
- [PRESCRIPTION_MANAGEMENT.md](PRESCRIPTION_MANAGEMENT.md) – Prescription flow (status machine, validation rules)
