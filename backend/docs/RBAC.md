# My Pharma – User Hierarchy & Role-Based Access Control (RBAC)

This document describes the **user hierarchy**, **role permissions matrix**, and how they apply to the **admin panel** and **API**.

---

## 1. User Role Hierarchy

```
SUPER ADMIN
Full System Access
    ▼
PHARMACY ADMIN                    DOCTOR
Inventory & Orders                Consultations
    ▼                                 ▼
REGISTERED USER                   GUEST USER
Full Purchase Access              Browse Only
```

| Role                | Description                     |
| ------------------- | ------------------------------- |
| **SUPER_ADMIN**     | Full system access              |
| **PHARMACY_ADMIN**  | Inventory & orders              |
| **DOCTOR**          | Consultations                   |
| **REGISTERED_USER** | Full purchase access (customer) |
| **GUEST_USER**      | Browse only (no DB record)      |

---

## 2. Role Permissions Matrix

| Permission           | Super Admin | Pharmacy Admin | Doctor | Registered User |
| -------------------- | :---------: | :------------: | :----: | :-------------: |
| Manage All Users     |      ✓      |       ✗        |   ✗    |        ✗        |
| Manage Products      |      ✓      |       ✓        |   ✗    |        ✗        |
| Verify Prescriptions |      ✓      |       ✓        |   ✗    |        ✗        |
| Manage Inventory     |      ✓      |       ✓        |   ✗    |        ✗        |
| View/Manage Orders   |      ✓      |       ✓        |   ✗    |       Own       |
| Doctor Consultations |      ✓      |       ✗        |   ✓    |     Request     |
| CMS Management       |      ✓      |    Limited     |   ✗    |        ✗        |
| Purchase Products    |      ✗      |       ✗        |   ✗    |        ✓        |
| Upload Prescriptions |      ✗      |       ✗        |   ✗    |        ✓        |

---

## 3. Admin Panel Access

- **Django Admin** (`/admin/`): Only **SUPER_ADMIN** can access:

  - **Users** – list, add, change, delete (Manage All Users).
  - **Audit Logs** – view, delete (Full System Access). Audit log entries are created by the system only and cannot be added or edited via admin.

- **Pharmacy Admin** and **Doctor** do **not** see the User or Audit Log admin. Future admin modules (e.g. Products, Inventory, Orders, Prescriptions, CMS) will be restricted per matrix:
  - Products, Prescriptions (verify), Inventory, Orders: **SUPER_ADMIN** and **PHARMACY_ADMIN**.
  - Doctor Consultations (manage): **SUPER_ADMIN** and **DOCTOR**.
  - CMS (limited): **PHARMACY_ADMIN**; full CMS: **SUPER_ADMIN**.

---

## 4. API Permission Classes

Used on API views to enforce the matrix:

| Permission class         | Roles allowed                       | Use for                                                                                          |
| ------------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------ |
| `IsSuperAdmin`           | SUPER_ADMIN only                    | Manage All Users, full CMS                                                                       |
| `IsPharmacyAdminOrSuper` | SUPER_ADMIN, PHARMACY_ADMIN         | Manage Products, Verify Prescriptions, Manage Inventory, View/Manage Orders (all), CMS (limited) |
| `IsDoctorOrSuper`        | SUPER_ADMIN, DOCTOR only            | Doctor Consultations (manage)                                                                    |
| `IsDoctorOrAbove`        | SUPER_ADMIN, PHARMACY_ADMIN, DOCTOR | General “elevated” access                                                                        |
| `IsRegisteredUser`       | Any authenticated (non-guest)       | Request consultations, browse, general auth                                                      |
| `IsRegisteredUserOnly`   | REGISTERED_USER only                | Purchase Products, Upload Prescriptions                                                          |
| `IsOwnerOrReadOnly`      | Object-level                        | View/Manage Orders (own only)                                                                    |
| `AllowAnyIncludingGuest` | Anyone                              | Public + guest endpoints                                                                         |

---

## 5. How to Assign Roles

- **Super Admin:** `python manage.py createsuperuser` or `User.objects.create_superuser(...)`.
- **Pharmacy Admin / Doctor / Registered User:** A **Super Admin** sets the user’s **Role** in Django Admin (Authentication → Users → edit user → Role & Status).

Public registration (request-otp → verify-otp → register/complete, or register/email) always creates **REGISTERED_USER**; there is no public API to self-assign Pharmacy Admin or Doctor.

---

## 6. References

- Permission classes: `authentication/permissions.py`
- Admin restrictions: `authentication/admin.py`
- Role constants: `authentication/constants.py` (`UserRole`)
- API reference: [API_REFERENCE.md](API_REFERENCE.md)
- Security checklist: [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md)
