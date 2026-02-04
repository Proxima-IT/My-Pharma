# My Pharma Auth – Frontend Integration Guide

How to **register accounts** and **integrate** the auth API from web and mobile frontends.

**→ For all current endpoints, request/response schemas, and error codes:** [API_REFERENCE.md](API_REFERENCE.md).

---

## 1. Required: Send JSON with correct headers

All auth endpoints expect **JSON** and return **JSON**.

| Header         | Value                                         |
| -------------- | --------------------------------------------- |
| `Content-Type` | `application/json`                            |
| `Accept`       | `application/json` (optional but recommended) |

**Why you see 415:** If you send form data or omit `Content-Type: application/json`, the API returns **415 Unsupported Media Type**. Always send a JSON body and set the header above.

---

## 2. How to register an account

You have two flows: **phone (OTP)** and **email + password**.

### Option A: Register with phone (OTP) – 3 steps

**Step 1 – Request OTP**

```http
POST /api/auth/register/phone/
Content-Type: application/json

{"phone": "01712345678"}
```

**Success (200):**

```json
{
  "message": "OTP sent successfully.",
  "detail": "Check your phone for the code."
}
```

**Step 2 – Verify OTP (no account created yet)**

User enters the 6-digit OTP (from SMS or, in dev, from server log `logs/my_pharma.log`):

```http
POST /api/auth/verify-otp/
Content-Type: application/json

{"phone": "01712345678", "otp": "123456"}
```

**Success (200):** You get a **registration_token** and **phone**. Show the **user completion form** (password, name, email, etc.).

```json
{
  "message": "OTP verified. Complete your registration.",
  "registration_token": "550e8400-e29b-41d4-a716-446655440000",
  "phone": "01712345678",
  "expires_in": 600
}
```

**Step 3 – Complete registration (user creation form)**

User fills password and optional fields (email, first_name, last_name). Send the **registration_token** from step 2:

```http
POST /api/auth/register/complete/
Content-Type: application/json

{
  "registration_token": "550e8400-e29b-41d4-a716-446655440000",
  "password": "SecurePass1!",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Success (200):** You get access + refresh tokens and user profile. Store tokens and treat user as logged in.

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
    "status": "ACTIVE",
    "email_verified": false,
    "phone_verified": true,
    "created_at": "2025-02-02T10:00:00Z"
  }
}
```

- **registration_token** is valid for 10 minutes (configurable). If it expires, the user must repeat steps 1 and 2.
- **password** is required; **email**, **first_name**, **last_name** are optional.

### Option B: Register with email + password

One request; no OTP.

```http
POST /api/auth/register/email/
Content-Type: application/json

{"email": "user@example.com", "password": "SecurePass1!"}
```

**Password rules:** Min 8 characters, at least one uppercase, one lowercase, one number, one special character (`@$!%*?&#`).

**Success (200):** Same shape as verify-otp: `access`, `refresh`, `user`.

---

## 3. JavaScript/TypeScript examples

**Base URL:** Set this to your API host (e.g. `http://localhost:8000` for local dev).

```javascript
const API_BASE = "http://localhost:8000";

const api = (path, options = {}) =>
  fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : options.body,
  });
```

### Register with phone (3 steps)

```javascript
// 1) Request OTP
const res1 = await api("/api/auth/register/phone/", {
  method: "POST",
  body: { phone: "01712345678" },
});
if (!res1.ok) {
  const err = await res1.json();
  throw new Error(err.detail || err.phone?.[0] || "Failed to send OTP");
}
// Show "OTP sent" and an input for the code

// 2) Verify OTP → get registration_token (no user yet)
const res2 = await api("/api/auth/verify-otp/", {
  method: "POST",
  body: { phone: "01712345678", otp: "123456" },
});
if (!res2.ok) {
  const err = await res2.json();
  throw new Error(err.detail || "Invalid or expired OTP");
}
const { registration_token, phone } = await res2.json();
// Show the completion form: password, email, first_name, last_name

// 3) Complete registration with password and optional profile
const res3 = await api("/api/auth/register/complete/", {
  method: "POST",
  body: {
    registration_token,
    password: "SecurePass1!",
    email: "user@example.com",
    first_name: "John",
    last_name: "Doe",
  },
});
if (!res3.ok) {
  const err = await res3.json();
  throw new Error(err.detail || err.password?.[0] || "Registration failed");
}
const { access, refresh, user } = await res3.json();
// Store access + refresh and set user in app state
```

### Register with email

```javascript
const res = await api("/api/auth/register/email/", {
  method: "POST",
  body: { email: "user@example.com", password: "SecurePass1!" },
});
if (!res.ok) {
  const err = await res.json();
  throw new Error(
    err.email?.[0] || err.password?.[0] || err.detail || "Registration failed"
  );
}
const { access, refresh, user } = await res.json();
// Store tokens and user
```

### Login (email or phone + password)

```javascript
// Email login
const res = await api("/api/auth/login/", {
  method: "POST",
  body: { email: "user@example.com", password: "SecurePass1!" },
});

// Or phone login (same phone used at registration)
// const res = await api("/api/auth/login/", {
//   method: "POST",
//   body: { phone: "01712345678", password: "SecurePass1!" },
// });

if (!res.ok) {
  const err = await res.json();
  if (res.status === 423) throw new Error("Account locked. Try again later.");
  throw new Error(err.detail || "Invalid email or password");
}
const { access, refresh, user } = await res.json();
// Store tokens and user
```

### Calling protected endpoints (e.g. GET /api/auth/me/)

Send the access token in the `Authorization` header:

```javascript
const res = await api("/api/auth/me/", {
  headers: { Authorization: `Bearer ${accessToken}` },
});
if (res.status === 401) {
  // Token expired or invalid → use refresh token or redirect to login
  return;
}
const user = await res.json();
```

### Refresh token (get new access + refresh)

```javascript
const res = await api("/api/auth/token/refresh/", {
  method: "POST",
  body: { refresh: refreshToken },
});
if (!res.ok) {
  // Refresh invalid or blacklisted → logout and redirect to login
  return;
}
const { access, refresh } = await res.json();
// Replace stored access and refresh
```

### Logout

```javascript
await api("/api/auth/logout/", {
  method: "POST",
  headers: { Authorization: `Bearer ${accessToken}` },
  body: { refresh: refreshToken },
});
// Clear stored tokens and user
```

---

## 4. Axios example

```javascript
import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8000",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

// Register phone – step 1: request OTP
await client.post("/api/auth/register/phone/", { phone: "01712345678" });

// Register phone – step 2: verify OTP → get registration_token
const { data: verifyData } = await client.post("/api/auth/verify-otp/", {
  phone: "01712345678",
  otp: "123456",
});
const { registration_token } = verifyData;

// Register phone – step 3: complete with password and optional profile
const { data } = await client.post("/api/auth/register/complete/", {
  registration_token,
  password: "SecurePass1!",
  email: "user@example.com",
  first_name: "John",
  last_name: "Doe",
});
const { access, refresh, user } = data;

// Attach token for protected requests
client.defaults.headers.common["Authorization"] = `Bearer ${access}`;
const me = await client.get("/api/auth/me/");
```

---

## 5. cURL (testing from terminal)

```bash
# Register phone – step 1: request OTP
curl -X POST http://localhost:8000/api/auth/register/phone/ \
  -H "Content-Type: application/json" \
  -d '{"phone":"01712345678"}'

# Register phone – step 2: verify OTP (use code from SMS or logs/my_pharma.log)
curl -X POST http://localhost:8000/api/auth/verify-otp/ \
  -H "Content-Type: application/json" \
  -d '{"phone":"01712345678","otp":"123456"}'
# Response includes registration_token – use it in step 3

# Register phone – step 3: complete with password and optional fields (paste registration_token from step 2)
curl -X POST http://localhost:8000/api/auth/register/complete/ \
  -H "Content-Type: application/json" \
  -d '{"registration_token":"PASTE_TOKEN_HERE","password":"SecurePass1!","email":"user@example.com","first_name":"John","last_name":"Doe"}'

# Register email
curl -X POST http://localhost:8000/api/auth/register/email/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass1!"}'

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass1!"}'

# Me (replace TOKEN with access token from login/register)
curl -X GET http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer TOKEN"
```

---

## 6. Token storage (web vs mobile)

| Platform   | Recommendation                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Web**    | `access` in memory or short-lived storage; `refresh` in `httpOnly` cookie (if backend supports) or secure storage. Avoid long-lived tokens in `localStorage` on shared devices. |
| **Mobile** | Use secure storage (e.g. Keychain / Keystore) for both access and refresh.                                                                                                      |

Use the **access token** in `Authorization: Bearer <access>`. When the API returns **401**, call **POST /api/auth/token/refresh/** with the **refresh** token; if that fails, redirect to login.

---

## 7. Local development without Redis

If you see **500** on `/api/auth/register/phone/` or `/api/schema/swagger/` and the server log shows **Redis connection refused**:

- Either **start Redis** (e.g. `redis-server`), or
- In backend `.env` set **`USE_REDIS=false`** and restart the Django server. The app will use an in-memory cache so OTP and Swagger work without Redis (dev only).
- If you use Celery, set **`CELERY_TASK_ALWAYS_EAGER=true`** so OTP emails run in-process and no Redis broker is needed.

---

## 8. CORS

For a web app on another origin (e.g. `http://localhost:3000`), set in backend `.env`:

```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-app.com
```

Then the browser will allow your frontend to call the API.

---

## 9. Summary

| Goal                    | What to do                                                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Register (phone)**    | 1) POST `/api/auth/register/phone/` → 2) POST `/api/auth/verify-otp/` → 3) POST `/api/auth/register/complete/` with `registration_token`, `password`, and optional `email`, `first_name`, `last_name`. |
| **Register (email)**    | POST `/api/auth/register/email/` with `{"email":"...","password":"..."}`.                                                                                                                              |
| **Avoid 415**           | Always send `Content-Type: application/json` and a JSON body.                                                                                                                                          |
| **Avoid 500 (Redis)**   | Run Redis or set `USE_REDIS=false` for local dev.                                                                                                                                                      |
| **Use API after login** | Send `Authorization: Bearer <access_token>` on every protected request.                                                                                                                                |
| **When token expires**  | POST `/api/auth/token/refresh/` with `{"refresh":"..."}` and replace stored tokens.                                                                                                                    |

For full request/response schemas and error codes, see **[API_AUTH.md](API_AUTH.md)**. For end-to-end flow and system overview, see **[REGISTRATION_AND_SYSTEM.md](REGISTRATION_AND_SYSTEM.md)**.
