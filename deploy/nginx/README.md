# Nginx Production Routing

This folder contains production reverse-proxy configs to avoid common `502 Bad Gateway` issues.

## Which config to use

- `mypharma.host-nginx.conf`
- Use this when Nginx is installed on the host OS (outside Docker).
- Upstreams use host-published ports: `127.0.0.1:3000` and `127.0.0.1:8000`.

- `mypharma.docker-nginx.conf`
- Use this when Nginx runs as a Docker service on the same Docker network.
- Upstreams use Docker service names: `frontend:3000` and `backend:8000`.

## Why this matters

If host Nginx is configured with Docker-only names like `backend:8000`, Nginx cannot resolve that name and `/api/*` requests fail with `502 Bad Gateway`.

## Optional Docker gateway service

`docker-compose.yml` includes an optional `gateway` profile that runs Nginx in Docker with `mypharma.docker-nginx.conf`.

Start it with:

```bash
APP_ENV_FILE=.env docker compose --profile gateway up -d --build
```

If you already run host Nginx, do not start the `gateway` profile on the same port.
