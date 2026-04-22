#!/usr/bin/env bash
set -euo pipefail

# Quick production diagnosis for API 502 issues.
# Usage:
#   ./scripts/check-502.sh mypharma.com.bd
# Optional env overrides:
#   BACKEND_URL=http://127.0.0.1:8000/api/schema/
#   PROXY_URL=https://mypharma.com.bd/api/schema/

DOMAIN="${1:-mypharma.com.bd}"
BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:8000/api/schema/}"
PROXY_URL="${PROXY_URL:-https://${DOMAIN}/api/schema/}"

check_code() {
  local url="$1"
  local code
  code="$(curl -k -sS -o /dev/null -w "%{http_code}" "$url" || true)"
  if [[ -z "${code}" ]]; then
    code="000"
  fi
  echo "${code}"
}

echo "[check-502] Backend direct: ${BACKEND_URL}"
backend_code="$(check_code "${BACKEND_URL}")"
echo "[check-502] Backend status: ${backend_code}"

echo "[check-502] Proxy/domain: ${PROXY_URL}"
proxy_code="$(check_code "${PROXY_URL}")"
echo "[check-502] Proxy status: ${proxy_code}"

echo
if [[ "${backend_code}" =~ ^[23] ]]; then
  if [[ "${proxy_code}" == "502" ]]; then
    echo "Diagnosis: backend is reachable directly, but proxy is misrouting/upstreaming API requests."
    echo "Fix: use deploy/nginx/mypharma.host-nginx.conf if Nginx is on host."
    exit 2
  fi
fi

if [[ "${backend_code}" == "000" || "${backend_code}" == "502" || "${backend_code}" == "503" || "${backend_code}" == "504" ]]; then
  echo "Diagnosis: backend itself is not reachable on host port 8000."
  echo "Check: docker compose logs -f backend"
  exit 3
fi

echo "Diagnosis: no obvious upstream 502 mismatch detected by this quick check."
exit 0
