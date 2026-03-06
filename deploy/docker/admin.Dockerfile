# --- Stage 1: Build ---
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY nx.json tsconfig*.json ./
COPY libs/ libs/
COPY apps/admin/ apps/admin/

RUN npx nx build admin --configuration=production

# --- Stage 2: Nginx ---
FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/dist/apps/admin/browser/ /usr/share/nginx/html/
COPY deploy/nginx/admin.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:80/ || exit 1
