# --- Stage 1: Build ---
FROM node:22-alpine AS builder
WORKDIR /app

# Copy root manifests + workspace package.json files before npm ci
# so npm workspaces can resolve and link lib dependencies
COPY package.json package-lock.json ./
COPY libs/domain/package.json libs/domain/
COPY libs/fastify/package.json libs/fastify/
COPY libs/utils/package.json libs/utils/
RUN npm ci

COPY nx.json tsconfig*.json ./
COPY libs/ libs/
COPY apps/backend/ apps/backend/

RUN npx nx build backend --configuration=production

# --- Stage 2: Production ---
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist/apps/backend/ ./

RUN npm ci --omit=dev && npm cache clean --force

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost:5000/health || exit 1

USER node
CMD ["node", "main.js"]
