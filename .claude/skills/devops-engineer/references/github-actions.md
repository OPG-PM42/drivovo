# GitHub Actions — CI/CD для Drivovo

## Структура workflows

```
.github/
└── workflows/
    ├── ci.yml            # Lint + Test на каждый PR
    ├── build-deploy.yml  # Build images + Deploy (main/tags)
    └── release.yml       # Опционально: релизы по тегам
```

## CI Workflow (lint, test, build check)

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # для nx affected

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci

      - uses: nrwl/nx-set-shas@v4  # определяет base SHA для affected

      - name: Lint affected
        run: npx nx affected --target=lint --parallel=3

      - name: Test affected
        run: npx nx affected --target=test --parallel=3

      - name: Build affected
        run: npx nx affected --target=build --configuration=production --parallel=3
```

## Build & Deploy Workflow

```yaml
name: Build & Deploy

on:
  push:
    branches: [main]
    tags: ["v*"]

env:
  REGISTRY: ghcr.io
  IMAGE_PREFIX: ghcr.io/${{ github.repository_owner }}/drivovo

jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      backend: ${{ steps.filter.outputs.backend }}
      admin: ${{ steps.filter.outputs.admin }}
      web: ${{ steps.filter.outputs.web }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            backend:
              - 'apps/backend/**'
              - 'libs/**'
              - 'package-lock.json'
            admin:
              - 'apps/admin/**'
              - 'libs/**'
              - 'package-lock.json'
            web:
              - 'apps/web/**'
              - 'libs/**'
              - 'package-lock.json'

  build-backend:
    needs: changes
    if: needs.changes.outputs.backend == 'true'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/metadata-action@v5
        id: meta
        with:
          images: ${{ env.IMAGE_PREFIX }}-backend
          tags: |
            type=sha,prefix=
            type=ref,event=branch
            type=semver,pattern={{version}}

      - uses: docker/build-push-action@v6
        with:
          context: .
          file: deploy/docker/backend.Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  build-admin:
    needs: changes
    if: needs.changes.outputs.admin == 'true'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/metadata-action@v5
        id: meta
        with:
          images: ${{ env.IMAGE_PREFIX }}-admin
          tags: |
            type=sha,prefix=
            type=ref,event=branch
            type=semver,pattern={{version}}

      - uses: docker/build-push-action@v6
        with:
          context: .
          file: deploy/docker/admin.Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  build-web:
    needs: changes
    if: needs.changes.outputs.web == 'true'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/metadata-action@v5
        id: meta
        with:
          images: ${{ env.IMAGE_PREFIX }}-web
          tags: |
            type=sha,prefix=
            type=ref,event=branch
            type=semver,pattern={{version}}

      - uses: docker/build-push-action@v6
        with:
          context: .
          file: deploy/docker/web.Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    needs: [build-backend, build-admin, build-web]
    if: github.ref == 'refs/heads/main' && always() && !contains(needs.*.result, 'failure')
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Set image tags
        run: echo "IMAGE_TAG=${GITHUB_SHA::7}" >> $GITHUB_ENV

      - name: Deploy to staging
        run: |
          # Вариант 1: kubectl
          # kubectl set image deployment/backend backend=${{ env.IMAGE_PREFIX }}-backend:${{ env.IMAGE_TAG }}
          # Вариант 2: Helm
          # helm upgrade drivovo deploy/helm/drivovo --set global.imageTag=${{ env.IMAGE_TAG }}
          echo "Deploy with tag: ${{ env.IMAGE_TAG }}"

  deploy-production:
    needs: [build-backend, build-admin, build-web]
    if: startsWith(github.ref, 'refs/tags/v') && always() && !contains(needs.*.result, 'failure')
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Set image tags
        run: echo "IMAGE_TAG=${GITHUB_REF_NAME}" >> $GITHUB_ENV

      - name: Deploy to production
        run: |
          echo "Deploy with tag: ${{ env.IMAGE_TAG }}"
```

## Ключевые паттерны

### 1. Nx Affected
Для PR используй `nx affected` — собирать/тестировать только изменённые проекты:
```yaml
- uses: nrwl/nx-set-shas@v4
- run: npx nx affected --target=build
```

### 2. Path-based filtering
Для Docker-билдов используй `dorny/paths-filter` — собирать образ только если изменились файлы приложения.

### 3. Docker layer caching
Используй GitHub Actions cache для Docker:
```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

### 4. Image tagging
- На push в main: тег по git SHA (первые 7 символов)
- На теги v*: семантическая версия
- Никогда не использовать `latest` в production

### 5. Environments
Используй GitHub Environments для staging/production:
- staging: автодеплой на push в main
- production: деплой по тегу, с ручным approval

### 6. Secrets
Обязательные секреты:
- `GITHUB_TOKEN` — встроенный, для ghcr.io
- `KUBE_CONFIG` — kubeconfig для kubectl (если деплой через kubectl)
- Специфичные для приложения env-переменные

### 7. Concurrency
Отменять предыдущие запуски CI на том же бранче:
```yaml
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```
