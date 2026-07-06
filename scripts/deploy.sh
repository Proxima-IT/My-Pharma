#!/usr/bin/env bash
# Deployment script for My Pharma production stack
set -euo pipefail

# Configurations
DEPLOY_HOST="${DEPLOY_HOST:-46.202.194.251}"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_PASS="${DEPLOY_PASS:-@@@SA123456sa@@@}"
TARGET_DIR="${TARGET_DIR:-/root/My-Pharma}"

echo "=========================================="
echo " Starting Deployment for My Pharma"
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

echo "➡️ Connecting to production server ($DEPLOY_HOST) to pull changes..."
# Verify sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo "❌ sshpass is not installed. Please install it (e.g., brew install sshpass on macOS) or run manually."
    exit 1
fi

# Run git pull on the server
sshpass -p "$DEPLOY_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "${DEPLOY_USER}@${DEPLOY_HOST}" "cd $TARGET_DIR && git pull"

echo "➡️ Building and starting production Docker containers on the server..."
# Mark run-prod.sh as executable and run it
sshpass -p "$DEPLOY_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "${DEPLOY_USER}@${DEPLOY_HOST}" "cd $TARGET_DIR && chmod +x scripts/run-prod.sh && ./scripts/run-prod.sh"

echo "➡️ Verifying container status..."
sshpass -p "$DEPLOY_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "${DEPLOY_USER}@${DEPLOY_HOST}" "cd $TARGET_DIR && docker compose ps"

echo "=========================================="
echo " 🎉 Deployment Completed Successfully!"
echo "=========================================="
