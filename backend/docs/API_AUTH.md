# My Pharma – Authentication API Reference

This document describes the **REST Authentication API** for the My Pharma MVP. Use it from mobile apps and web frontends.

**→ For a single reference of all current endpoints (schemas, errors, rate limits):** [API_REFERENCE.md](API_REFERENCE.md).

**→ Unified registration (recommended):** User submits **email or phone** → [request-otp] → OTP sent to SMS or email → [verify-otp] → [register/complete] with username, password, other identifier (optional), profile_picture, address. See [API_REFERENCE.md](API_REFERENCE.md) §3.1–3.3 and [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md).

**→ Legacy:** [register/phone] → [verify-otp] → [register/complete]. See [REGISTRATION_AND_SYSTEM.md](REGISTRATION_AND_SYSTEM.md).

**Base URL:** `https://api.mypharma.com` (replace with your host in development, e.g. `http://localhost:8000`).

**Prefix:** All auth endpoints live under `/api/auth/`.

**Content-Type:** `application/json` — **required** on all POST/PUT requests; otherwise the API returns **415 Unsupported Media Type**.

**Authentication:** Where required, send header: `Authorization: Bearer <access_token>`.

---

## 0. Unified: Request OTP by Email or Phone (recommended)

**Endpoint:** `POST /api/auth/request-otp/`

**Description:** User enters **email or phone**; backend sends a 6-digit OTP to that channel (SMS for phone, email for email). Exactly one of `email` or `phone` is required.

**Request body (phone):** `{"phone": "01712345678"}`  
**Request body (email):** `{"email": "user@example.com"}`

**Response – 200 OK:** `{"message": "OTP sent successfully.", "detail": "Check your phone/email for the code."}`

**Errors:** 400 (both/neither or invalid); 429 `otp_rate_limit` (max 3 per hour per identifier). OTP expires in 5 minutes.

Then use **Verify OTP** (§2) with the same identifier + `otp`, and **Complete Registration** (§3) with `registration_token`, `username`, `password`, and optionally the **other** identifier (email if verified by phone, phone if verified by email), `profile_picture`, `address`, `first_name`, `last_name`. The verified identifier is returned as `verified_identifier_type` and `verified_identifier_value` – show it in the form as **uneditable**.

---

## 1. Register with Phone (OTP) – legacy

**Endpoint:** `POST /api/auth/register/phone/`

**Description:** Request a 6-digit OTP for the given phone number. OTP is sent via SMS (Celery). Rate-limited per phone and per IP.

**Request body:**

```json
{
  "phone": "01712345678"
}
```

| Field | Type   | Required | Description                       |
| ----- | ------ | -------- | --------------------------------- |
| phone | string | Yes      | Phone number (e.g. BD 01xxxxxxxx) |

**Response – 200 OK**

```json
{
  "message": "OTP sent successfully.",
  "detail": "Check your phone for the code."
}
```

**Error – 429 Too Many Requests (OTP rate limit)**

```json
{
  "detail": "Too many OTP requests. Try again later.",
  "code": "otp_rate_limit"
}
```

**Error – 400 Bad Request (validation)**

```json
{
  "phone": ["Invalid phone number."]
}
```

**Rules:**

- OTP expires in 5 minutes.
- Max 3 OTP requests per phone per hour.

---

## 2. Verify OTP (Step 2 of phone registration – no account yet)

**Endpoint:** `POST /api/auth/verify-otp/`

**Description:** Verify the OTP. Does **not** create a user. Returns a short-lived **registration_token** that the frontend must use in the next step to show the **user completion form** (password, name, email, etc.).

**Request body:**

```json
{
  "phone": "01712345678",
  "otp": "123456"
}
```

| Field | Type   | Required | Description       |
| ----- | ------ | -------- | ----------------- |
| phone | string | Yes      | Same as in step 1 |
| otp   | string | Yes      | 6-digit OTP       |

**Response – 200 OK**

```json
{
  "message": "OTP verified. Complete your registration.",
  "registration_token": "550e8400-e29b-41d4-a716-446655440000",
  "phone": "01712345678",
  "expires_in": 600
}
```

- **registration_token:** Use this in `POST /api/auth/register/complete/` (valid for 10 minutes by default).
- **phone:** Verified phone (for display/prefill).
- **expires_in:** Token validity in seconds.

**Error – 400 Bad Request (invalid/expired OTP)**

```json
{
  "detail": "Invalid or expired OTP.",
  "code": "invalid_otp"
}
```

**HTTP status codes:** 200 (success), 400 (invalid OTP / validation), 429 (rate limit).

---

## 3. Complete Registration (Step 3 – user creation form)

**Endpoint:** `POST /api/auth/register/complete/`

**Required:** `registration_token`, `password`, `username`. **Optional:** the **other** identifier (email if verified by phone; phone if verified by email), `profile_picture` (file; use `multipart/form-data`), `address`, `first_name`, `last_name`. The verified identifier from verify-otp is fixed; show it in the form as uneditable.

**Description:** After OTP verification, send the **registration_token** plus **password** and optional profile fields. Creates the user and returns JWT access + refresh and user profile.

**Request body:**

```json
{
  "registration_token": "550e8400-e29b-41d4-a716-446655440000",
  "password": "SecurePass1!",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

| Field              | Type   | Required | Description                                     |
| ------------------ | ------ | -------- | ----------------------------------------------- |
| registration_token | string | Yes      | From step 2 (verify-otp) response               |
| password           | string | Yes      | Min 8 chars; upper, lower, number, special char |
| email              | string | No       | Optional email                                  |
| first_name         | string | No       | Optional                                        |
| last_name          | string | No       | Optional                                        |

**Response – 200 OK**

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "phone": "01712345678",
    "first_name": "John",
    "last_name": "Doe",
    "role": "REGISTERED_USER",
    "role_display": "Registered User",
    "status": "ACTIVE",
    "status_display": "Active",
    "email_verified": false,
    "phone_verified": true,
    "created_at": "2025-02-02T10:00:00Z"
  }
}
```

**Error – 400 (invalid/expired registration token)**

```json
{
  "detail": "Invalid or expired registration token. Please complete phone and OTP steps again.",
  "code": "invalid_registration_token"
}
```

**Error – 400 (validation, e.g. weak password or duplicate email)**

```json
{
  "password": [
    "Password must contain uppercase, lowercase, number and special character."
  ]
}
```

---

## 4. Register with Email

**Endpoint:** `POST /api/auth/register/email/`

**Description:** Register with email and password. Password must meet strength rules (min 8 chars, upper, lower, number, special char).

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass1!"
}
```

| Field    | Type   | Required | Description                                |
| -------- | ------ | -------- | ------------------------------------------ |
| email    | string | Yes      | Valid email                                |
| password | string | Yes      | Min 8 chars; upper, lower, number, special |

**Response – 200 OK**

Same structure as Verify OTP: `access`, `refresh`, `user`.

**Error – 400 (validation)**

```json
{
  "email": ["A user with this email already exists."]
}
```

or

```json
{
  "password": [
    "Password must contain uppercase, lowercase, number and special character."
  ]
}
```

---

## 5. Login

**Endpoint:** `POST /api/auth/login/`

**Description:** Login with **email or phone** (the same identifier used at registration) and password. Returns JWT access + refresh and user. Account locks after 5 failed attempts for 30 minutes.

**Request body (email):**

```json
{
  "email": "user@example.com",
  "password": "SecurePass1!"
}
```

**Request body (phone):**

```json
{
  "phone": "01712345678",
  "password": "SecurePass1!"
}
```

Provide exactly one of `email` or `phone` (not both). Phone must be at least 10 digits (BD format supported).

**Response – 200 OK**

Same as Verify OTP: `access`, `refresh`, `user`.

**Error – 401 Unauthorized**

```json
{
  "detail": "Invalid email or password.",
  "code": "invalid_credentials"
}
```

(When logging in with phone, `detail` may be "Invalid phone or password.")

**Error – 423 Locked (account locked)**

```json
{
  "detail": "Account temporarily locked due to too many failed attempts.",
  "code": "account_locked"
}
```

**Error – 429**  
Rate limit (e.g. 5 login attempts per minute per IP).

---

## 6. Refresh Token

**Endpoint:** `POST /api/auth/token/refresh/`

**Description:** Exchange a valid refresh token for a new access token and new refresh token (rotation). Optionally includes current `user` in response.

**Request body:**

```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response – 200 OK**

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": { ... }
}
```

**Error – 401**  
Invalid or expired refresh token (or blacklisted).

---

## 7. Logout

**Endpoint:** `POST /api/auth/logout/`

**Description:** Revoke the current session: blacklist the refresh token (if sent) and the current access token. Requires authentication.

**Headers:** `Authorization: Bearer <access_token>`

**Request body (optional):**

```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response – 200 OK**

```json
{
  "message": "Logged out successfully."
}
```

**Error – 401**  
Missing or invalid access token.

---

## 8. Password Reset Request

**Endpoint:** `POST /api/auth/password-reset/`

**Description:** Request a password reset for the given email. If an account exists, an email is sent (via Celery). Same response whether or not the email exists (security).

**Request body:**

```json
{
  "email": "user@example.com"
}
```

**Response – 200 OK**

```json
{
  "message": "If an account exists with this email, you will receive reset instructions."
}
```

---

## 9. Current User (Me)

### GET `/api/auth/me/`

**Description:** Return the current authenticated user profile. Requires valid access token.

**Headers:** `Authorization: Bearer <access_token>`

**Response – 200 OK**

```json
{
  "id": 1,
  "username": "johndoe",
  "email": "user@example.com",
  "phone": "",
  "profile_picture": "http://localhost:8001/media/profile_pics/2025/02/photo.jpg",
  "address": "123 Main St, Dhaka",
  "gender": "MALE",
  "gender_display": "Male",
  "date_of_birth": "1990-05-15",
  "role": "REGISTERED_USER",
  "role_display": "Registered User",
  "status": "ACTIVE",
  "status_display": "Active",
  "email_verified": true,
  "phone_verified": false,
  "created_at": "2025-02-02T10:00:00Z"
}
```

- `gender`: one of `MALE`, `FEMALE`, `OTHER`, or null.
- `gender_display`: human-readable label, or null if gender not set.
- `date_of_birth`: ISO date (YYYY-MM-DD) or null.

**Error – 401**  
Missing or invalid/expired/revoked token.

**Error – 404**  
User not found (e.g. soft-deleted).

### PUT / PATCH `/api/auth/me/` (update profile)

**Description:** Update the current user’s profile. Only provided fields are updated (PATCH = partial; PUT also updates only the sent fields).

**Headers:** `Authorization: Bearer <access_token>`

**Updatable fields (all optional):** `username`, `profile_picture`, `address`, `gender`, `date_of_birth`.

| Field             | Type   | Description                                      |
| ----------------- | ------ | ------------------------------------------------ |
| `username`        | string | Display name (must be unique)                     |
| `profile_picture` | file   | Image (use `multipart/form-data` if sending file) |
| `address`         | string | Address text                                      |
| `gender`          | string | `MALE`, `FEMALE`, or `OTHER`; null to clear      |
| `date_of_birth`   | string | ISO date (YYYY-MM-DD); null to clear             |

**Request:** `application/json` for JSON body, or `multipart/form-data` when including `profile_picture`.

**Response – 200 OK:** Full user object (same shape as GET `/api/auth/me/`).

**Error – 400**  
Validation error (e.g. duplicate username).

**Error – 401**  
Missing or invalid/expired/revoked token.

**Error – 404**  
User not found (e.g. soft-deleted).

---

## Token Strategy

| Token   | Lifetime | Usage                                                            |
| ------- | -------- | ---------------------------------------------------------------- |
| Access  | 24 hours | Send in `Authorization: Bearer <access>` for protected endpoints |
| Refresh | 7 days   | Send to `/api/auth/token/refresh/` to get new access + refresh   |

- Refresh tokens are rotated and the previous one is blacklisted after use.
- On logout, both the refresh token (if provided) and the current access token are blacklisted so they cannot be reused.

---

## Roles (RBAC)

| Role            | Description                            |
| --------------- | -------------------------------------- |
| SUPER_ADMIN     | Full system access                     |
| PHARMACY_ADMIN  | Pharmacy management                    |
| DOCTOR          | Doctor-specific features               |
| REGISTERED_USER | Standard registered user               |
| GUEST_USER      | No DB record; unauthenticated browsing |

Protected endpoints can enforce role via permission classes (e.g. `IsPharmacyAdminOrSuper`, `IsDoctorOrAbove`). Use `GET /api/auth/me/` to know the current user’s `role`.

---

## Guest Access

- Endpoints that do not require `Authorization` allow unauthenticated (guest) access.
- Converting a guest to a registered user (e.g. preserving cart) is handled by your frontend flow: after registration or OTP verification, use the returned tokens and optionally merge guest cart into the new user’s cart in your own APIs.

---

## HTTP Status Codes Summary

| Code | Meaning                                                    |
| ---- | ---------------------------------------------------------- |
| 200  | Success                                                    |
| 400  | Bad request / validation error                             |
| 401  | Unauthorized (invalid or missing token, wrong credentials) |
| 403  | Forbidden (insufficient permissions)                       |
| 404  | Not found                                                  |
| 423  | Locked (account locked)                                    |
| 429  | Too many requests (rate limit)                             |
| 500  | Server error                                               |

---

## OpenAPI / Swagger

- **Schema (JSON):** `GET /api/schema/`
- **Swagger UI:** `GET /api/schema/swagger/`

Use these for code generation or interactive testing.
