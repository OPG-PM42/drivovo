# Docker — паттерны для Drivovo

## .dockerignore (корень монорепо)

```dockerignore
node_modules
dist
.nx
.angular
.next
.git
*.md
.env*
.claude
docs
```

## Multi-stage Dockerfile — Backend (Fastify/esbuild)

```dockerfile
# --- Stage 1: Build ---
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY nx.json tsconfig*.json ./
COPY libs/ libs/
COPY apps/backend/ apps/backend/

RUN npx nx build backend --configuration=production

# --- Stage 2: Production ---
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# esbuild с generatePackageJson создаёт package.json в dist
COPY --from=builder /app/dist/apps/backend/ ./

RUN npm ci --omit=dev && npm cache clean --force

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost:5000/health || exit 1

USER node
CMD ["node", "main.js"]
```

## Multi-stage Dockerfile — Admin (Angular → Nginx)

```dockerfile
# --- Stage 1: Build ---
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY nx.json tsconfig*.json angular.json ./
COPY libs/ libs/
COPY apps/admin/ apps/admin/

RUN npx nx build admin --configuration=production

# --- Stage 2: Nginx ---
FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/dist/apps/admin/browser/ /usr/share/nginx/html/

# SPA fallback конфиг
COPY deploy/nginx/admin.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:80/ || exit 1
```

### Nginx-конфиг для Angular SPA (`deploy/nginx/admin.conf`)

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Кэширование статики с хэшами
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Multi-stage Dockerfile — Web (Next.js standalone)

```dockerfile
# --- Stage 1: Build ---
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY nx.json tsconfig*.json next.config.* ./
COPY libs/ libs/
COPY apps/web/ apps/web/

RUN npx nx build web --configuration=production

# --- Stage 2: Production ---
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Next.js standalone output
COPY --from=builder /app/dist/apps/web/standalone/ ./
COPY --from=builder /app/dist/apps/web/static/ ./public/_next/static/
COPY --from=builder /app/dist/apps/web/public/ ./public/

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://localhost:3000/ || exit 1

USER node
CMD ["node", "server.js"]
```

## docker-compose.yml (локальная разработка)

```yaml
services:
  backend:
    build:
      context: .
      dockerfile: deploy/docker/backend.Dockerfile
    ports:
      - "5000:5000"
    env_file: .env
    depends_on:
      db:
        condition: service_healthy

  admin:
    build:
      context: .
      dockerfile: deploy/docker/admin.Dockerfile
    ports:
      - "4200:80"

  web:
    build:
      context: .
      dockerfile: deploy/docker/web.Dockerfile
    ports:
      - "3000:3000"
    env_file: .env

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: drivovo
      POSTGRES_USER: drivovo
      POSTGRES_PASSWORD: drivovo_dev
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U drivovo"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  pgdata:
```

## docker-compose.prod.yml (production overrides)

```yaml
services:
  backend:
    restart: always
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.5"

  admin:
    restart: always

  web:
    restart: always
```

## Оптимизация Docker-образов

1. **Базовый образ** — всегда `alpine` (node:22-alpine, nginx:1.27-alpine)
2. **Layer caching** — COPY package*.json перед npm ci, код копировать после
3. **USER node** — не запускать процесс от root
4. **npm ci --omit=dev** — не тащить devDependencies в production
5. **Multi-stage** — build stage не попадает в финальный образ
6. **.dockerignore** — исключить node_modules, .git, dist

## Структура файлов деплоя

```
deploy/
├── docker/
│   ├── backend.Dockerfile
│   ├── admin.Dockerfile
│   └── web.Dockerfile
├── nginx/
│   └── admin.conf
└── k8s/
    └── ... (см. kubernetes.md)
```
