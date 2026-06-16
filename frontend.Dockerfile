# STAGE 1 — node builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first (layer cache optimization)
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --frozen-lockfile

# Copy source and build
COPY frontend/ .
RUN npm run build
# Output is in /app/dist

# STAGE 2 — nginx runtime
FROM nginx:1.25-alpine AS runtime

# Remove default nginx user's root privileges
RUN addgroup -g 1001 -S nginxgroup && \
    adduser -u 1001 -S nginxuser -G nginxgroup

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Fix permissions for non-root nginx
RUN chown -R nginxuser:nginxgroup /usr/share/nginx/html && \
    chown -R nginxuser:nginxgroup /var/cache/nginx && \
    chown -R nginxuser:nginxgroup /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginxuser:nginxgroup /var/run/nginx.pid

USER nginxuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
