# My Pharma – Next.js frontend (production-ready)
# Single-stage build/start to avoid corrupted .next artifacts during cross-stage copy
# in unstable Docker Desktop/containerd environments.

FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm ci 2>/dev/null || npm install --legacy-peer-deps

COPY . .

# Build-time env (required for NEXT_PUBLIC_* and runtime config)
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ARG NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
ARG NEXT_PUBLIC_FIREBASE_API_KEY=dummy
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dummy
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID=dummy
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dummy
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=dummy
ARG NEXT_PUBLIC_FIREBASE_APP_ID=dummy
ARG NEXT_PUBLIC_FIREBASE_VAPID_KEY=dummy
ARG NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY=dummy
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL} \
    NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY} \
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN} \
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID} \
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET} \
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID} \
    NEXT_PUBLIC_FIREBASE_APP_ID=${NEXT_PUBLIC_FIREBASE_APP_ID} \
    NEXT_PUBLIC_FIREBASE_VAPID_KEY=${NEXT_PUBLIC_FIREBASE_VAPID_KEY} \
    NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY=${NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY} \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS="--max-old-space-size=4096" \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN npm run build

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3000"]
