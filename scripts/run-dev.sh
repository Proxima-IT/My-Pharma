#!/usr/bin/env bash
set -euo pipefail

# Deterministic development stack: always use .env.dev
export APP_ENV_FILE=.env.dev

echo "[mypharma] Starting development stack with APP_ENV_FILE=${APP_ENV_FILE}"
docker compose up -d --build "$@"
