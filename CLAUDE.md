# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository

Drivovo is an **Nx 22.5 monorepo** mixing Next.js 16 (React 19) frontend, an Angular 21 admin app, and a Fastify backend, structured around Clean Architecture / DDD. It's a learning/course project (Metarhia patterns course).

## Commands

Task runner is Nx. Prefer `nx run` / `nx run-many` / `nx affected` over underlying tooling. The npm scripts are thin wrappers.

```shell
# Install
npm ci

# Dev servers
npm run dev              # nx dev web        (Next.js on :3000)
npm run dev:admin        # nx serve admin    (Angular)
npm run dev:backend      # nx serve backend  (Fastify, PORT env)

# Build
npm run build            # nx build web
npm run build:admin
npm run build:backend

# Lint / format (repo-wide)
npm run lint             # eslint apps/web apps/admin
npm run format
npm run format:check

# DB migrations (apps/backend/scripts/migrate.ts)
npx tsx apps/backend/scripts/migrate.ts up
npx tsx apps/backend/scripts/migrate.ts down

# Nx utilities
npx nx graph             # visualize project graph
npx nx affected -t build lint test
npx nx run <project>:<target>
```

Tests use Jest via `@nx/jest` (`targetName: test`). Run a single project's tests: `npx nx test <project>`. Run a single file: `npx nx test <project> --testFile=<path>`. No top-level `npm test` script — go through Nx.

## Architecture

The codebase is organized in **Clean Architecture layers**, crossing project boundaries:

### Libraries (`libs/`)

- **`libs/domain`** (`@drivovo/domain`) — pure domain layer. Entities and value objects only. Zero framework/infrastructure dependencies. **No repository ports here** — those live next to the adapters in the backend (see below).
  - `entities/` — `UserEntity`, `CarEntity`, `CreditEntity`, `AdminEntity`, `SessionEntity`, etc. Suffix `Entity` on type names; filenames are `kebab-case.ts` without the suffix.
  - `value-object/` — `Money`, `Price`, `Image`, `Option`.

- **`libs/fastify`** (`@drivovo/fastify`) — extracted Fastify server. Exports `runServer(opts)` and a typed `EndpointMap` / `AuthProvider` / `Endpoint` model. The backend's `main.js` is a thin wrapper that calls `runServer({ port, host, endpointMap, authProvider, config })`. Handles session cookies via `@fastify/cookie`.

- **`libs/utils`** (`@drivovo/utils`) — shared low-level helpers. Currently exports `crypto` utilities. Add general-purpose, framework-free helpers here.

### Backend (`apps/backend`) — Fastify app

Layered inside the app:

- **`src/repositories/`** — Postgres adapters. Each `<entity>.repository.ts` is a `default`-exported object literal `satisfies <Entity>Repository`, using the `db` singleton. All DB calls are wrapped in `try/catch` → `throw RepositoryError.from(error)`. Use `$if` for conditional WHERE/ORDER/LIMIT clauses. Sort fields go through a `SORT_FIELD_MAP` whitelist (keys are what the API accepts; values are the DB column names) — passed to `query.orderBy(SORT_FIELD_MAP[params.sortField!], params.sortOrder)`. The base `Repository<E, P>` interface, `SearchParams<T>` generic, `DATABASE_ERRORS` codes, and `RepositoryError` class live in `repositories/repository.ts`. Adapters are aggregated in `repositories/index.ts` as a typed `Repositories` registry passed to domain services.

  Canonical templates: `admin.repository.ts` (has `findByEmail`), `car.repository.ts` (minimal CRUD). For sessions, see `session.repository.ts` — it defines its own narrower interface (not `Repository<E, P>`) when CRUD doesn't fit.

- **`src/infrastructure/database/`** — Kysely setup.
  - `index.ts` exports the `Database` interface (one property per table) and the `db` singleton (Kysely + `PostgresDialect` over `pg.Pool`, `DATABASE_URL` from env).
  - `tables/<entity>.ts` declares each `<Name>Table` (kysely column types) plus `create<Entity>Entity` (row → entity), `create<Entity>Table` (entity → `Insertable`), and `create<Entity>Updates` (partial entity → `Updateable`) mappers. Re-export from `tables/index.ts`.
  - `migrations/<NNNN>_<name>.ts` — Kysely migrations (run via `apps/backend/scripts/migrate.ts`, executed by `migrator.ts`).
  - **Never hand-concatenate SQL** — always go through the Kysely builder.

- **`src/domain/services/`** — backend-local domain services. TS files like `admin.ts`, `page.ts`, `session.ts` use a `ServiceFactory<T, P, E>` pattern that takes `Dependencies = { repositories: Repositories }` and returns a service. Errors are thrown as `DomainError` with codes from `DOMAIN_ERRORS` (translate `RepositoryError` codes from the DB layer when needed). `service.ts` defines `BaseService<T, P, E>`, `DOMAIN_ERRORS`, `DomainError`, and the factory contract. `index.js` wires services with their dependencies. Some legacy services (e.g. `car.js`) are still JS — new services should be TS.

- **`src/auth/`** — `provider.js` implements the session-based `AuthProvider` (used by `@drivovo/fastify`'s `runServer`). `index.js` exports the configured provider.

- **`src/endpoints/`** — Fastify route handlers. `endpointMap` consumed by `main.js`. `runServer` walks `{ namespace: [endpoint, ...] }` and registers routes under `/<namespace>/<path>` with `access: 'public' | 'private'` and optional session enforcement.

- Backend entry is `main.js` (not TS) built via `@nx/esbuild` → `dist/apps/backend`.

### Frontend (`apps/web`) — Next.js 16 App Router

`app/` is routes, `ui/` is components and providers, `states/` is MobX stores (`mobx` + `mobx-react-lite`). Uses React Server Components by default; add `'use client'` only when needed. Tailwind 3.4 for styling.

### Admin (`apps/admin`) — Angular 21

Separate build pipeline via `@angular/build`.

### Layer dependency rule

Direction of imports must flow inward: `presentation → application/domain-services → infrastructure (repositories, db) → domain (entities, VOs)`. `libs/domain` must never import from `apps/*` or any infrastructure package. Apps import domain via `@drivovo/domain`, never via relative paths into `libs/`.

### Adding a new persisted entity (typical flow)

1. **Entity** — add/extend the type in `libs/domain/src/entities/<name>.ts`, export from `entities/index.ts`.
2. **Table + mappers** — `apps/backend/src/infrastructure/database/tables/<name>.ts`: define `<Name>Table` (kysely column types) and `create<Entity>Entity` / `create<Entity>Table` / `create<Entity>Updates`. Re-export from `tables/index.ts` and add the table to the `Database` interface in `database/index.ts`.
3. **Migration** — add `apps/backend/src/infrastructure/database/migrations/<NNNN>_<name>.ts` with `up`/`down`.
4. **Repository adapter** — `apps/backend/src/repositories/<name>.repository.ts`: a `default`-exported object literal `satisfies <Name>Repository`, implementing `Repository<Entity, <Name>SearchParams>` with `try/catch` + `RepositoryError.from(error)` on every method. Use `admin.repository.ts` or `user.repository.ts` as a reference.
5. **Register** — add to `apps/backend/src/repositories/index.ts` (both the `Repositories` interface and the default object).
6. **Domain service** (optional, if business logic exists) — `apps/backend/src/domain/services/<name>.ts`, using the `ServiceFactory` pattern with `DomainError` translations. Wire in `services/index.js`.
7. **Endpoint** — `apps/backend/src/endpoints/<name>.js`, register in `endpoints/index.js`.

A `repository-builder` skill exists at `.claude/skills/repository-builder/` and automates steps 2 + 4 + 5 from the entity + table shape.

## Conventions

- **File names:** `kebab-case`. Use suffixed names for role: `*.service.ts`, `*.repository.ts`. Use `index.ts` barrels for public exports of a folder.
- **Identifiers:** `camelCase` values, `PascalCase` types/components, `UPPER_SNAKE_CASE` constants. Entity type names end with `Entity` (filename does not).
- **TypeScript:** strict mode, `moduleResolution: bundler`. Explicit return types on every function and no `any` are **enforced by ESLint** — don't relax them. Use access modifiers on class members. Class member order: private fields → protected fields → public fields → constructors → public → protected → private methods.
- **Errors:**
  - Infrastructure (`repositories/`): catch any thrown error and rethrow as `RepositoryError.from(error)` — it maps known Postgres SQLSTATE codes (e.g. `23505` → `DUPLICATE_ERROR`) to a stable `DATABASE_ERRORS` enum.
  - Domain (`domain/services/`): throw `DomainError` with codes from `DOMAIN_ERRORS` (or service-specific codes like `'EMAIL_TAKEN'`). Translate `RepositoryError` codes at the service boundary; never let raw DB errors leak to endpoints.
  - Repository `findOne` / `findBy*` return `null` for "not found" (don't throw); services decide whether to map to `DomainError(NOT_FOUND)`.
- **Commits:** `#<issue> [<type>] <area>: <description>` — type is one of `feat|fix|refactor|docs|style|test|ci`; area is `core|web|admin|backend|domain|infra`. Commit messages in English. Example: `#42 [feat] web: add car listing page`. Squash-merge feature branches into `main`.
- **Branches:** `<kind>/<issue-id>-<kebab-description>` or `<issue-id>-<kebab-description>`, e.g. `feat/user-repository-29` or `42-add-car-listing-page`.

## Nx workspace notes

- Default base branch is `main` (see `nx.json`).
- `@nx/next/plugin`, `@nx/eslint/plugin`, `@nx/jest/plugin` auto-infer targets — you usually won't see `build`/`test` in `project.json`. Check `nx show project <name>` to list real targets.
- Build cache is enabled (`targetDefaults.build.cache: true`); `production` inputs already exclude spec/test files.
- For scaffolding (apps, libs, components), prefer Nx generators (`nx g @nx/next:...`, `@nx/js:...`) rather than hand-creating project files.
