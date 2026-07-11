---
name: deploy-mypharma
description: Instructions and checklist for deploying the My Pharma application to Dokploy.
---

# Deploying My Pharma to Dokploy

Use these instructions whenever you are asked to deploy changes to the production server.

## Pre-deployment Checklist
1. **Branch Verification**: Ensure you are on the `prod-dock` branch:
   ```bash
   git branch --show-current
   ```
2. **Local Verification**:
   - Run python py_compile checks: `python3 -m py_compile backend/core/serializers.py`
   - Run tests: `./venv/bin/python backend/manage.py test core`
   - Run local build to verify frontend compilation: `npm run build` in `frontend` directory.

## Deployment Steps
1. **Commit Changes**: Commit all outstanding modifications to Git:
   ```bash
   git add .
   git commit -m "Your descriptive commit message"
   ```
2. **Push to GitHub**: Push the commits to the repository:
   ```bash
   git push origin prod-dock
   ```
   *Note: Pushing to `prod-dock` will trigger the automatic Dokploy build via GitHub Webhook.*

3. **Monitor Build**:
   - Open [Dokploy Dashboard](http://a1.mypharma.com.bd/dashboard)
   - Navigate to **Projects** -> **My Pharma** -> **mypharma-stack** -> **Deployments**.
   - Wait for the build process to finish (typically takes ~3 minutes).

4. **Nginx DNS Refresh (Restart Gateway)**:
   - *Important*: When the frontend container is rebuilt, its internal Docker IP address changes. Nginx caches DNS resolved IPs at startup, which will lead to a **502 Bad Gateway**.
   - In the Dokploy Dashboard, locate the **`gateway`** container under `mypharma-stack`.
   - Click **Restart** or **Redeploy** on the `gateway` container to refresh the DNS resolution.
   - Verify the site is online at [mypharma.com.bd](https://mypharma.com.bd).
