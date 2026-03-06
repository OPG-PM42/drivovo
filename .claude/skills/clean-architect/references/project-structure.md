# Структура проекта Drivovo

## Монорепозиторий (Nx)

```
drivovo/
├── apps/
│   ├── web/            Next.js 16 + React 19 + MobX (фронтенд)
│   ├── admin/          Angular 21 + NGXS (админка)
│   ├── backend/        Fastify 5 (API-сервер)
│   └── api/            (placeholder)
├── libs/
│   └── domain/         Shared domain layer
└── tsconfig.base.json  Path: "domain" → "libs/domain/src/index.ts"
```

## Domain lib (libs/domain/src/)

```
libs/domain/src/
├── index.ts              Re-exports: entities, value-objects
├── entities/
│   ├── index.ts          Barrel export
│   ├── car.ts            CarEntity
│   ├── country.ts        CountryEntity
│   ├── credit.ts         CreditEntity
│   ├── page.ts           CarPageEntity + SEO, Review
│   ├── tariff.ts         TariffEntity
│   └── user.ts           UserEntity
└── value-object/
    ├── index.ts          Barrel export
    ├── image.ts          Image
    ├── money.ts          Money
    ├── option.ts         Option
    └── price.ts          Price (extends Money)
```

## Существующие Entity

| Entity | Поля | Файл |
|--------|------|------|
| CarEntity | id, name, brand, images, description, driveType, type, url, acceleration, power, engine, interiorTrim, status, color, price | entities/car.ts |
| UserEntity | id, name, email, phone, drivingExperience, cameFrom, availability, drinks?, createdAt, updatedAt | entities/user.ts |
| CountryEntity | id, name, iso2, iso3, phoneCode, currency | entities/country.ts |
| CreditEntity | id, tariff, car, country, user, status, term, deposit, createdAt, updatedAt | entities/credit.ts |
| TariffEntity | id, type, name, options | entities/tariff.ts |
| CarPageEntity | id, title, description, rating, car, reviews, banners, seo | entities/page.ts |

## Существующие Value Objects

| Value Object | Поля | Файл |
|--------------|------|------|
| Money | value, currency | value-object/money.ts |
| Price | extends Money + countryId, carId | value-object/price.ts |
| Image | url, alt, width, height, parentId | value-object/image.ts |
| Option | name, price, carId, countryId, creditId | value-object/option.ts |

## Стек по приложениям

| App | Framework | State | Модули |
|-----|-----------|-------|--------|
| web | Next.js 16 + React 19 | MobX 6 | esnext |
| admin | Angular 21 | NGXS | esnext |
| backend | Fastify 5 | — | commonjs |

## Импорт домена

```typescript
// Из любого приложения:
import { CarEntity, Money, Price } from 'domain';
```

Path alias в `tsconfig.base.json`: `"domain": ["libs/domain/src/index.ts"]`
