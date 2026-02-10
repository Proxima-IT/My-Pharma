# 9. Doctor Consultation Flow (MVP)

Lightweight text-based consultation with manual doctor assignment by admin. Aligned with [ADMIN_API.md](ADMIN_API.md).

---

## Consultation Request Flow

| Actor | Steps |
|-------|--------|
| **User** | 1. Submit request with symptoms 2. Attach relevant documents 3. Select specialty (optional) |
| **Admin** | 1. Review request 2. Assign available doctor 3. Notify both parties |
| **Doctor** | 1. Review patient info 2. Respond via text chat 3. Provide prescription (PDF) |

---

## Consultation Status Flow

```
REQUESTED → ASSIGNED → IN_PROGRESS → COMPLETED
```

| Status | Description |
|--------|-------------|
| **REQUESTED** | User submitted; awaiting assignment. |
| **ASSIGNED** | Admin assigned a doctor. |
| **IN_PROGRESS** | Doctor responding / in progress. |
| **COMPLETED** | Consultation closed. |

---

## Backend Implementation

- **Create:** POST `/api/consultations/` – Body: `subject`, `message`, optional `specialty`, `attachment`. Status set to REQUESTED.
- **List/Retrieve:** GET `/api/consultations/`, GET `/api/consultations/{id}/` – User: own; Doctor/Super: all.
- **Respond / Assign:** PATCH `/api/consultations/{id}/` – Body: `response`, `status` (ASSIGNED, IN_PROGRESS, COMPLETED), optional `doctor` (admin assign). Doctor/Super only; doctor can set self and respond.
- **Alias:** PATCH `/api/consultations/{id}/respond/` – Same as above.

---

## References

- [ADMIN_API.md](ADMIN_API.md) – Consultations endpoints
- [RBAC.md](RBAC.md) – Roles and permissions
