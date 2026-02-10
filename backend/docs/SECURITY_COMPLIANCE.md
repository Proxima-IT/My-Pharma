# 11. Security & Compliance

Security architecture layers and compliance notes for My Pharma (Bangladesh). Aligned with production deployment and [ADMIN_API.md](ADMIN_API.md).

---

## Security Architecture Layers

| Layer | Measures |
|-------|----------|
| **Network security** | HTTPS/TLS 1.3, WAF, DDoS protection, rate limiting (auth throttling in place) |
| **Application security** | JWT auth, RBAC, input validation (DRF + validators), CORS, XSS/CSRF protection (Django middleware) |
| **Data security** | Password hashing (Django default PBKDF2), secure file storage (MEDIA), sensitive env in env vars |
| **Compliance** | Bangladesh digital health data norms, audit logging (auth audit log), data retention (policy-driven) |

---

## Backend Implementation Notes

- **Auth:** JWT (access/refresh) with blacklist; role-based permissions (`IsSuperAdmin`, `IsPharmacyAdminOrSuper`, `IsDoctorOrSuper`, `IsRegisteredUserOnly`, etc.).
- **Rate limiting:** Configured in DRF throttling (auth, OTP, login).
- **CORS:** Configured via `django-cors-headers` (origins from env).
- **Validation:** Prescription file (format, size), issue date, order min value, stock, prescription items.
- **Audit:** Authentication app `AuditLog` for auth events; extend for sensitive actions (e.g. prescription verify, order status) as needed.
- **File storage:** Prescriptions and consultation attachments under MEDIA with per-date paths; ensure server restricts direct access to authorised users only.

---

## References

- [ADMIN_API.md](ADMIN_API.md) – API and permissions
- [RBAC.md](RBAC.md) – Roles
- [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) – Deployment security checklist
