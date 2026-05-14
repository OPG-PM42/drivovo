# Docker — пересборка и запуск

Гайд по работе с Docker-сетапом монорепозитория Drivovo. Дополняет [README.md](./README.md).

## Что собирается

`docker-compose.yml` поднимает 4 сервиса:

| Сервис | Порт хоста | Базовый образ | Dockerfile | Назначение |
|---|---|---|---|---|
| `db` | `5432` | `postgres:16-alpine` | — | PostgreSQL, данные в named volume `pgdata` |
| `backend` | `5000` | `node:22-alpine` → runner | `deploy/docker/backend.Dockerfile` | Fastify API, multi-stage (build → prod-only deps) |
| `admin` | `4200` → 80 | `nginx:1.27-alpine` | `deploy/docker/admin.Dockerfile` | Angular SPA, статика за Nginx с reverse-proxy на `/auth`, `/cars`, `/tariffs`, `/docs` → `backend:5000` |
| `web` | `3000` | `node:22-alpine` → runner | `deploy/docker/web.Dockerfile` | Next.js 16 standalone server |

Порты переопределяются переменными `BACKEND_PORT`, `ADMIN_PORT`, `WEB_PORT`, `POSTGRES_PORT` (см. `.env.example`).

## Подготовка окружения (один раз)

```sh
cp .env.example .env       # отредактируйте при необходимости
npm ci                     # нужен для local-dev и для миграций host-side
```

`docker compose` подхватит `.env` автоматически (стандарт Compose v2).

## Полный запуск всех сервисов

```sh
docker compose up -d --build
```

`--build` принудительно пересобирает образы. Без этого флага Compose использует уже собранные локальные образы и **не подхватит изменения в исходниках или зависимостях**.

После старта:
- Admin: http://localhost:4200
- Web: http://localhost:3000
- Backend: http://localhost:5000 (Swagger: http://localhost:5000/docs)
- Postgres: localhost:5432 (`drivovo` / `drivovo_dev` по умолчанию)

Healthcheck'и встроены во все 3 контейнера-приложения и в БД — `docker compose ps` показывает `healthy/unhealthy` для каждого.

## Пересборка отдельного сервиса

Когда меняли только один app/lib — пересобираем точечно:

```sh
docker compose build admin            # пересобрать только admin (после изменений в apps/admin или libs/*)
docker compose up -d --build admin    # пересобрать + перезапустить
docker compose up -d --force-recreate admin   # просто перезапустить контейнер без ребилда
```

Допустимые имена сервисов: `backend`, `admin`, `web`, `db`.

## Когда обязательно нужен `--build`

| Изменение | Что пересобрать |
|---|---|
| `package.json` / `package-lock.json` (например, `npm install @taiga-ui/*`) | все 3 app-сервиса: `docker compose build` |
| Только `apps/admin/**` | `docker compose build admin` |
| Только `apps/web/**` | `docker compose build web` |
| Только `apps/backend/**` | `docker compose build backend` |
| `libs/domain/**`, `libs/fastify/**`, `libs/utils/**` | все app, которые её используют (см. таблицу выше) |
| `deploy/docker/*.Dockerfile` | соответствующий сервис |
| `deploy/nginx/admin.conf` | `docker compose build admin` |

Чистый ребилд без кэша слоёв (если что-то «застряло» в кэше):

```sh
docker compose build --no-cache admin
```

## Параллельная сборка

Compose по умолчанию собирает образы параллельно. Если ресурсы ограничены, можно последовательно:

```sh
COMPOSE_PARALLEL_LIMIT=1 docker compose build
```

## Запуск частями

Только база (для локальной разработки через `npm run dev:*`):

```sh
docker compose up db -d
npm run dev:backend          # backend на :5000
npm run dev:admin            # admin на :4200 (Angular dev-server)
npm run dev                  # web на :3000
```

Только бэкенд + БД (без фронтов):

```sh
docker compose up -d db backend
```

## Миграции и сид

Миграции запускаются с хоста — они подключаются к БД через `DATABASE_URL` из `apps/api/.env` или переменных окружения:

```sh
npm run migrate            # применить все pending
npm run migrate:status     # увидеть, что применено
npm run migrate:create -- add_some_table
```

Сид загружается напрямую в контейнер `db`:

```sh
docker compose exec -T db psql -U drivovo -d drivovo < apps/backend/src/utils/seed/seed.sql
```

`-T` отключает TTY — обязателен при пайпинге файла через stdin.

## Полный сброс БД

Удалить volume и поднять чистую БД с применёнными миграциями + сидом:

```sh
docker compose down -v                  # -v удаляет named volume pgdata
docker compose up db -d
npm run migrate
docker compose exec -T db psql -U drivovo -d drivovo < apps/backend/src/utils/seed/seed.sql
```

Без `-v` контейнер пересоздаётся, но данные сохраняются в `pgdata` volume.

## Логи и диагностика

```sh
docker compose ps                       # статус + healthcheck всех контейнеров
docker compose logs -f admin            # follow логи одного сервиса
docker compose logs --tail=100 backend  # последние 100 строк
docker compose exec backend sh          # шелл внутри запущенного контейнера
docker compose exec db psql -U drivovo  # psql внутри db
```

Проверить, что admin отдаёт собранную статику:

```sh
curl -I http://localhost:4200/         # ожидаем 200 + Content-Type: text/html
curl http://localhost:4200/cars        # должен пройти через nginx-proxy на backend:5000
```

## Очистка

```sh
docker compose down                # остановить и удалить контейнеры (volume остаётся)
docker compose down -v             # + удалить volume (данные БД пропадут)
docker compose down --rmi local    # + удалить локально собранные образы
docker system prune -af            # глобальная чистка неиспользуемого (осторожно — затронет другие проекты)
```

## Типовые проблемы

**`port is already allocated`** — порт занят локальным процессом. Либо погасите процесс, либо переопределите порт в `.env`:

```sh
ADMIN_PORT=4201 docker compose up -d admin
```

**Backend стартует, но падает на `ECONNREFUSED db:5432`** — проверьте healthcheck БД (`docker compose ps`); backend ждёт `service_healthy` для `db` через `depends_on.condition`, но если БД сама падает с ошибкой в логах, цепочка стопорится.

**Admin отдаёт 200, но API-запросы (`/auth`, `/cars`, `/tariffs`) возвращают 502** — backend не поднялся или его hostname в `deploy/nginx/admin.conf` (`proxy_pass http://backend:5000`) не резолвится. Проверьте `docker compose logs backend` и что оба контейнера в одной compose-сети (по умолчанию `drivovo_default`).

**Изменения в `libs/*` не подхватываются** — образы кэшируют `npm ci` слой. Пересоберите соответствующий app: `docker compose build --no-cache <service>`.

**После `npm install` в корне образ не использует новые пакеты** — `docker compose build` без `--no-cache` может зацепиться за кэш слоя `RUN npm ci`. Если зависимости явно обновились (например, после миграции на Taiga UI 5.6.0), пересоберите с `--no-cache`:

```sh
docker compose build --no-cache admin web backend
docker compose up -d
```

**`COPY libs/domain/package.json libs/domain/` падает** — в репозитории отсутствует один из `libs/*/package.json`, перечисленных в `backend.Dockerfile` / `admin.Dockerfile`. Это поломанный workspace — нужно либо вернуть отсутствующий файл, либо убрать его строку из Dockerfile.

## Production-сборка локально без Docker

Если нужно проверить именно production-выхлоп без запуска контейнеров:

```sh
npx nx build admin --configuration=production    # → dist/apps/admin/browser/
npx nx build web                                 # → apps/web/.next/standalone/
npx nx build backend --configuration=production  # → dist/apps/backend/
```

Те же самые артефакты потом упаковываются в образы через `deploy/docker/*.Dockerfile` (stage 1).
