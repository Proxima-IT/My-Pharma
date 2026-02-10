# My Pharma – API Reference (All Current Endpoints)

Single reference for **all current auth API endpoints**: request/response schemas, validation, errors, rate limits, and usage for app and web.

**Base URL:** `http://localhost:8001` (or your API host)  
**Auth prefix:** `/api/auth/`

**→ User hierarchy & role permissions:** [RBAC.md](RBAC.md) (Super Admin, Pharmacy Admin, Doctor, Registered User, Guest; permissions matrix and admin/API access).

**→ Admin panel REST API (users, products, orders, prescriptions, consultations, CMS):** [ADMIN_API.md](ADMIN_API.md).

---

## 1. General

### 1.1 Headers

| Header          | Required            | Value                   |
| --------------- | ------------------- | ----------------------- |
| `Content-Type`  | All POST/PUT        | `application/json`      |
| `Accept`        | Optional            | `application/json`      |
| `Authorization` | Protected endpoints | `Bearer <access_token>` |

- Missing or wrong `Content-Type` on POST → **415 Unsupported Media Type**.

### 1.2 Authentication

- **Public:** No `Authorization` header.
- **Protected:** Send `Authorization: Bearer <access_token>`.

### 1.3 Common error body

```json
{
  "detail": "Human-readable message.",
  "code": "error_code"
}
```

Validation errors (400):

```json
{
  "field_name": ["Error message."]
}
```

### 1.4 User object (in responses)

Returned as `user` in token responses and in `GET /api/auth/me/`:

| Field             | Type    | Description                                                  |
| ----------------- | ------- | ------------------------------------------------------------ |
| `id`              | integer | User ID                                                      |
| `username`        | string  | Display username (from registration)                         |
| `email`           | string  | Email (empty if phone-only)                                  |
| `phone`           | string  | Phone (e.g. `01712345678`)                                   |
| `profile_picture` | string  | URL to profile image (null if not set)                       |
| `address`         | string  | Address (from registration)                                  |
| `role`            | string  | `SUPER_ADMIN`, `PHARMACY_ADMIN`, `DOCTOR`, `REGISTERED_USER` |
| `role_display`    | string  | Display label for role                                       |
| `status`          | string  | `ACTIVE`, `INACTIVE`, `LOCKED`, `PENDING_VERIFICATION`       |
| `status_display`  | string  | Display label for status                                     |
| `email_verified`  | boolean | Email verified                                               |
| `phone_verified`  | boolean | Phone verified                                               |
| `created_at`      | string  | ISO 8601 datetime                                            |

**RBAC:** Role determines API and admin access. See **[docs/RBAC.md](RBAC.md)** for user hierarchy and permissions matrix.

### 1.5 Token response shape

Endpoints that return tokens return:

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    /* User object above */
  }
}
```

- **Access token:** 24 hours; send in `Authorization: Bearer <access>`.
- **Refresh token:** 7 days; use only with `POST /api/auth/token/refresh/`.

---

## 2. Endpoints overview

| Method | Path                           | Auth | Throttle         | Description                                                                   |
| ------ | ------------------------------ | ---- | ---------------- | ----------------------------------------------------------------------------- |
| POST   | `/api/auth/request-otp/`       | No   | 3/hour per id    | Request OTP by **email or phone** (unified)                                   |
| POST   | `/api/auth/verify-otp/`        | No   | 10/min per IP    | Verify OTP (email or phone), get registration token                           |
| POST   | `/api/auth/register/complete/` | No   | —                | Complete registration: username, password, other id, profile_picture, address |
| POST   | `/api/auth/register/phone/`    | No   | 3/hour per phone | Request OTP phone only (legacy)                                               |
| POST   | `/api/auth/register/email/`    | No   | —                | Register with email + password (one step)                                     |
| POST   | `/api/auth/login/`             | No   | 5/min per IP     | Login (email or phone + password)                                             |
| POST   | `/api/auth/token/refresh/`     | No   | —                | Get new access + refresh                                                      |
| POST   | `/api/auth/logout/`            | Yes  | —                | Logout (blacklist tokens)                                                     |
| POST   | `/api/auth/password-reset/`    | No   | —                | Request password reset email                                                  |
| GET    | `/api/auth/me/`                | Yes  | —                | Current user profile                                                          |

---

## 3. Endpoint details

### 3.1 POST `/api/auth/request-otp/` (unified)

User submits **email or phone**; backend sends OTP to that channel (SMS for phone, email for email). Exactly one of `email` or `phone` is required.

**Auth:** None  
**Throttle:** 3 requests per hour per identifier (phone or email).

**Request body (phone):** `{"phone": "01712345678"}`  
**Request body (email):** `{"email": "user@example.com"}`

| Field   | Type   | Required | Validation                          |
| ------- | ------ | -------- | ----------------------------------- |
| `email` | string | Yes\*    | Valid email                         |
| `phone` | string | Yes\*    | Min 10 digits (BD format supported) |

\*Provide **exactly one** of `email` or `phone`.

**Success (200):** If phone: "Check your phone for the code." If email: "Check your email for the code."

**Errors:** 400 both/neither or invalid; 429 `otp_rate_limit`. OTP 6 digits, 5 min expiry, max 3/hour per identifier.

---

### 3.2 POST `/api/auth/verify-otp/`

Verify OTP by **email or phone** (same identifier as request-otp). Returns `registration_token` and verified identifier (frontend shows verified value as **uneditable** in completion form).

**Auth:** None  
**Throttle:** 10 requests per minute per IP.

**Request body (phone):** `{"phone": "01712345678", "otp": "123456"}`  
**Request body (email):** `{"email": "user@example.com", "otp": "123456"}`

| Field   | Type   | Required | Validation          |
| ------- | ------ | -------- | ------------------- |
| `email` | string | Yes\*    | Same as request-otp |
| `phone` | string | Yes\*    | Same as request-otp |
| `otp`   | string | Yes      | 6 digits            |

\*Provide **exactly one** of `email` or `phone`.

**Success (200):** `registration_token`, `verified_identifier_type` ("phone" or "email"), `verified_identifier_value`, `phone` or `email` (for backward compat), `expires_in` (seconds).

**Errors:** 400 `invalid_otp`; 429 too many attempts.

---

### 3.3 POST `/api/auth/register/complete/`

User creation form after OTP. **Required:** `registration_token`, `password`, `username`. **Optional:** the **other** identifier (if verified by phone, add `email`; if by email, add `phone`), `profile_picture` (file), `address`, `first_name`, `last_name`. Use `multipart/form-data` when sending `profile_picture`.

| Field                      | Type   | Required | Validation                                |
| -------------------------- | ------ | -------- | ----------------------------------------- |
| `registration_token`       | string | Yes      | From verify-otp                           |
| `password`                 | string | Yes      | Min 8; upper, lower, number, special char |
| `username`                 | string | Yes      | Unique display name                       |
| `email`                    | string | No\*     | If verified was **phone**                 |
| `phone`                    | string | No\*     | If verified was **email** (min 10 digits) |
| `profile_picture`          | file   | No       | Image (JPEG/PNG)                          |
| `address`                  | string | No       | Max 500 chars                             |
| `first_name` / `last_name` | string | No       | Max 150 chars each                        |

**Success (200):** Token response (access, refresh, user with `username`, `profile_picture`, `address`).

**Errors:** 400 `invalid_registration_token` or validation (username/email/phone duplicate, weak password).

---

### 3.4 POST `/api/auth/register/phone/` (legacy)

Request OTP for phone only. Prefer **request-otp** for unified flow. Body: `{"phone": "01712345678"}`. Success: "Check your phone for the code." Errors: 400 invalid phone; 429 `otp_rate_limit`.

---

### 3.5 POST `/api/auth/register/email/`

Register with email and password in one step. Returns tokens and user.

**Auth:** None  
**Throttle:** None.

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass1!"
}
```

| Field      | Type   | Required | Validation                                      |
| ---------- | ------ | -------- | ----------------------------------------------- |
| `email`    | string | Yes      | Valid email; must not already exist             |
| `password` | string | Yes      | Min 8 chars; upper, lower, number, special char |

**Success (200):** Token response (access, refresh, user).

**Errors:**

| Status | Code | Condition                                        |
| ------ | ---- | ------------------------------------------------ |
| 400    | —    | Validation (e.g. duplicate email, weak password) |

---

### 3.6 POST `/api/auth/login/`

Login with **email or phone** (the same identifier used at registration) and password. Returns tokens and user.

**Auth:** None  
**Throttle:** 5 requests per minute per IP.

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

| Field      | Type   | Required | Validation                                                                  |
| ---------- | ------ | -------- | --------------------------------------------------------------------------- |
| `email`    | string | Yes\*    | Valid email (use for email-registered users)                                |
| `phone`    | string | Yes\*    | Phone (min 10 digits; BD format supported). Use for phone-registered users. |
| `password` | string | Yes      | User password                                                               |

\*Provide **exactly one** of `email` or `phone` (not both, not neither).

**Success (200):** Token response (access, refresh, user).

**Errors:**

| Status | Code                  | Condition                                                         |
| ------ | --------------------- | ----------------------------------------------------------------- |
| 400    | —                     | Both or neither of email/phone; or invalid phone (e.g. too short) |
| 401    | `invalid_credentials` | Wrong email/phone or password                                     |
| 423    | `account_locked`      | Account locked after 5 failed attempts (30 minutes)               |
| 429    | —                     | Too many login attempts                                           |

---

### 3.7 POST `/api/auth/token/refresh/`

Exchange a valid refresh token for new access and refresh tokens (rotation). May include current user in response.

**Auth:** None (uses body refresh token).

**Request body:**

```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

| Field     | Type   | Required |
| --------- | ------ | -------- |
| `refresh` | string | Yes      |

**Success (200):**

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    /* User object, if available */
  }
}
```

**Errors:**

| Status | Code | Condition                                         |
| ------ | ---- | ------------------------------------------------- |
| 401    | —    | Invalid or expired refresh token (or blacklisted) |

---

### 3.8 POST `/api/auth/logout/`

Blacklist the current access token and, if provided, the refresh token. Requires a valid access token.

**Auth:** Required (`Authorization: Bearer <access_token>`).

**Request body (optional):**

```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Success (200):**

```json
{
  "message": "Logged out successfully."
}
```

**Errors:**

| Status | Code | Condition                       |
| ------ | ---- | ------------------------------- |
| 401    | —    | Missing or invalid access token |

---

### 3.9 POST `/api/auth/password-reset/`

Request a password reset for the given email. If the user exists, a reset email is sent (via Celery). Response is same whether or not the email exists (security).

**Auth:** None  
**Throttle:** None.

**Request body:**

```json
{
  "email": "user@example.com"
}
```

| Field   | Type   | Required |
| ------- | ------ | -------- |
| `email` | string | Yes      |

**Success (200):**

```json
{
  "message": "If an account exists with this email, you will receive reset instructions."
}
```

---

### 3.10 GET `/api/auth/me/`

Return the current authenticated user profile.

**Auth:** Required (`Authorization: Bearer <access_token>`).

**Request body:** None.

**Success (200):** User object (same shape as in token responses).

**Errors:**

| Status | Code | Condition                                |
| ------ | ---- | ---------------------------------------- |
| 401    | —    | Missing or invalid/expired/revoked token |
| 404    | —    | User not found (e.g. soft-deleted)       |

---

## 4. HTTP status codes summary

| Code | Meaning                                                                |
| ---- | ---------------------------------------------------------------------- |
| 200  | Success                                                                |
| 400  | Bad request / validation error                                         |
| 401  | Unauthorized (invalid or missing token / wrong credentials)            |
| 403  | Forbidden (insufficient permissions)                                   |
| 404  | Not found                                                              |
| 415  | Unsupported Media Type (e.g. missing `Content-Type: application/json`) |
| 423  | Locked (account locked)                                                |
| 429  | Too many requests (rate limit)                                         |
| 500  | Server error                                                           |

---

## 5. Rate limits (current)

| Endpoint / scope                 | Limit                |
| -------------------------------- | -------------------- |
| `POST /api/auth/register/phone/` | 3 per hour per phone |
| `POST /api/auth/verify-otp/`     | 10 per minute per IP |
| `POST /api/auth/login/`          | 5 per minute per IP  |
| Generic auth (default throttle)  | 10 per minute per IP |

When exceeded → **429** with body like `{"detail": "...", "code": "..."}`.

---

## 6. Password rules

- Minimum 8 characters.
- At least one uppercase letter.
- At least one lowercase letter.
- At least one digit.
- At least one special character from: `@$!%*?&#`.

---

## 7. Phone registration flow (3 steps)

1. **POST** `/api/auth/register/phone/` with `{"phone": "01712345678"}` → OTP sent.
2. **POST** `/api/auth/verify-otp/` with `{"phone": "01712345678", "otp": "123456"}` → receive `registration_token`.
3. **POST** `/api/auth/register/complete/` with `registration_token`, `password`, and optional `email`, `first_name`, `last_name` → user created and tokens returned.

`registration_token` is valid for 10 minutes (configurable). If expired, repeat steps 1 and 2.

---

## 8. Roles (RBAC)

| Role              | Description                            |
| ----------------- | -------------------------------------- |
| `SUPER_ADMIN`     | Full system access                     |
| `PHARMACY_ADMIN`  | Pharmacy management                    |
| `DOCTOR`          | Doctor-specific features               |
| `REGISTERED_USER` | Standard user                          |
| `GUEST_USER`      | No DB record; unauthenticated browsing |

Use `GET /api/auth/me/` to know the current user’s `role`. Protected endpoints can enforce role via permission classes (see backend code).

---

## 9. OpenAPI / Swagger

- **Schema (JSON):** `GET /api/schema/`
- **Swagger UI:** `GET /api/schema/swagger/`

Use these for code generation or interactive testing.

---

## 10. Related docs

- **Frontend integration (fetch, axios, cURL):** [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)
- **Registration flow and system overview:** [REGISTRATION_AND_SYSTEM.md](REGISTRATION_AND_SYSTEM.md)
- **Security checklist:** [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md)
