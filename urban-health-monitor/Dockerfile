# ==========================================
# Urban Health Monitoring System
# Multi-Stage Production Dockerfile
# Maintainer: aayushdevelops
# Image: aayushdevelops/urban_health_monitoring_system
# ==========================================

# ── Stage 1: Build the React + Vite SPA ──
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install dependencies cleanly
RUN npm ci

# Copy application source
COPY . .

# Compile TypeScript and bundle with Vite into /app/dist
RUN npm run build

# ── Stage 2: Serve via High-Performance Nginx ──
FROM nginx:alpine AS runner

# wget is used by HEALTHCHECK; nginx:alpine does not always include it
RUN apk add --no-cache wget \
 && rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration with SPA fallback & gzip compression
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production bundle from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Metadata labels
LABEL maintainer="aayushdevelops"
LABEL project="Urban_Health_monitoring_system"
LABEL repository="aayushdevelops/urban_health_monitoring_system"
LABEL version="1.0.0"

# Expose standard HTTP port
EXPOSE 80

# Healthcheck to verify Nginx is actively responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
