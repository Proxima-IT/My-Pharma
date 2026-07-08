# Deploying My Pharma on Dokploy

This guide outlines how to deploy the **My Pharma** project to your self-hosted **Dokploy** instance at `a1.mypharma.com.bd`. 

We have added a custom [docker-compose.dokploy.yml](file:///Users/shihab/Workspace/Web/My-Pharma/docker-compose.dokploy.yml) file to the repository which is optimized specifically for Dokploy deployment.

---

## Approach 1: Docker Compose Stack (Recommended & Easiest)

This approach deploys the entire application stack exactly as defined in [docker-compose.dokploy.yml](file:///Users/shihab/Workspace/Web/My-Pharma/docker-compose.dokploy.yml), using Nginx as the gateway routing `/` to the Next.js frontend, and `/api/` / `/media/` to the Django backend.

### Changes Included in `docker-compose.dokploy.yml`:
1. **Removed the `gateway` profile** so that Nginx starts automatically under Dokploy (by default, Dokploy runs `docker compose up -d` which skips services with custom profiles).
2. **Mapped the Nginx `gateway` to the external `dokploy-network`** network so Dokploy's Traefik reverse proxy can route your domain traffic directly into the Nginx container.
3. **Changed `env_file` references to `.env`** since Dokploy automatically writes all environment variables configured in the dashboard to a local `.env` file in the Compose project directory.

---

### Step-by-Step Deployment Instructions

#### Step 1: Create a Project in Dokploy
1. Log in to your Dokploy dashboard at `a1.mypharma.com.bd`.
2. Click **Projects** in the left sidebar.
3. Click **Create Project** (or use your existing project) and name it `My Pharma`.

#### Step 2: Add the Compose Service
1. Click into your project.
2. In the **Services** section, click **Create Service** and select **Compose**.
3. Name it `mypharma-stack`.

#### Step 3: Connect Git Repository
1. Select your Git provider (e.g. GitHub).
2. Select your repository: `Proxima-IT/My-Pharma`.
3. Set the Branch to deploy: `prod-dock`.
4. Set the **Compose Path** to: `docker-compose.dokploy.yml`.

#### Step 4: Configure Environment Variables
1. Navigate to the **Environment** tab of your Compose service in Dokploy.
2. Copy and paste your production variables. Key values to include:
   ```env
   # Django Secrets & Hosts
   DJANGO_SECRET_KEY=your-production-django-secret-key-here
   ALLOWED_HOSTS=localhost,127.0.0.1,backend,mypharma.com.bd,www.mypharma.com.bd
   CORS_ALLOWED_ORIGINS=https://mypharma.com.bd,https://www.mypharma.com.bd
   CSRF_TRUSTED_ORIGINS=https://mypharma.com.bd,https://www.mypharma.com.bd

   # Database (MySQL)
   MYSQL_DATABASE=mypharma_data_db
   MYSQL_USER=mypharma
   MYSQL_PASSWORD=your-secure-mysql-password
   MYSQL_ROOT_PASSWORD=your-secure-mysql-root-password

   # Next.js Build-Time URLs (Used when compiling the Next.js frontend)
   NEXT_PUBLIC_API_URL=https://mypharma.com.bd/api
   NEXT_PUBLIC_BACKEND_URL=https://mypharma.com.bd

   # Firebase / SMS Integrations
   NEXT_PUBLIC_FIREBASE_API_KEY=your-fcm-api-key
   ...
   ```

#### Step 5: Configure Domain Routing
1. Go to the **Domains** tab under the `mypharma-stack` Compose service in Dokploy.
2. Click **Add Domain**.
3. Enter your domain: `mypharma.com.bd` (or a subdomain like `test.mypharma.com.bd` for testing).
4. Select the target service: **`gateway`**.
5. Select the port: **`80`**.
6. Set Certificate type to **Let's Encrypt** (make sure your domain DNS points to your server's IP address beforehand).
7. Save the configuration.

#### Step 6: Deploy
1. Go to the **Deployments** tab and click **Deploy**.
2. Dokploy will pull the code, build the images, start the containers, and automatically issue your Let's Encrypt SSL certificate!

---

## Approach 2: Native Dokploy Services (Advanced)

If you prefer to run services as native Dokploy applications (allowing you to use Dokploy's managed MySQL/Redis database dashboards, automatic backups, and scaling features):

1. **Deploy MySQL Database:** Go to Databases -> Create Database -> MySQL. Name it `mypharma-db`. Note the connection string.
2. **Deploy Redis:** Go to Databases -> Create Database -> Redis.
3. **Deploy Backend:** Create an Application pointing to `/backend`. Select build type Dockerfile. Connect persistent storage mount from `backend_media` to `/app/media`. Point domain `api.mypharma.com.bd` to port `8000`.
4. **Deploy Celery:** Create another Application pointing to `/backend` with startup command overridden to:
   ```bash
   celery -A my_pharma worker -l info
   ```
5. **Deploy Frontend:** Create an Application pointing to `/frontend` using Dockerfile. Set domain `mypharma.com.bd` pointing to port `3000`. Add all build-time environment variables in the dashboard.
