# My Pharma – Backend (MVP)

Production-oriented Django 4+ API for the My Pharma online pharmacy platform. Authentication is API-only (REST) with JWT, Redis, and Celery.

## Stack

- **Django 4+** – Web framework
- **Django REST Framework** – REST API
- **MySQL** – Primary database
- **Redis** – OTP storage, rate-limit, cache, Celery broker
- **Celery** – Async tasks (OTP SMS, password reset email)
- **JWT** – Access + refresh tokens (SimpleJWT, blacklist)

## Setup

1. **Environment**

   ```bash
   cp .env.example .env
   # Edit .env: DJANGO_SECRET_KEY, MYSQL_*, REDIS_URL, CORS, etc.
   ```

2. **Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Database**

   Create MySQL database, then:

   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

4. **Redis**

   Ensure Redis is running (OTP, cache, Celery).

5. **Celery** (optional for local)

   ```bash
   celery -A my_pharma worker -l info
   celery -A my_pharma beat -l info   # if using periodic tasks
   ```

## Run

```bash
python manage.py runserver
```

- API base: `http://localhost:8000/api/auth/`
- OpenAPI schema: `http://localhost:8000/api/schema/`
- Swagger UI: `http://localhost:8000/api/schema/swagger/`

## Auth API

- **[docs/API_REFERENCE.md](docs/API_REFERENCE.md)** – **Single reference for all current API endpoints:** request/response schemas, validation, errors, rate limits, status codes (for app and web).
- **Phone registration (3 steps):** `register/phone` → `verify-otp` → `register/complete`. See **[docs/REGISTRATION_AND_SYSTEM.md](docs/REGISTRATION_AND_SYSTEM.md)** for flow.
- **[docs/API_AUTH.md](docs/API_AUTH.md)** – Detailed auth API docs.
- **[docs/FRONTEND_INTEGRATION.md](docs/FRONTEND_INTEGRATION.md)** – Frontend code examples (fetch, axios, cURL).

## Security & RBAC

- **[docs/SECURITY_CHECKLIST.md](docs/SECURITY_CHECKLIST.md)** – Deployment and compliance (including Bangladesh digital health norms).
- **[docs/RBAC.md](docs/RBAC.md)** – **User hierarchy & role permissions matrix:** Super Admin, Pharmacy Admin, Doctor, Registered User, Guest; which roles can manage users, products, prescriptions, inventory, orders, consultations, CMS, and purchase/upload prescriptions; admin panel access (SUPER_ADMIN only for Users and Audit Logs).

## Project layout

```
backend/
├── authentication/       # Auth app: models, serializers, views, permissions, tasks
├── my_pharma/           # Project: settings, urls, celery
├── docs/                # API_REFERENCE.md, RBAC.md, API_AUTH.md, FRONTEND_INTEGRATION.md, REGISTRATION_AND_SYSTEM.md, SECURITY_CHECKLIST.md
├── .env.example
├── requirements.txt
└── README.md
```
