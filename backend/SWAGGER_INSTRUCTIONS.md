# Swagger / API docs – How to view and use

The My Pharma API is documented with **OpenAPI 3** (drf-spectacular). You can view it via **Swagger UI** or **ReDoc**.

---

## 1. Run the backend

From the project root (or `backend` folder):

```bash
cd backend
python manage.py runserver
```

The API will be at **http://127.0.0.1:8000/** (or the host/port you use).

---

## 2. Open the docs in the browser

| What | URL |
|------|-----|
| **Schema root** (redirects to Swagger UI) | **http://127.0.0.1:8000/api/schema/** |
| **Swagger UI** (interactive, try requests) | **http://127.0.0.1:8000/api/schema/swagger/** |
| **ReDoc** (read-only, nice layout) | **http://127.0.0.1:8000/api/schema/redoc/** |
| **OpenAPI schema (raw YAML/JSON, for download)** | **http://127.0.0.1:8000/api/schema/openapi/** |

Visiting **http://127.0.0.1:8000/api/schema/** redirects to Swagger UI so you see the interactive API docs (no YAML download). Use **ReDoc** for a read-only reference. Use **openapi/** when you need the raw schema file.

---

## 3. Using Swagger UI with JWT (protected endpoints)

Many endpoints require a JWT access token.

1. Open **http://127.0.0.1:8000/api/schema/swagger/**.
2. Call **POST /api/auth/login/** (or another auth endpoint) to get `access` and `refresh` tokens.
3. Click **“Authorize”** (top right).
4. In **BearerAuth**, paste only the **access token** (no `Bearer ` prefix).
5. Click **Authorize**, then **Close**.
6. All subsequent requests in Swagger UI will send the token in the `Authorization` header.

To refresh the token when it expires, use **POST /api/auth/token/refresh/** with the `refresh` token in the body, then update the value in Authorize.

---

## 4. Endpoints included in the docs

- **Auth** (`/api/auth/`): login, register, OTP, token refresh, logout, password reset, me, change email/phone, admin users.
- **Core** (`/api/`): categories, brands, ingredients, products, orders, prescriptions, consultations, pages.

All of these are generated from your Django REST views and serializers; no extra manual listing is required.

---

## 5. Generate schema file (optional)

To export the OpenAPI schema to a file (e.g. for CI or external tools):

```bash
cd backend
python manage.py spectacular --color --file schema.yml
# or JSON:
python manage.py spectacular --color --file schema.json
```

You can then load `schema.yml` / `schema.json` into other tools (Postman, code generators, etc.).
