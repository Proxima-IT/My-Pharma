# Pharmacy Admin API – Reference

API reference for **Pharmacy Admin** (and Super Admin) roles. Use these endpoints to manage catalog, inventory, orders, and prescriptions from the pharmacy dashboard.

**Base URL:** `http://localhost:8000` (or your API host)  
**Auth:** All endpoints below require `Authorization: Bearer <access_token>` (JWT from login).

**Related:** [RBAC.md](RBAC.md) · [ADMIN_API.md](ADMIN_API.md) · [API_REFERENCE.md](API_REFERENCE.md)

---

## 1. Authentication

Pharmacy admins use the same auth as other users:

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login/` | Login with **email** or **phone** + password. Returns `access`, `refresh`, `user`. |
| POST | `/api/auth/token/refresh/` | Body: `{"refresh": "..."}`. Returns new access + refresh. |
| GET | `/api/auth/me/` | Current user; check `role` is `PHARMACY_ADMIN` or `SUPER_ADMIN`. |

**Headers for all requests:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

For **file uploads** (product image, gallery): use `Content-Type: multipart/form-data`.

---

## 2. Categories (CRUD)

Manage product categories (hierarchy: parent/children). List and tree are public; create/update/delete require Pharmacy Admin.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/categories/` | List categories. Query: `is_active`, `parent`, `search`. |
| GET | `/api/categories/tree/` | Category hierarchy (roots with nested children). |
| GET | `/api/categories/{slug}/` | Retrieve one category. |
| POST | `/api/categories/` | Create category. |
| PUT / PATCH | `/api/categories/{slug}/` | Update category. |
| DELETE | `/api/categories/{slug}/` | Delete category. |

**Create/Update body (JSON):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes (create) | Category name. |
| parent | int (id) or null | No | Parent category id; null for root. |
| is_active | boolean | No | Default true. |

`slug` is auto-generated from `name` on create.

---

## 2a. Sidebar categories (left sidebar)

Left sidebar items: image + title. List and retrieve are public; create/update/delete require Pharmacy Admin.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/sidebar-categories/` | List sidebar categories. |
| GET | `/api/sidebar-categories/{id}/` | Retrieve one sidebar category. |
| POST | `/api/sidebar-categories/` | Create sidebar category (admin). |
| PUT / PATCH | `/api/sidebar-categories/{id}/` | Update sidebar category (admin). |
| DELETE | `/api/sidebar-categories/{id}/` | Delete sidebar category (admin). |

**Response fields:** `id`, `image`, `image_url` (absolute URL), `title`.

**Create/Update (multipart for image):** `image` (file, optional), `title` (string, required on create).

---

## 2b. Ads (banners: image + link)

Promotional ads: image and destination link. List and retrieve are public (only active ads for guests); create/update/delete require Pharmacy Admin.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/ads/` | List ads. Query: `is_active`. Guests see only active. |
| GET | `/api/ads/{id}/` | Retrieve one ad. |
| POST | `/api/ads/` | Create ad (admin). |
| PUT / PATCH | `/api/ads/{id}/` | Update ad (admin). |
| DELETE | `/api/ads/{id}/` | Delete ad (admin). |

**Response fields:** `id`, `image`, `image_url` (absolute URL), `link`, `order`, `is_active`, `created_at`, `updated_at`.

**Create/Update (multipart for image):** `image` (file, required on create), `link` (URL string, optional), `order` (int, default 0), `is_active` (bool, default true).

---

## 2c. Combo packages (cards)

Combo cards like **Health Combo Packages**, **Baby Care Combo Packages** etc. with image, link, and price. List and retrieve are public (only active combos for guests); create/update/delete require Pharmacy Admin.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/combos/` | List combos. Query: `is_active`. Guests see only active. |
| GET | `/api/combos/{id}/` | Retrieve one combo. |
| POST | `/api/combos/` | Create combo (admin). |
| PUT / PATCH | `/api/combos/{id}/` | Update combo (admin). |
| DELETE | `/api/combos/{id}/` | Delete combo (admin). |

**Response fields:** `id`, `title`, `description`, `image`, `image_url`, `link`, `price`, `original_price`, `bg_color`, `order`, `is_active`, `created_at`, `updated_at`.

**Create/Update (multipart for image):**

- `title` (string, required) – e.g. "Health Combo Packages"
- `description` (string, optional) – short tagline for the card
- `image` (file, optional on update; required if you want an image)
- `link` (URL, optional) – where the CTA goes
- `price` (decimal, required) – combo price to display on card
- `original_price` (decimal, optional) – crossed-out price for discount
- `bg_color` (string, optional) – background color (e.g. `#F3F4FF` or a CSS/Tailwind class)
- `order` (int, default 0) – lower first
- `is_active` (bool, default true)

---

## 2d. App logos

App logo assets (e.g. primary header logo, footer logo) keyed by a `slug`. List and retrieve are public; create/update/delete require Pharmacy Admin.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/logos/` | List app logos. |
| GET | `/api/logos/{slug}/` | Retrieve one app logo by slug. |
| POST | `/api/logos/` | Create app logo (admin). |
| PUT / PATCH | `/api/logos/{slug}/` | Update app logo (admin). |
| DELETE | `/api/logos/{slug}/` | Delete app logo (admin). |

**Response fields:** `id`, `slug`, `image`, `image_url`, `created_at`, `updated_at`.

**Create/Update (multipart for image):**

- `slug` (string, required, unique) – identifier, e.g. `header`, `footer`, `mobile-header`.
- `image` (file, required on create; optional on update).

---

## 3. Brands (CRUD)

Brands for product catalog and filters.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/brands/` | List brands. Query: `is_active`, `search`. |
| GET | `/api/brands/{slug}/` | Retrieve one brand. |
| POST | `/api/brands/` | Create brand. |
| PUT / PATCH | `/api/brands/{slug}/` | Update brand. |
| DELETE | `/api/brands/{slug}/` | Delete brand. |

**Create/Update body (JSON):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes (create) | Brand name. |
| is_active | boolean | No | Default true. |

`slug` is auto-generated from `name`.

---

## 4. Ingredients (CRUD)

Generic/active ingredients (e.g. for “Available Dosage” and generic search).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/ingredients/` | List ingredients. Query: `search`. |
| GET | `/api/ingredients/{slug}/` | Retrieve one ingredient. |
| POST | `/api/ingredients/` | Create ingredient. |
| PUT / PATCH | `/api/ingredients/{slug}/` | Update ingredient. |
| DELETE | `/api/ingredients/{slug}/` | Delete ingredient. |

**Create/Update body (JSON):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes (create) | Ingredient name. |

`slug` is auto-generated from `name`.

---

## 5. Products (CRUD, upload, images, inventory)

### 5.1 List and retrieve

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products/` | Paginated list. Query: `category`, `is_active`, `brand_id`, `ingredient_id`, `price_min`, `price_max`, `requires_prescription`, `search`, `ordering`. |
| GET | `/api/products/{slug}/` | Product detail by slug. |

### 5.2 Create product (upload)

**POST** `/api/products/`

Use **multipart/form-data** if you send `image`; otherwise **application/json** is fine.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Product name. |
| price | decimal | Yes | Selling price. |
| slug | string | No | Auto from name if omitted. |
| category | int (id) | No | Category id. |
| brand | int (id) | No | Brand id. |
| ingredient | int (id) | No | Ingredient id. |
| requires_prescription | boolean | No | Default false. |
| description | string | No | Long text. |
| original_price | decimal | No | MRP (for crossed-out price / discount %). |
| image | file | No | Primary product image. |
| unit_label | string | No | e.g. "10 Tablets (1 Strip)". |
| dosage | string | No | e.g. "50mg", "5ml". |
| rating_avg | decimal | No | 0–5. |
| review_count | int | No | Number of reviews. |
| key_benefits | array of strings | No | Bullet points for description tab. |
| specifications | object | No | Key-value, e.g. `{"Dosage Form": "Oral Tablet"}`. |
| quantity_in_stock | int | No | Default 0. |
| low_stock_threshold | int | No | Default 5. |
| is_active | boolean | No | Default true. |

**Response (201):** Full product object (detail shape).

### 5.3 Update product

**PUT** `/api/products/{slug}/` – full update  
**PATCH** `/api/products/{slug}/` – partial update  

Same fields as create; only send fields you want to change.

**Response (200):** Full product object.

### 5.4 Delete product

**DELETE** `/api/products/{slug}/`  
**Response:** 204 No Content.

### 5.5 Gallery images

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products/{slug}/images/` | List gallery images (id, image, image_url, order, created_at). |
| POST | `/api/products/{slug}/images/` | Add one image. **Multipart:** `image` (required), `order` (optional, int). |
| DELETE | `/api/products/{slug}/images/{image_pk}/` | Remove gallery image by id. |

**POST response (201):** `{ "id", "image", "image_url", "order", "created_at" }`.

### 5.6 Inventory (pharmacy admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products/inventory-list/` | Paginated list of products with inventory fields (id, name, slug, category, brand, quantity_in_stock, low_stock_threshold, is_low_stock, is_active, updated_at). Same query params as product list. |
| PATCH | `/api/products/{slug}/inventory/` | Update stock and/or low-stock threshold. |

**PATCH** `/api/products/{slug}/inventory/` body (JSON):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| quantity_in_stock | int (≥ 0) | No* | Current stock. |
| low_stock_threshold | int (≥ 0) | No* | Alert below this. |

\*At least one of the two is required.

**Example:**

```json
{
  "quantity_in_stock": 100,
  "low_stock_threshold": 10
}
```

**Response (200):** Full product object (detail shape).

---

## 6. Orders (view and update status)

Pharmacy admin can list all orders and update status.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/orders/` | List all orders. Query: `status`. |
| GET | `/api/orders/{id}/` | Order detail (items, prescription if linked). |
| PATCH | `/api/orders/{id}/` | Update order status. |

**PATCH** body (JSON):

```json
{
  "status": "CONFIRMED"
}
```

Allowed statuses: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`.

**Note:** Placing orders (POST) is for **registered customers** only, not pharmacy admin.

---

## 7. Prescriptions (list and verify)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/prescriptions/` | List all prescriptions. Query: `status`. |
| GET | `/api/prescriptions/{id}/` | Prescription detail (items when approved). |
| PATCH | `/api/prescriptions/{id}/` | Verify or reject. |

**PATCH** body (verify/reject) – JSON:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | `APPROVED` or `REJECTED`. |
| notes | string | No | Internal notes. |
| doctor_name | string | Yes when approving | Doctor name on Rx. |
| doctor_reg_number | string | Yes when approving | Registration number. |
| has_signature | boolean | Yes when approving | true if signature present. |
| patient_name_on_rx | string | No | Patient name as on Rx. |
| items | array | When approving | `[{ "product": <id>, "quantity_prescribed": <int> }]`. |

**PATCH** `/api/prescriptions/{id}/verify/` is an alias for the same update.

---

## 8. Pagination

List endpoints that return multiple items (products, orders, prescriptions, inventory-list) use **page number pagination**:

**Query:** `?page=2`  
**Response shape:**

```json
{
  "count": 100,
  "next": "http://api.example.com/api/products/?page=3",
  "previous": "http://api.example.com/api/products/?page=1",
  "results": [ ... ]
}
```

Default page size: **20** (configurable in backend).

---

## 9. Error responses

| Status | Meaning |
|--------|--------|
| 400 | Validation error; body has field-level errors. |
| 401 | Missing or invalid token; re-login or refresh. |
| 403 | Forbidden; user is not Pharmacy Admin or Super Admin. |
| 404 | Resource not found (e.g. wrong slug or id). |
| 429 | Rate limit exceeded. |

**Example 400 (validation):**

```json
{
  "name": ["This field is required."],
  "price": ["A valid number is required."]
}
```

**Example 403:**

```json
{
  "detail": "Pharmacy admin or super admin access required."
}
```

---

## 10. Quick reference – Pharmacy Admin only

| Resource | List | Get one | Create | Update | Delete |
|----------|------|---------|--------|--------|--------|
| Categories | GET /api/categories/ | GET /api/categories/{slug}/ | POST | PUT/PATCH | DELETE |
| Sidebar categories | GET /api/sidebar-categories/ | GET /api/sidebar-categories/{id}/ | POST | PUT/PATCH | DELETE |
| Ads | GET /api/ads/ | GET /api/ads/{id}/ | POST | PUT/PATCH | DELETE |
| Combos | GET /api/combos/ | GET /api/combos/{id}/ | POST | PUT/PATCH | DELETE |
| App logos | GET /api/logos/ | GET /api/logos/{slug}/ | POST | PUT/PATCH | DELETE |
| Brands | GET /api/brands/ | GET /api/brands/{slug}/ | POST | PUT/PATCH | DELETE |
| Ingredients | GET /api/ingredients/ | GET /api/ingredients/{slug}/ | POST | PUT/PATCH | DELETE |
| Products | GET /api/products/ | GET /api/products/{slug}/ | POST | PUT/PATCH | DELETE |
| Product images | GET .../images/ | — | POST .../images/ | — | DELETE .../images/{id}/ |
| Inventory | GET /api/products/inventory-list/ | — | — | PATCH .../inventory/ | — |
| Orders | GET /api/orders/ | GET /api/orders/{id}/ | — | PATCH (status) | — |
| Prescriptions | GET /api/prescriptions/ | GET /api/prescriptions/{id}/ | — | PATCH (verify) | — |

---

## 11. OpenAPI / Swagger

- **Schema:** `GET /api/schema/`  
- **Swagger UI:** `GET /api/schema/swagger/`  

Use for interactive testing and code generation.
