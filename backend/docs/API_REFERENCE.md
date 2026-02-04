# My Pharma – API Reference (All Current Endpoints)

Single reference for **all current auth API endpoints**: request/response schemas, validation, errors, rate limits, and usage for app and web.

**Base URL:** `http://localhost:8001` (or your API host)  
**Auth prefix:** `/api/auth/`

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

| Field            | Type    | Description                                                  |
| ---------------- | ------- | ------------------------------------------------------------ |
| `id`             | integer | User ID                                                      |
| `email`          | string  | Email (empty if phone-only)                                  |
| `phone`          | string  | Phone (e.g. `01712345678`)                                   |
| `first_name`     | string  | First name                                                   |
| `last_name`      | string  | Last name                                                    |
| `role`           | string  | `SUPER_ADMIN`, `PHARMACY_ADMIN`, `DOCTOR`, `REGISTERED_USER` |
| `role_display`   | string  | Display label for role                                       |
| `status`         | string  | `ACTIVE`, `INACTIVE`, `LOCKED`, `PENDING_VERIFICATION`       |
| `status_display` | string  | Display label for status                                     |
| `email_verified` | boolean | Email verified                                               |
| `phone_verified` | boolean | Phone verified                                               |
| `created_at`     | string  | ISO 8601 datetime                                            |

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

| Method | Path                           | Auth | Throttle         | Description                                |
| ------ | ------------------------------ | ---- | ---------------- | ------------------------------------------ |
| POST   | `/api/auth/register/phone/`    | No   | 3/hour per phone | Request OTP                                |
| POST   | `/api/auth/verify-otp/`        | No   | 10/min per IP    | Verify OTP, get registration token         |
| POST   | `/api/auth/register/complete/` | No   | —                | Complete registration (password + profile) |
| POST   | `/api/auth/register/email/`    | No   | —                | Register with email + password             |
| POST   | `/api/auth/login/`             | No   | 5/min per IP     | Login (email or phone + password)          |
| POST   | `/api/auth/token/refresh/`     | No   | —                | Get new access + refresh                   |
| POST   | `/api/auth/logout/`            | Yes  | —                | Logout (blacklist tokens)                  |
| POST   | `/api/auth/password-reset/`    | No   | —                | Request password reset email               |
| GET    | `/api/auth/me/`                | Yes  | —                | Current user profile                       |

---

## 3. Endpoint details

### 3.1 POST `/api/auth/register/phone/`

Request OTP for the given phone. OTP is stored in cache and sent via Celery (SMS in production).

**Auth:** None  
**Throttle:** 3 requests per hour per phone (and per-IP).

**Request body:**

```json
{
  "phone": "01712345678"
}
```

| Field   | Type   | Required | Validation                                              |
| ------- | ------ | -------- | ------------------------------------------------------- |
| `phone` | string | Yes      | Min 10 digits after normalization (BD format supported) |

**Success (200):**

```json
{
  "message": "OTP sent successfully.",
  "detail": "Check your phone for the code."
}
```

**Errors:**

| Status | Code             | Condition                                                   |
| ------ | ---------------- | ----------------------------------------------------------- |
| 400    | —                | Invalid phone (e.g. `{"phone": ["Invalid phone number."]}`) |
| 429    | `otp_rate_limit` | More than 3 OTP requests per hour for this phone            |

**Rules:** OTP is 6 digits, expires in 5 minutes. Max 3 resend per hour per phone.

---

### 3.2 POST `/api/auth/verify-otp/`

Verify OTP. Does **not** create a user. Returns a short-lived `registration_token` for the completion step.

**Auth:** None  
**Throttle:** 10 requests per minute per IP.

**Request body:**

```json
{
  "phone": "01712345678",
  "otp": "123456"
}
```

| Field   | Type   | Required | Validation                    |
| ------- | ------ | -------- | ----------------------------- |
| `phone` | string | Yes      | Same format as register/phone |
| `otp`   | string | Yes      | 6 digits                      |

**Success (200):**

```json
{
  "message": "OTP verified. Complete your registration.",
  "registration_token": "550e8400-e29b-41d4-a716-446655440000",
  "phone": "01712345678",
  "expires_in": 600
}
```

| Field                | Description                                                              |
| -------------------- | ------------------------------------------------------------------------ |
| `registration_token` | Use in `POST /api/auth/register/complete/` (valid 10 minutes by default) |
| `phone`              | Verified phone (for display/prefill)                                     |
| `expires_in`         | Token validity in seconds                                                |

**Errors:**

| Status | Code          | Condition                |
| ------ | ------------- | ------------------------ |
| 400    | `invalid_otp` | Wrong or expired OTP     |
| 429    | —             | Too many verify attempts |

---

### 3.3 POST `/api/auth/register/complete/`

Complete registration after OTP: create user with password and optional profile. Returns tokens and user.

**Auth:** None  
**Throttle:** None.

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

| Field                | Type   | Required | Validation                                      |
| -------------------- | ------ | -------- | ----------------------------------------------- |
| `registration_token` | string | Yes      | From verify-otp response                        |
| `password`           | string | Yes      | Min 8 chars; upper, lower, number, special char |
| `email`              | string | No       | Valid email; must be unique if provided         |
| `first_name`         | string | No       | Max 150 chars                                   |
| `last_name`          | string | No       | Max 150 chars                                   |

**Success (200):** Token response (access, refresh, user).

**Errors:**

| Status | Code                         | Condition                                                                                          |
| ------ | ---------------------------- | -------------------------------------------------------------------------------------------------- |
| 400    | `invalid_registration_token` | Token invalid or expired                                                                           |
| 400    | —                            | Validation (e.g. `{"password": ["..."]}`, `{"email": ["A user with this email already exists."]}`) |

---

### 3.4 POST `/api/auth/register/email/`

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

### 3.5 POST `/api/auth/login/`

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

### 3.6 POST `/api/auth/token/refresh/`

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

### 3.7 POST `/api/auth/logout/`

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

### 3.8 POST `/api/auth/password-reset/`

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

### 3.9 GET `/api/auth/me/`

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
