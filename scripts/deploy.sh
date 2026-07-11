#!/usr/bin/env bash
# Deployment script for My Pharma via Dokploy
set -euo pipefail

# Load environment variables if available
if [ -f .env ]; then
    # Load DOKPLOY_WEBHOOK_URL if defined
    export $(grep -v '^#' .env | xargs) 2>/dev/null || true
fi

# Configuration
DOKPLOY_WEBHOOK_URL="${DOKPLOY_WEBHOOK_URL:-}"

echo "=========================================="
# Clickable links for file paths
echo " Starting Dokploy Deployment for My Pharma"
echo "=========================================="

# 1. Verify Git status
CURRENT_BRANCH=$(git symbolic-ref --short HEAD)
if [ "$CURRENT_BRANCH" != "prod-dock" ]; then
    echo "❌ Error: You are on branch '$CURRENT_BRANCH'. Deployment must run on 'prod-dock'."
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️ Warning: You have uncommitted changes. Please commit or stash them first."
    exit 1
fi

echo "➡️ Pushing local commits to GitHub (prod-dock)..."
git push origin prod-dock

echo "✅ Code pushed to GitHub successfully."

# 2. Trigger Dokploy deployment
if [ -n "${DOKPLOY_WEBHOOK_URL}" ]; then
    echo "➡️ Triggering Dokploy deployment via webhook..."
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${DOKPLOY_WEBHOOK_URL}")
    if [ "$RESPONSE" -eq 200 ] || [ "$RESPONSE" -eq 204 ]; then
        echo "🎉 Dokploy deployment triggered successfully! (HTTP $RESPONSE)"
    else
        echo "⚠️ Webhook sent, but server returned HTTP status $RESPONSE. Please check your Dokploy dashboard."
    fi
else
    echo "ℹ️ Note: No DOKPLOY_WEBHOOK_URL found in .env."
    echo "   If your Dokploy service has 'Trigger Type: On Push' enabled, the deployment is already running!"
    echo "   Otherwise, please go to your Dokploy panel at http://a1.mypharma.com.bd and click Deploy."
fi

# 3. Reload/Restart Nginx gateway via SSH
SERVER_SSH_HOST="${SERVER_SSH_HOST:-}"
if [ -n "${SERVER_SSH_HOST}" ]; then
    SSH_USER="${SERVER_SSH_USER:-root}"
    echo "➡️ Reloading Nginx gateway configuration on the server via SSH..."
    if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no "${SSH_USER}@${SERVER_SSH_HOST}" "docker exec mypharma-gateway nginx -s reload 2>/dev/null || docker restart mypharma-gateway" 2>/dev/null; then
        echo "✅ Nginx gateway reloaded/restarted successfully."
    else
        echo "⚠️ Failed to reload Nginx gateway via SSH. Please make sure the container 'mypharma-gateway' is running on the server."
    fi
fi

echo "=========================================="
echo " Done! You can monitor the progress on:"
echo " 🌐 http://a1.mypharma.com.bd/dashboard"
echo "=========================================="
