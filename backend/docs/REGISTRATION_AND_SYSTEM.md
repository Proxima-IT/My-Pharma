# My Pharma – Registration Flow & Total System Instructions

This document describes the **unified registration flow** (email or phone → OTP → verify → user creation form) and gives **total instructions** for integrating and running the auth system (app and web).

---

## Unified registration flow (recommended)

User submits **email or phone** → backend sends OTP to that channel (SMS for phone, email for email) → user enters OTP → backend returns **registration_token** and verified identifier → frontend shows **user creation form** (verified value **uneditable**; collect username, password, other identifier optional, profile_picture, address) → backend creates account and returns JWT + user.

| Step  | Endpoint                            | What happens                                                                                                                                                                                                                                                                    |
| ----- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | `POST /api/auth/request-otp/`       | User enters **email or phone**. Backend sends 6-digit OTP (SMS for phone, email for email).                                                                                                                                                                                     |
| **2** | `POST /api/auth/verify-otp/`        | User enters OTP. Backend verifies and returns **registration_token**, **verified_identifier_type** ("phone" or "email"), **verified_identifier_value**. No user created yet.                                                                                                    |
| **3** | `POST /api/auth/register/complete/` | Form: **username**, **password** (required); verified value shown **uneditable**; optionally the **other** identifier (email if verified phone, phone if verified email), **profile_picture**, **address**, first_name, last_name. Backend creates user and returns JWT + user. |

### Request/response summary (unified)

**Step 1 – Request OTP**

- **Request:** `POST /api/auth/request-otp/`  
  Body: `{"phone": "01712345678"}` or `{"email": "user@example.com"}`
- **Response (200):** `{"message": "OTP sent successfully.", "detail": "Check your phone/email for the code."}`

**Step 2 – Verify OTP**

- **Request:** `POST /api/auth/verify-otp/`  
  Body: `{"phone": "01712345678", "otp": "123456"}` or `{"email": "user@example.com", "otp": "123456"}`
- **Response (200):**  
  `{"message": "OTP verified. Complete your registration.", "registration_token": "<uuid>", "verified_identifier_type": "phone", "verified_identifier_value": "01712345678", "phone": "01712345678", "expires_in": 600}`  
  → Store **registration_token**; show completion form with verified value **uneditable**.

**Step 3 – Complete registration**

- **Request:** `POST /api/auth/register/complete/` (JSON or multipart/form-data for profile_picture)  
  Body: `{"registration_token": "<from step 2>", "password": "SecurePass1!", "username": "johndoe", "email": "user@example.com", "address": "123 Main St", "first_name": "John", "last_name": "Doe"}`
- **Response (200):**  
  `{"access": "<jwt>", "refresh": "<jwt>", "user": { ... }}`  
  → Store tokens and user; user is logged in.

If **registration_token** is expired or invalid, response is **400** with `code: "invalid_registration_token"`. User must repeat steps 1 and 2.

---

## Auth API endpoints (overview)

| Method | Endpoint                       | Description                                                                   |
| ------ | ------------------------------ | ----------------------------------------------------------------------------- |
| POST   | `/api/auth/request-otp/`       | Request OTP by **email or phone** (unified)                                   |
| POST   | `/api/auth/verify-otp/`        | Verify OTP (email or phone), get registration_token                           |
| POST   | `/api/auth/register/complete/` | Complete registration: username, password, other id, profile_picture, address |
| POST   | `/api/auth/register/phone/`    | Request OTP for phone only (legacy)                                           |
| POST   | `/api/auth/register/email/`    | Register with email + password (one step)                                     |
| POST   | `/api/auth/login/`             | Login with email or phone + password                                          |
| POST   | `/api/auth/token/refresh/`     | Rotate refresh token                                                          |
| POST   | `/api/auth/logout/`            | Logout (blacklist tokens)                                                     |
| POST   | `/api/auth/password-reset/`    | Request password reset email                                                  |
| GET    | `/api/auth/me/`                | Current user (requires auth)                                                  |

POST bodies: **JSON** (`Content-Type: application/json`). For **profile_picture** upload use **multipart/form-data**.

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
