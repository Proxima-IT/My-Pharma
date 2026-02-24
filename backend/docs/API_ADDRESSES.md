# Multiple User Addresses – CRUD API

Each user can have **multiple saved addresses** with: **Full Name**, **Phone**, **Delivery area** (Bangladesh district dropdown), **Address** (user input), **Address type** (Home, Office, Hometown), and **Set default address**.

**Base URL:** `/api/auth/addresses/`  
**Auth:** All endpoints require `Authorization: Bearer <access_token>` (authenticated user). Users can only list, create, update, and delete **their own** addresses.

---

## 1. Address object (response shape)

Returned in list, detail, and in `GET /api/auth/me/` under `user.addresses`:

| Field                 | Type    | Description                                                          |
| --------------------- | ------- | -------------------------------------------------------------------- |
| `id`                  | integer | Address ID                                                           |
| `full_name`           | string  | Full name for delivery                                               |
| `phone`               | string  | Phone number (normalized, e.g. BD format)                            |
| `delivery_area`       | string  | District name (one of 64 Bangladesh districts)                      |
| `address`             | string  | User-entered address (area, house, road, etc.)                        |
| `address_type`        | string  | `HOME`, `OFFICE`, or `HOMETOWN`                                      |
| `address_type_display`| string  | Display label: "Home", "Office", or "Hometown"                        |
| `is_default`           | boolean | If true, this is the user’s default address; only one default per user |
| `created_at`          | string  | ISO 8601 datetime                                                     |
| `updated_at`          | string  | ISO 8601 datetime                                                     |

**Address type values:** Use `HOME`, `OFFICE`, or `HOMETOWN` in requests.

---

## 2. Delivery area (Bangladesh districts) – GET `/api/auth/addresses/districts/`

Returns the list of **64 Bangladesh districts** for the delivery area dropdown. Same auth as other address endpoints.

**Request:** No body. Headers: `Authorization: Bearer <access_token>`.

**Response (200):** Array of district names (strings).

```json
[
  "Bagerhat", "Bandarban", "Barguna", "Barishal", "Bhola", "Bogura", "Brahmanbaria",
  "Chandpur", "Chapainawabganj", "Chattogram", "Chuadanga", "Cumilla", "Cox's Bazar",
  "Dhaka", "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj",
  "Habiganj", "Jaipurhat", "Jamalpur", "Jashore", "Jhalokathi", "Jhenaidah",
  "Khagrachari", "Khulna", "Kishoreganj", "Kurigram", "Kushtia", "Lalmonirhat",
  "Laxmipur", "Madaripur", "Magura", "Manikganj", "Meherpur", "Moulvibazar",
  "Munshiganj", "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi",
  "Natore", "Netrakona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh",
  "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur",
  "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet",
  "Tangail", "Thakurgaon"
]
```

Use these exact strings as `delivery_area` when creating or updating an address.

---

## 3. Endpoints overview

| Method | Path                              | Description                          |
| ------ | --------------------------------- | ------------------------------------ |
| GET    | `/api/auth/addresses/districts/`  | List BD districts (delivery area dropdown) |
| GET    | `/api/auth/addresses/`            | List current user’s addresses        |
| POST   | `/api/auth/addresses/`            | Create a new address                 |
| GET    | `/api/auth/addresses/<id>/`       | Get one address by ID                |
| PUT    | `/api/auth/addresses/<id>/`       | Full update (all fields)             |
| PATCH  | `/api/auth/addresses/<id>/`       | Partial update                       |
| DELETE | `/api/auth/addresses/<id>/`       | Delete address                       |

- **401 Unauthorized:** Missing or invalid token.
- **403 Forbidden:** User not allowed (e.g. not registered).
- **404 Not Found:** Address not found or not owned by current user.

---

## 4. List addresses – GET `/api/auth/addresses/`

Returns all addresses for the current user, ordered by default first, then by creation date.

**Request:** No body. Headers: `Authorization: Bearer <access_token>`.

**Response (200):**

```json
[
  {
    "id": 1,
    "full_name": "John Doe",
    "phone": "8801712345678",
    "delivery_area": "Dhaka",
    "address": "House 5, Road 12, Dhanmondi",
    "address_type": "HOME",
    "address_type_display": "Home",
    "is_default": true,
    "created_at": "2026-02-24T10:00:00Z",
    "updated_at": "2026-02-24T10:00:00Z"
  },
  {
    "id": 2,
    "full_name": "John Doe",
    "phone": "8801812345678",
    "delivery_area": "Chattogram",
    "address": "Office Tower, Agrabad",
    "address_type": "OFFICE",
    "address_type_display": "Office",
    "is_default": false,
    "created_at": "2026-02-24T11:00:00Z",
    "updated_at": "2026-02-24T11:00:00Z"
  }
]
```

---

## 5. Create address – POST `/api/auth/addresses/`

Creates a new address for the current user. The `user` is set by the server from the token; do not send `user` in the body.

**Request body:**

| Field            | Type    | Required | Description                                                       |
| ---------------- | ------- | -------- | ----------------------------------------------------------------- |
| `full_name`      | string  | Yes      | Full name for delivery                                            |
| `phone`          | string  | Yes      | Phone number (min 10 digits; BD format supported)                |
| `delivery_area`  | string  | Yes      | One of the 64 BD district names (use `GET .../districts/`)       |
| `address`        | string  | Yes      | User-entered address (area, house, road, etc.)                     |
| `address_type`   | string  | No*      | `HOME`, `OFFICE`, or `HOMETOWN`. Default: `HOME`                   |
| `is_default`     | boolean | No       | Default: `false`. If `true`, others become non-default.            |

\* If omitted, `address_type` defaults to `HOME`.

**Example – Home address:**

```json
{
  "full_name": "John Doe",
  "phone": "01712345678",
  "delivery_area": "Dhaka",
  "address": "House 5, Road 12, Dhanmondi",
  "address_type": "HOME",
  "is_default": true
}
```

**Example – Office address:**

```json
{
  "full_name": "John Doe",
  "phone": "01812345678",
  "delivery_area": "Chattogram",
  "address": "Office Tower, Agrabad CDA",
  "address_type": "OFFICE",
  "is_default": false
}
```

**Example – Hometown:**

```json
{
  "full_name": "John Doe",
  "phone": "01912345678",
  "delivery_area": "Sylhet",
  "address": "Village: XYZ, Upazila: ABC",
  "address_type": "HOMETOWN"
}
```

**Response (201):** Single address object (same shape as in list).

**Validation errors (400):**

```json
{
  "full_name": ["Full name is required."],
  "phone": ["Phone number is required."],
  "phone": ["Invalid phone number."],
  "delivery_area": ["Delivery area (district) is required."],
  "delivery_area": ["Delivery area must be one of the 64 Bangladesh districts."],
  "address": ["Address is required."],
  "address_type": ["Must be one of: HOME, OFFICE, HOMETOWN."]
}
```

---

## 6. Get one address – GET `/api/auth/addresses/<id>/`

Returns a single address. Returns 404 if the address does not exist or does not belong to the current user.

**Response (200):** Single address object.

---

## 7. Full update – PUT `/api/auth/addresses/<id>/`

Updates all fields of an address. Send the full address object.

**Request body:** Same fields as create (without `user`). All required except `address_type` (default HOME) and `is_default` (default false).

**Response (200):** Updated address object.

**404:** Address not found or not owned by current user.

---

## 8. Partial update – PATCH `/api/auth/addresses/<id>/`

Updates only the provided fields (e.g. change only `is_default` or `phone`).

**Example – Set as default:**

```json
{
  "is_default": true
}
```

**Example – Change address type:**

```json
{
  "address_type": "HOMETOWN"
}
```

**Response (200):** Updated address object.

**404:** Address not found or not owned by current user.

---

## 9. Delete address – DELETE `/api/auth/addresses/<id>/`

Permanently deletes the address. Only the owner can delete.

**Request:** No body.

**Response (204):** No content.

**404:** Address not found or not owned by current user.

---

## 10. User profile and addresses

- **GET /api/auth/me/** returns the current user object including an **`addresses`** array (same address shape as above).
- Addresses are **scoped per user**: the `user` relation is set by the server from the JWT; clients never send or change `user` for an address.

---

## 11. Summary

| Action         | Method | Path                          | Body / params |
| -------------- | ------ | ----------------------------- | ------------- |
| Districts list | GET    | `/api/auth/addresses/districts/` | —             |
| List           | GET    | `/api/auth/addresses/`        | —             |
| Create         | POST   | `/api/auth/addresses/`        | full_name, phone, delivery_area, address, address_type, is_default |
| Get one        | GET    | `/api/auth/addresses/<id>/`   | —             |
| Full update    | PUT    | `/api/auth/addresses/<id>/`   | Full address  |
| Partial update | PATCH  | `/api/auth/addresses/<id>/`   | Partial fields |
| Delete         | DELETE | `/api/auth/addresses/<id>/`   | —             |

**Fields:** 1) Full Name, 2) Phone number, 3) Delivery area (BD district – use districts endpoint for dropdown), 4) Address (user input), 5) Address type (Home, Office, Hometown), 6) Set default address (`is_default`).
