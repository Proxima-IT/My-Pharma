# My Pharma – Docker setup (production-ready)

This guide explains how to run the **frontend** (Next.js) and **backend** (Django) with **MySQL** and **Redis** using Docker and Docker Compose. The same setup is suitable for production when used behind a reverse proxy (e.g. Nginx) and with proper secrets.

---

## Prerequisites

- **Docker** (20.10+)
- **Docker Compose** v2 (e.g. `docker compose` or `docker-compose`)

Check:

```bash
docker --version
docker compose version
```

---

## 1. Clone and go to project root

```bash
cd /path/to/test
# You should see: backend/, frontend/, docker-compose.yml
```

---

## 2. Create environment file

Create a `.env` file in the **project root** (same folder as `docker-compose.yml`):

```bash
cp .env.docker.example .env
```

Edit `.env` and set **at least**:

| Variable | Description | Example |
|----------|-------------|---------|
| `DJANGO_SECRET_KEY` | Long random secret for Django | 50+ character random string |
| `MYSQL_PASSWORD` | Password for DB user `MYSQL_USER` | Strong password |
| `MYSQL_ROOT_PASSWORD` | MySQL root password | Strong password |

Optional (defaults work for local Docker):

- `MYSQL_DATABASE` – default: `my_pharma`
- `MYSQL_USER` – default: `mypharma`
- `NEXT_PUBLIC_API_URL` – API URL as seen by the **browser** (default: `http://localhost:8000/api`)
- `NEXT_PUBLIC_BACKEND_URL` – Backend base URL as seen by the browser (default: `http://localhost:8000`)
- **`BACKEND_URL_INTERNAL`** – Set by `docker-compose.yml` to `http://backend:8000` so the frontend container can proxy `/media/*` (profile and product images) to the backend. Do not change unless you use a different backend service name.

---

## 3. Build and start all services

From the project root:

```bash
docker compose build
docker compose up -d
```

Or in one step:

```bash
docker compose up -d --build
```

This starts:

- **MySQL** on port `3306`
- **Redis** on port `6379`
- **Backend** (Django + Gunicorn) on port `8000`
- **Frontend** (Next.js) on port `3000`

The backend container runs `entrypoint.sh`, which:

1. Waits for MySQL to be ready  
2. Runs `python manage.py migrate`  
3. Runs `python manage.py collectstatic`  
4. Starts Gunicorn

---

## 4. Create a superuser (optional)

To access Django admin:

```bash
docker compose exec backend python manage.py createsuperuser
```

Then open: **http://localhost:8000/admin/**

---

## 5. Verify

- **Frontend:** http://localhost:3000  
- **Backend API:** http://localhost:8000/api/  
- **API schema:** http://localhost:8000/api/schema/  
- **Admin:** http://localhost:8000/admin/

---

## 6. Stop and remove

```bash
# Stop containers
docker compose down

# Stop and remove volumes (deletes DB and uploaded media)
docker compose down -v
```

---

## Production notes

### 1. Use real secrets

- Do **not** commit `.env`. Use a secrets manager or inject env in CI/CD.
- Set `DJANGO_SECRET_KEY`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD` to strong random values.

### 2. Frontend build URLs

`NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_BACKEND_URL` are baked in at **build time**. For production:

- Set them to your public API URL (e.g. `https://api.yourdomain.com` and `https://api.yourdomain.com/api`).
- Rebuild the frontend image after changing:

  ```bash
  docker compose build --no-cache frontend
  docker compose up -d frontend
  ```

### 3. Reverse proxy (Nginx / Traefik)

- Terminate HTTPS at the proxy.
- Proxy `/api` and `/media` to the backend (e.g. `http://backend:8000`).
- Proxy `/` to the frontend (e.g. `http://frontend:3000`).
- Set `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS` to your frontend/API domains.
- **Large uploads (product/prescription images):** If you get **413 Request Entity Too Large**, set a larger body size in Nginx, e.g. `client_max_body_size 20M;` in `http` or in the `location` that proxies to the API.

### 4. Media and static files

- Backend uses **volumes** for `media` and `staticfiles`. Persist these on the host or in a volume driver if you need backups.
- For high traffic, serve `/media` and `/static` from the reverse proxy or a CDN instead of Django.

### 5. Celery (optional)

The stack does not start a Celery worker by default. To run async tasks (e.g. OTP email):

- Start a worker container that runs `celery -A my_pharma worker -l info`.
- Ensure Redis is running and `CELERY_BROKER_URL` / `CELERY_RESULT_BACKEND` point to it.

### 6. Logs

- Backend logs go to stdout/stderr (Gunicorn) and to `/app/logs/my_pharma.log` (volume `backend_logs`).
- View logs: `docker compose logs -f backend` or `docker compose logs -f frontend`.

---

## Troubleshooting

| Issue | What to do |
|-------|------------|
| Backend 502 / won’t start | Check `docker compose logs backend`. Ensure MySQL is healthy and `MYSQL_PASSWORD` matches `.env`. |
| Frontend shows “Cannot connect to API” | Confirm `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_BACKEND_URL` match how the browser reaches the API (e.g. `http://localhost:8000` when testing locally). Rebuild frontend after changing. |
| Profile or product images not loading in Docker | The frontend proxies `/media/*` to the backend using `BACKEND_URL_INTERNAL` (set to `http://backend:8000` in compose). Rebuild and restart frontend: `docker compose up -d --build frontend`. |
| Migrations fail | Run manually: `docker compose exec backend python manage.py migrate`. |
| Static/admin CSS missing | Run: `docker compose exec backend python manage.py collectstatic --noinput`. |
| Port already in use | Change host ports in `docker-compose.yml` (e.g. `"3001:3000"` for frontend). |
| 413 on image upload | Django allows 20 MB. If using Nginx, add `client_max_body_size 20M;` in the block that proxies to the API. |

---

## File reference

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Defines backend, frontend, MySQL, Redis and volumes. |
| `.env.docker.example` | Template for `.env`. |
| `backend/Dockerfile` | Django app + Gunicorn, runs `entrypoint.sh` then Gunicorn. |
| `backend/entrypoint.sh` | Waits for DB, runs migrate and collectstatic. |
| `frontend/Dockerfile` | Multi-stage: build Next.js (standalone), then run `node server.js`. |
