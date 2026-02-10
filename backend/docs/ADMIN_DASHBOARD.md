# 10. Admin Dashboard Logic

Admin dashboard module structure and backend alignment. Aligned with [ADMIN_API.md](ADMIN_API.md) and [RBAC.md](RBAC.md).

---

## Admin Dashboard Module Structure

```
ADMIN DASHBOARD
▼
├── Products      – CRUD, Categories
├── Orders        – Manage, Track
├── Prescriptions – Verify, Approve
├── Users         – Manage, Roles
├── Inventory     – Stock, Alerts
├── Doctors       – Assign, Schedule
├── Analytics     – Reports, Stats
└── CMS           – Banners, Notices
```

---

## Backend API Mapping

| Module | Endpoints | Roles |
|--------|-----------|--------|
| **Products** | `/api/products/`, `/api/categories/`, `/api/brands/`, `/api/ingredients/` | Pharmacy/Super: CRUD; others: list/retrieve |
| **Orders** | `/api/orders/` – list, retrieve, PATCH status | Pharmacy/Super: all; User: own, place, cancel (before shipped) |
| **Prescriptions** | `/api/prescriptions/` – list, retrieve, verify (PATCH) | Pharmacy/Super: verify; User: upload, own list |
| **Users** | `/api/auth/admin/users/` | Super only |
| **Inventory** | `/api/products/{slug}/inventory/` – PATCH quantity_in_stock | Pharmacy/Super |
| **Doctors** | Consultations: assign doctor via PATCH `/api/consultations/{id}/` | Super/Pharmacy (assign); Doctor (respond) |
| **Analytics** | Reports/stats – extend with custom endpoints as needed | Super/Pharmacy |
| **CMS** | `/api/pages/` | Super: full CRUD; Pharmacy: update limited |

---

## References

- [ADMIN_API.md](ADMIN_API.md) – Full API reference
- [RBAC.md](RBAC.md) – User hierarchy and permissions
