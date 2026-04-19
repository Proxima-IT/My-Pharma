#!/usr/bin/env bash
set -euo pipefail

# Deterministic production stack: always use .env
export APP_ENV_FILE=.env

echo "[mypharma] Starting production stack with APP_ENV_FILE=${APP_ENV_FILE}"
docker compose up -d --build "$@"
