# My Pharma – Registration Flow & Total System Instructions

This document describes the **phone registration flow** (3 steps) and gives **total instructions** for integrating and running the auth system (app and web).

---

## Phone registration flow (3 steps)

The flow is: **Phone number → OTP send → OTP verified → User completion form (password and optional fields) → Account created.**

| Step  | Endpoint                            | What happens                                                                                                                                                                                        |
| ----- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | `POST /api/auth/register/phone/`    | User enters phone. Backend sends 6-digit OTP (SMS in prod; in dev see `logs/my_pharma.log`).                                                                                                        |
| **2** | `POST /api/auth/verify-otp/`        | User enters OTP. Backend verifies it and returns a **registration_token** (valid 10 min). **No user is created yet.**                                                                               |
| **3** | `POST /api/auth/register/complete/` | Frontend shows a form: **password** (required), **email**, **first_name**, **last_name** (optional). User submits with the **registration_token**. Backend creates the user and returns JWT + user. |

### Request/response summary

**Step 1 – Request OTP**

- **Request:** `POST /api/auth/register/phone/`  
  Body: `{"phone": "01712345678"}`
- **Response (200):** `{"message": "OTP sent successfully.", "detail": "Check your phone for the code."}`

**Step 2 – Verify OTP**

- **Request:** `POST /api/auth/verify-otp/`  
  Body: `{"phone": "01712345678", "otp": "123456"}`
- **Response (200):**  
  `{"message": "OTP verified. Complete your registration.", "registration_token": "<uuid>", "phone": "01712345678", "expires_in": 600}`  
  → Store **registration_token** and show the completion form.

**Step 3 – Complete registration**

- **Request:** `POST /api/auth/register/complete/`  
  Body: `{"registration_token": "<from step 2>", "password": "SecurePass1!", "email": "user@example.com", "first_name": "John", "last_name": "Doe"}`
- **Response (200):**  
  `{"access": "<jwt>", "refresh": "<jwt>", "user": { ... }}`  
  → Store tokens and user; user is logged in.

If **registration_token** is expired or invalid, response is **400** with `code: "invalid_registration_token"`. User must repeat steps 1 and 2.

---

## Auth API endpoints (overview)

| Method | Endpoint                       | Description                                                      |
| ------ | ------------------------------ | ---------------------------------------------------------------- |
| POST   | `/api/auth/register/phone/`    | Step 1: request OTP for phone                                    |
| POST   | `/api/auth/verify-otp/`        | Step 2: verify OTP, get registration_token                       |
| POST   | `/api/auth/register/complete/` | Step 3: complete registration with password and optional profile |
| POST   | `/api/auth/register/email/`    | Register with email + password (one step)                        |
| POST   | `/api/auth/login/`             | Login with email or phone + password                             |
| POST   | `/api/auth/token/refresh/`     | Rotate refresh token                                             |
| POST   | `/api/auth/logout/`            | Logout (blacklist tokens)                                        |
| POST   | `/api/auth/password-reset/`    | Request password reset email                                     |
| GET    | `/api/auth/me/`                | Current user (requires auth)                                     |

All POST bodies must be **JSON** with header **`Content-Type: application/json`**.

---

## Frontend integration (app and web)

1. **Base URL**  
   Use your API host (e.g. `http://localhost:8000` for local dev).

2. **Phone registration (3 steps)**

   - After step 1, show an OTP input.
   - After step 2, show the completion form (password required; email, first_name, last_name optional).
   - On step 3 success, store `access`, `refresh`, and `user`; treat user as logged in.

3. **Protected requests**  
   Send header: `Authorization: Bearer <access_token>`.

4. **Token refresh**  
   When you get **401**, call `POST /api/auth/token/refresh/` with `{"refresh": "<refresh_token>"}` and replace stored tokens.

5. **CORS**  
   In backend `.env`, set `CORS_ALLOWED_ORIGINS` to your app’s origin(s) (e.g. `http://localhost:3000`).

Detailed examples (fetch, axios, cURL): **[FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)**.  
Full API reference: **[API_AUTH.md](API_AUTH.md)**.

---

## Backend setup and run

1. **Environment**  
   Copy `.env.example` to `.env` and set at least:  
   `DJANGO_SECRET_KEY`, `MYSQL_*`, `REDIS_URL` (or `USE_REDIS=false` for local dev without Redis).

2. **Dependencies**  
   `pip install -r requirements.txt`

3. **Database**  
   Create MySQL DB, then:  
   `python manage.py migrate`  
   `python manage.py createsuperuser`

4. **Run server**  
   `python manage.py runserver`  
   API base: `http://localhost:8000/api/auth/`

5. **Optional: Redis**  
   For production, run Redis and set `USE_REDIS=true`. For local dev without Redis, set `USE_REDIS=false` (OTP and registration token use in-memory cache).

6. **Optional: Celery**  
   For sending OTP SMS and emails in production:  
   `celery -A my_pharma worker -l info`

---

## Security and compliance

- **Password:** Min 8 characters; at least one uppercase, one lowercase, one number, one special character.
- **OTP:** 6 digits, 5 min expiry, max 3 resend per hour per phone.
- **Registration token:** Valid 10 minutes after OTP verify (configurable via `AUTH_REGISTRATION_TOKEN_EXPIRY_MINUTES`).
- **Audit:** Login, logout, OTP sent/verified, registration complete, password reset are logged.
- **Rate limits:** Login and OTP endpoints are throttled; account locks after 5 failed logins (30 min).

Checklist: **[SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md)**.

---

## Summary

- **Phone registration:** 3 steps (register/phone → verify-otp → register/complete). Step 2 returns **registration_token**; step 3 creates the user with **password** and optional **email**, **first_name**, **last_name**.
- **Email registration:** Single step (`POST /api/auth/register/email/`).
- **Docs:** Use **API_AUTH.md** for schemas and errors, **FRONTEND_INTEGRATION.md** for code examples, and this file for flow and total instructions.
