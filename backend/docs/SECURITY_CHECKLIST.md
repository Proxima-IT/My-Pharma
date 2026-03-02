# My Pharma – Security Best Practices Checklist

Use this checklist for deployment and audits (including Bangladesh digital health data norms).

---

## Authentication & Tokens

- [ ] **JWT:** Access token 24h, refresh token 7 days; rotation and blacklisting enabled.
- [ ] **Logout:** Refresh token and current access token jti blacklisted (Redis + SimpleJWT).
- [ ] **HTTPS:** All API traffic over TLS in production.
- [ ] **Secrets:** `DJANGO_SECRET_KEY` and DB/Redis credentials from environment, never in code.
- [ ] **Password hashing:** Django default (PBKDF2); no plain-text or weak hashing.

---

## Passwords & OTP

- [ ] **Password rules:** Min 8 chars; uppercase, lowercase, number, special character; enforced in serializers.
- [ ] **OTP:** 6-digit numeric; 5-minute expiry; stored in Redis only; max 3 resend per hour per phone.
- [ ] **OTP transport:** SMS/email sent asynchronously via Celery; implement trusted gateway in production.

---

## Rate Limiting & Lockout

- [ ] **Login:** 5 attempts per minute per IP (configurable); account lock after 5 failed logins for 30 minutes.
- [ ] **OTP send:** 3 per hour per phone (and per-IP throttle).
- [ ] **OTP verify:** 10 per minute per IP.
- [ ] **Lockout state:** Stored in DB (`locked_until`, `failed_login_count`) and Redis for consistency.

---

## API & CORS

- [ ] **API-only:** No session-based auth for API; CSRF disabled for API (stateless JWT).
- [ ] **CORS:** Explicit `CORS_ALLOWED_ORIGINS` in production; avoid `CORS_ALLOW_ALL` in prod.
- [ ] **Credentials:** `CORS_ALLOW_CREDENTIALS = True` only if frontend sends cookies; for Bearer-only, can be False.

---

## Data & DB

- [ ] **User model:** Email/phone indexed; soft delete (`deleted_at`); status and verified flags.
- [ ] **MySQL:** Strict mode; parameterized queries (ORM); no raw SQL with user input.
- [ ] **Sensitive data:** No passwords or OTPs in logs; mask phone/email in audit metadata.

---

## Audit & Logging

- [ ] **Audit events:** Login, logout, OTP sent/verified, password reset request, registration (phone/email), account locked.
- [ ] **Audit fields:** User (optional), action, IP, user-agent, metadata, timestamp.
- [ ] **Logging:** Auth-related logs to dedicated file/backend; level INFO; avoid logging tokens or OTPs.

---

## Bangladesh Digital Health / Compliance (Basic)

- [ ] **Data locality:** Prefer storing health-related and PII within jurisdiction where required.
- [ ] **Consent & purpose:** Collect only what’s needed; document purpose and consent for health data.
- [ ] **Access control:** RBAC per [RBAC.md](RBAC.md): SUPER_ADMIN (full), PHARMACY_ADMIN (inventory/orders/products/prescriptions), DOCTOR (consultations), REGISTERED_USER (purchase/prescriptions), GUEST (browse). Admin panel restricted to SUPER_ADMIN for Users and Audit Logs.
- [ ] **Retention:** Define and enforce retention for audit logs and inactive accounts; soft delete supports recovery and audit.
- [ ] **Incident response:** Process for lockout, breach, and revocation (blacklist + short-lived tokens).

---

## Infrastructure

- [ ] **Redis:** Auth data (OTP, lockout, blacklist) in Redis; secure and restrict access; use password if required.
- [ ] **Celery:** Broker (Redis) and workers not exposed to internet; use same security as app server.
- [ ] **Environment:** `.env` not committed; use `.env.example` as template; production secrets in vault or env only.

---

## Checklist Summary

| Area            | Status |
| --------------- | ------ |
| JWT & blacklist | ✅     |
| Password rules  | ✅     |
| OTP & Redis     | ✅     |
| Rate limit      | ✅     |
| Account lockout | ✅     |
| CORS / CSRF     | ✅     |
| Audit logs      | ✅     |
| RBAC            | ✅     |

Adjust and tick items as you harden for production and compliance.
