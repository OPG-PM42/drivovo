# План схемы БД Drivovo

## Обзор

Схема БД спроектирована на основе доменных сущностей из `libs/domain/src/entities/` и Value Objects из `libs/domain/src/value-object/`. Следует принципам Clean Architecture — БД является деталью реализации (Infrastructure слой), а Domain слой остаётся независимым.

**Итого: 10 таблиц** покрывают 6 Entity и 5 Value Objects.

---

## Анализ доменной модели

### Entities (с `id`) → таблицы

| Entity         | Ключевые поля                                                        | Связи                                  |
| -------------- | -------------------------------------------------------------------- | -------------------------------------- |
| **CarEntity**      | id, name, brand, description, driveType, type, url, acceleration, power, interiorTrim, status, color + embedded Engine | images → Image[], price → Price        |
| **UserEntity**     | id, name, email, phone, drivingExperience, cameFrom, availability (embedded), drinks, createdAt, updatedAt            | —                                      |
| **CountryEntity**  | id, name, iso2, iso3, phoneCode, currency                           | —                                      |
| **TariffEntity**   | id, type, name                                                       | options → Option[]                     |
| **CreditEntity**   | id, status, term, createdAt, updatedAt                               | tariff → Tariff, car → Car, country → Country, user → User, deposit → Money |
| **CarPageEntity**  | id, title, description, rating                                       | car → Car, reviews → Review[], banners → Image[], seo (embedded) |

### Value Objects (без `id`) → embedded или связанные таблицы

| Value Object | Стратегия хранения                                | Причина                                             |
| ------------ | ------------------------------------------------- | --------------------------------------------------- |
| **Engine**       | Embedded в `cars`                                 | 1:1 жёсткая привязка, всегда загружается вместе     |
| **SEO**          | Embedded в `car_pages`                            | 1:1, два поля                                       |
| **Money** (deposit) | Embedded в `credits`                           | 1:1, два поля                                       |
| **availability** | Embedded в `users`                                | 1:1, два enum-поля                                  |
| **Price**        | Отдельная таблица `car_prices`                    | M:N (Car × Country), уникальная цена для каждой пары |
| **Option**       | Отдельная таблица `tariff_options`                 | M:N связь Tariff × Car × Country                    |
| **Image**        | Отдельная таблица `images`                         | 1:N, может принадлежать разным сущностям             |
| **Review**       | Отдельная таблица `reviews`                        | 1:N, имеет собственные timestamps                   |

---

## Схема таблиц

```
┌──────────────────────────────────────────────────────────────────────┐
│                         SCHEMA: drivovo                              │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐       ┌─────────────────────┐
│      countries       │       │       users          │
├─────────────────────┤       ├─────────────────────┤
│ id          UUID PK │       │ id          UUID PK │
│ name        VARCHAR │       │ name        VARCHAR │
│ iso2        CHAR(2) │       │ email       VARCHAR │
│ iso3        CHAR(3) │       │ phone       VARCHAR │
│ phone_code  VARCHAR │       │ driving_exp ENUM    │
│ currency    VARCHAR │       │ came_from   VARCHAR │
└─────────┬───────────┘       │ avail_day   ENUM    │
          │                   │ avail_time  ENUM    │
          │                   │ drinks      ENUM?   │
          │                   │ created_at  TIMESTAMP│
          │                   │ updated_at  TIMESTAMP│
          │                   └─────────┬───────────┘
          │                             │
┌─────────┴───────────┐                 │
│        cars          │                 │
├─────────────────────┤                 │
│ id          UUID PK │                 │
│ name        VARCHAR │                 │
│ brand       VARCHAR │                 │
│ description TEXT    │                 │
│ drive_type  ENUM    │                 │
│ type        ENUM    │                 │
│ url         VARCHAR │                 │
│ acceleration VARCHAR│                 │
│ power       VARCHAR │                 │
│ color       VARCHAR │                 │
│ interior_trim VARCHAR│                │
│ status      ENUM    │                 │
│ engine_type ENUM    │  ← embedded     │
│ engine_capacity VARCHAR│  Engine      │
│ engine_fuel_cons VARCHAR│             │
└──┬──────────────────┘                 │
   │                                    │
   │  ┌──────────────────────┐          │
   │  │      car_prices       │          │
   │  ├──────────────────────┤          │
   │  │ id         UUID PK   │          │
   ├──┤ car_id     UUID FK→cars│        │
   │  │ country_id UUID FK→countries│   │
   │  │ value      DECIMAL(12,2)│        │
   │  │ currency   VARCHAR(10)│         │
   │  │ UNIQUE(car_id, country_id)│     │
   │  └──────────────────────┘          │
   │                                    │
   │  ┌──────────────────────┐          │
   │  │       images          │          │
   │  ├──────────────────────┤          │
   │  │ id         UUID PK   │          │
   ├──┤ parent_id  UUID      │  ← полиморфная FK
   │  │ parent_type VARCHAR  │  (car|car_page_banner)
   │  │ url        VARCHAR   │          │
   │  │ alt        VARCHAR   │          │
   │  │ width      INT       │          │
   │  │ height     INT       │          │
   │  └──────────────────────┘          │
   │                                    │
   │  ┌──────────────────────┐          │
   │  │      tariffs          │          │
   │  ├──────────────────────┤          │
   │  │ id         UUID PK   │          │
   │  │ type       ENUM      │          │
   │  │ name       VARCHAR   │          │
   │  └──────┬───────────────┘          │
   │         │                          │
   │  ┌──────┴───────────────┐          │
   │  │   tariff_options      │          │
   │  ├──────────────────────┤          │
   │  │ id         UUID PK   │          │
   │  │ tariff_id  UUID FK→tariffs│     │
   ├──┤ car_id     UUID FK→cars│        │
   │  │ country_id UUID FK→countries│   │
   │  │ name       VARCHAR   │          │
   │  │ price      DECIMAL(12,2)│       │
   │  │ currency   VARCHAR(10)│         │
   │  │ UNIQUE(tariff_id,     │         │
   │  │   car_id, country_id) │         │
   │  └──────────────────────┘          │
   │                                    │
   │  ┌──────────────────────┐          │
   │  │       credits         │          │
   │  ├──────────────────────┤          │
   │  │ id         UUID PK   │          │
   ├──┤ car_id     UUID FK→cars│        │
   │  │ tariff_id  UUID FK→tariffs│     │
   │  │ country_id UUID FK→countries◄───┘
   │  │ user_id    UUID FK→users◄───────┘
   │  │ status     ENUM      │
   │  │ term       INT       │
   │  │ deposit_value DECIMAL(12,2)│ ← embedded Money
   │  │ deposit_currency VARCHAR│
   │  │ created_at TIMESTAMP │
   │  │ updated_at TIMESTAMP │
   │  └──────────────────────┘
   │
   │  ┌──────────────────────┐
   │  │     car_pages         │
   │  ├──────────────────────┤
   │  │ id         UUID PK   │
   ├──┤ car_id     UUID FK→cars│
   │  │ title      VARCHAR   │
   │  │ description TEXT     │
   │  │ rating     DECIMAL(3,2)│
   │  │ seo_title  VARCHAR   │  ← embedded SEO
   │  │ seo_description TEXT │
   │  └──────┬───────────────┘
   │         │
   │  ┌──────┴───────────────┐
   │  │      reviews          │
   │  ├──────────────────────┤
   │  │ id         UUID PK   │
   │  │ car_page_id UUID FK→car_pages│
   │  │ rating     INT       │
   │  │ comment    TEXT      │
   │  │ author     VARCHAR   │
   │  │ author_image VARCHAR │
   │  │ created_at TIMESTAMP │
   │  │ updated_at TIMESTAMP │
   │  └──────────────────────┘
```

---

## Связи между таблицами

| Связь                              | Тип | Описание                                   |
| ---------------------------------- | --- | ------------------------------------------ |
| `cars` ↔ `car_prices`             | 1:N | У машины может быть цена в разных странах  |
| `cars` ↔ `images`                 | 1:N | Множество фото у машины                   |
| `tariffs` ↔ `tariff_options`      | 1:N | У тарифа множество опций                   |
| `credits` → `cars`                | N:1 | Кредит ссылается на машину                 |
| `credits` → `tariffs`             | N:1 | Кредит ссылается на тариф                  |
| `credits` → `countries`           | N:1 | Кредит ссылается на страну                 |
| `credits` → `users`               | N:1 | Кредит ссылается на пользователя           |
| `car_pages` → `cars`              | 1:1 | Одна страница на машину                    |
| `car_pages` ↔ `reviews`           | 1:N | Множество отзывов на странице              |
| `car_pages` ↔ `images` (banners)  | 1:N | Баннеры через `parent_type`                |

---

## Индексы

```sql
-- cars
CREATE INDEX idx_cars_brand ON cars(brand);
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_cars_type ON cars(type);

-- users
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);

-- countries
CREATE UNIQUE INDEX idx_countries_iso2 ON countries(iso2);
CREATE UNIQUE INDEX idx_countries_iso3 ON countries(iso3);

-- credits
CREATE INDEX idx_credits_user_id ON credits(user_id);
CREATE INDEX idx_credits_car_id ON credits(car_id);
CREATE INDEX idx_credits_status ON credits(status);
CREATE INDEX idx_credits_created_at ON credits(created_at);

-- car_prices
CREATE UNIQUE INDEX idx_car_prices_car_country ON car_prices(car_id, country_id);

-- images
CREATE INDEX idx_images_parent ON images(parent_id, parent_type);

-- tariff_options
CREATE INDEX idx_tariff_options_tariff_id ON tariff_options(tariff_id);
CREATE INDEX idx_tariff_options_car_country ON tariff_options(car_id, country_id);
CREATE INDEX idx_tariff_options_country_id ON tariff_options(country_id);
ALTER TABLE tariff_options ADD CONSTRAINT uq_tariff_option UNIQUE (tariff_id, car_id, country_id);

-- reviews
CREATE INDEX idx_reviews_car_page_id ON reviews(car_page_id);
CREATE INDEX idx_reviews_car_page_created ON reviews(car_page_id, created_at DESC);

-- car_pages
CREATE UNIQUE INDEX idx_car_pages_car_id ON car_pages(car_id);
```

---

## ENUM-типы

```sql
CREATE TYPE fuel_type AS ENUM ('petrol', 'diesel', 'electric', 'hybrid', 'other');
CREATE TYPE car_status AS ENUM ('available', 'order');
CREATE TYPE car_type AS ENUM ('sedan', 'hatchback', 'suv', 'mpv', 'coupe', 'convertible', 'van', 'pickup', 'bus', 'other');
CREATE TYPE drive_type AS ENUM ('FWD', 'RWD', 'AWD');
CREATE TYPE driving_experience AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE availability_day AS ENUM ('today', 'tomorrow', 'weekend');
CREATE TYPE availability_time AS ENUM ('morning', 'afternoon', 'evening');
CREATE TYPE drinks_type AS ENUM ('coffee', 'tea');
CREATE TYPE tariff_type AS ENUM ('leasing', 'subscription');
CREATE TYPE credit_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE image_parent_type AS ENUM ('car', 'car_page_banner');
```

---

## Технологический стек БД

| Компонент | Технология | Причина выбора |
| --------- | ---------- | -------------- |
| **СУБД** | PostgreSQL 16+ | Поддержка ENUM, UUID, JSONB, оконные функции |
| **Драйвер** | `pg` (node-postgres) | Минимальная абстракция, полный контроль над SQL |
| **Пул соединений** | `pg.Pool` | Встроен в `pg`, connection pooling из коробки |
| **Миграции** | `node-pg-migrate` | SQL-first миграции, без ORM-зависимостей |
| **UUID** | `gen_random_uuid()` (PG 13+) | Генерация на стороне БД, без доп. библиотек |

**Почему без ORM:**
- Полный контроль над SQL-запросами и их оптимизацией
- Нет "магии" — код делает ровно то, что написано
- Domain Entity остаются чистыми интерфейсами, без декораторов
- Маппинг SQL Row → Domain Entity явный и тестируемый
- Проще отлаживать (SQL виден в логах как есть)

---

## План реализации по слоям Clean Architecture

### 1. Domain слой — Entities и Value Objects (готов)

- [x] Entities: `CarEntity`, `UserEntity`, `CountryEntity`, `TariffEntity`, `CreditEntity`, `CarPageEntity`
- [x] Value Objects: `Money`, `Price`, `Image`, `Option`, `Review`, `SEO`, `Engine`

### 2. Domain слой — Port-интерфейсы (создать)

Абстрактные репозитории в `libs/domain/src/ports/`. Port — это интерфейс, описывающий **контракт** доступа к данным. Реализация (SQL, HTTP, in-memory) определяется в Infrastructure слое.

```
libs/domain/src/
├── ports/
│   ├── index.ts
│   ├── car.repository.ts
│   ├── user.repository.ts
│   ├── country.repository.ts
│   ├── tariff.repository.ts
│   ├── credit.repository.ts
│   └── car-page.repository.ts
└── index.ts                    ← добавить реэкспорт ports
```

- [ ] `CarRepository` — findAll, findById, findByBrand, findByStatus, create, update, delete
- [ ] `UserRepository` — findAll, findById, findByEmail, create, update, delete
- [ ] `CountryRepository` — findAll, findById, findByIso2, findByIso3, create, update, delete
- [ ] `TariffRepository` — findAll, findById, findWithOptions, create, update, delete
- [ ] `CreditRepository` — findAll, findById, findByUserId, findByCarId, findByStatus, create, update, delete
- [ ] `CarPageRepository` — findAll, findById, findByCarId, findWithReviews, create, update, delete

**Пример интерфейса порта:**

```typescript
// libs/domain/src/ports/car.repository.ts
import { CarEntity } from '../entities';

export interface CarRepository {
  findAll(): Promise<CarEntity[]>;
  findById(id: string): Promise<CarEntity | null>;
  findByBrand(brand: string): Promise<CarEntity[]>;
  findByStatus(status: string): Promise<CarEntity[]>;
  create(car: Omit<CarEntity, 'id'>): Promise<CarEntity>;
  update(id: string, car: Partial<CarEntity>): Promise<CarEntity | null>;
  delete(id: string): Promise<boolean>;
}
```

### 3. Infrastructure слой — Database lib (создать)

Создать `libs/database/` — Nx-библиотека, содержащая всё для работы с PostgreSQL.

```
libs/database/
├── src/
│   ├── index.ts                         ← barrel export
│   ├── client/
│   │   ├── pool.ts                      ← pg.Pool singleton + конфиг
│   │   ├── query-builder.ts             ← хелпер для параметризованных запросов
│   │   └── types.ts                     ← типы для SQL-результатов (Row-типы)
│   ├── migrations/
│   │   ├── runner.ts                    ← запуск миграций через node-pg-migrate
│   │   └── sql/
│   │       ├── 001_create-enums.sql
│   │       ├── 002_create-countries.sql
│   │       ├── 003_create-users.sql
│   │       ├── 004_create-cars.sql
│   │       ├── 005_create-car-prices.sql
│   │       ├── 006_create-images.sql
│   │       ├── 007_create-tariffs.sql
│   │       ├── 008_create-tariff-options.sql
│   │       ├── 009_create-credits.sql
│   │       ├── 010_create-car-pages.sql
│   │       └── 011_create-reviews.sql
│   ├── repositories/
│   │   ├── pg-car.repository.ts
│   │   ├── pg-user.repository.ts
│   │   ├── pg-country.repository.ts
│   │   ├── pg-tariff.repository.ts
│   │   ├── pg-credit.repository.ts
│   │   └── pg-car-page.repository.ts
│   └── mappers/
│       ├── car.mapper.ts                ← SQL Row → CarEntity
│       ├── user.mapper.ts               ← SQL Row → UserEntity
│       ├── country.mapper.ts            ← SQL Row → CountryEntity
│       ├── tariff.mapper.ts             ← SQL Row → TariffEntity
│       ├── credit.mapper.ts             ← SQL Row → CreditEntity
│       └── car-page.mapper.ts           ← SQL Row → CarPageEntity
├── project.json                         ← Nx project config
└── tsconfig.json
```

**tsconfig.base.json** — добавить path alias:

```json
{
  "paths": {
    "domain": ["libs/domain/src/index.ts"],
    "database": ["libs/database/src/index.ts"]
  }
}
```

#### 3.1 Подключение к БД (`client/pool.ts`)

```typescript
import { Pool, PoolConfig } from 'pg';

const config: PoolConfig = {
  host: process.env['DB_HOST'] ?? 'localhost',
  port: Number(process.env['DB_PORT'] ?? 5432),
  database: process.env['DB_NAME'] ?? 'drivovo',
  user: process.env['DB_USER'] ?? 'drivovo',
  password: process.env['DB_PASSWORD'] ?? '',
  max: Number(process.env['DB_POOL_MAX'] ?? 20),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

export const pool = new Pool(config);

// Graceful shutdown
process.on('SIGTERM', () => pool.end());
process.on('SIGINT', () => pool.end());
```

#### 3.2 SQL-миграции (raw `.sql` файлы)

Каждая миграция — чистый SQL с `UP` и `DOWN`. Запускаются через `node-pg-migrate`.

**Пример миграции `001_create-enums.sql`:**

```sql
-- Up Migration
CREATE TYPE fuel_type AS ENUM ('petrol', 'diesel', 'electric', 'hybrid', 'other');
CREATE TYPE car_status AS ENUM ('available', 'order');
CREATE TYPE car_type AS ENUM ('sedan', 'hatchback', 'suv', 'mpv', 'coupe', 'convertible', 'van', 'pickup', 'bus', 'other');
CREATE TYPE drive_type AS ENUM ('FWD', 'RWD', 'AWD');
CREATE TYPE driving_experience AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE availability_day AS ENUM ('today', 'tomorrow', 'weekend');
CREATE TYPE availability_time AS ENUM ('morning', 'afternoon', 'evening');
CREATE TYPE drinks_type AS ENUM ('coffee', 'tea');
CREATE TYPE tariff_type AS ENUM ('leasing', 'subscription');
CREATE TYPE credit_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE image_parent_type AS ENUM ('car', 'car_page_banner');

-- Down Migration
DROP TYPE IF EXISTS image_parent_type;
DROP TYPE IF EXISTS credit_status;
DROP TYPE IF EXISTS tariff_type;
DROP TYPE IF EXISTS drinks_type;
DROP TYPE IF EXISTS availability_time;
DROP TYPE IF EXISTS availability_day;
DROP TYPE IF EXISTS driving_experience;
DROP TYPE IF EXISTS drive_type;
DROP TYPE IF EXISTS car_type;
DROP TYPE IF EXISTS car_status;
DROP TYPE IF EXISTS fuel_type;
```

**Пример миграции `004_create-cars.sql`:**

```sql
-- Up Migration
CREATE TABLE cars (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  brand           VARCHAR(100) NOT NULL,
  description     TEXT,
  drive_type      drive_type NOT NULL,
  type            car_type NOT NULL,
  url             VARCHAR(500),
  acceleration    VARCHAR(50),
  power           VARCHAR(50),
  color           VARCHAR(100),
  interior_trim   VARCHAR(255),
  status          car_status NOT NULL DEFAULT 'available',
  engine_type     fuel_type NOT NULL,
  engine_capacity VARCHAR(50),
  engine_fuel_cons VARCHAR(50)
);

CREATE INDEX idx_cars_brand ON cars(brand);
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_cars_type ON cars(type);

-- Down Migration
DROP TABLE IF EXISTS cars;
```

#### 3.3 Row-типы (`client/types.ts`)

Типы, отражающие структуру строк из SQL-результатов (snake_case, примитивные типы SQL):

```typescript
// Типы строк из SQL — отражают колонки таблицы 1:1
export interface CarRow {
  id: string;
  name: string;
  brand: string;
  description: string | null;
  drive_type: string;
  type: string;
  url: string | null;
  acceleration: string | null;
  power: string | null;
  color: string | null;
  interior_trim: string | null;
  status: string;
  engine_type: string;
  engine_capacity: string | null;
  engine_fuel_cons: string | null;
}

export interface ImageRow {
  id: string;
  parent_id: string;
  parent_type: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

// ... аналогично для UserRow, CountryRow, TariffRow, CreditRow и т.д.
```

#### 3.4 Mappers — SQL Row → Domain Entity

Явное преобразование из snake_case SQL Row в camelCase Domain Entity. Mapper — чистая функция без side-effects:

```typescript
// libs/database/src/mappers/car.mapper.ts
import { CarEntity } from 'domain';
import { CarRow, ImageRow, CarPriceRow } from '../client/types';

export const carMapper = {
  toDomain(row: CarRow, images: ImageRow[], prices: CarPriceRow[]): CarEntity {
    return {
      id: row.id,
      name: row.name,
      brand: row.brand,
      description: row.description ?? '',
      driveType: row.drive_type as CarEntity['driveType'],
      type: row.type as CarEntity['type'],
      url: row.url ?? '',
      acceleration: row.acceleration ?? '',
      power: row.power ?? '',
      color: row.color ?? '',
      interiorTrim: row.interior_trim ?? '',
      status: row.status as CarEntity['status'],
      engine: {
        type: row.engine_type as CarEntity['engine']['type'],
        capacity: row.engine_capacity ?? '',
        fuel_consumption: row.engine_fuel_cons ?? '',
      },
      images: images.map(img => ({
        url: img.url,
        alt: img.alt ?? '',
        width: img.width ?? 0,
        height: img.height ?? 0,
        parentId: img.parent_id,
      })),
      price: prices.map(p => ({
        value: Number(p.value),
        currency: p.currency,
        countryId: p.country_id,
        carId: p.car_id,
      })),
    };
  },
};
```

#### 3.5 Репозитории — реализация Port-интерфейсов на чистом SQL

Каждый репозиторий получает `Pool` через конструктор, выполняет параметризованные запросы, маппит результат через mapper:

```typescript
// libs/database/src/repositories/pg-car.repository.ts
import { Pool } from 'pg';
import { CarEntity } from 'domain';
import { CarRepository } from 'domain'; // port-интерфейс
import { carMapper } from '../mappers/car.mapper';

export class PgCarRepository implements CarRepository {
  constructor(private pool: Pool) {}

  async findAll(): Promise<CarEntity[]> {
    const carsResult = await this.pool.query('SELECT * FROM cars');
    const carIds = carsResult.rows.map(r => r.id);

    if (carIds.length === 0) return [];

    const [imagesResult, pricesResult] = await Promise.all([
      this.pool.query(
        `SELECT * FROM images WHERE parent_type = 'car' AND parent_id = ANY($1)`,
        [carIds]
      ),
      this.pool.query(
        'SELECT * FROM car_prices WHERE car_id = ANY($1)',
        [carIds]
      ),
    ]);

    return carsResult.rows.map(row =>
      carMapper.toDomain(
        row,
        imagesResult.rows.filter(img => img.parent_id === row.id),
        pricesResult.rows.filter(p => p.car_id === row.id)
      )
    );
  }

  async findById(id: string): Promise<CarEntity | null> {
    const carResult = await this.pool.query(
      'SELECT * FROM cars WHERE id = $1',
      [id]
    );

    if (carResult.rows.length === 0) return null;

    const row = carResult.rows[0];
    const [imagesResult, pricesResult] = await Promise.all([
      this.pool.query(
        `SELECT * FROM images WHERE parent_type = 'car' AND parent_id = $1`,
        [id]
      ),
      this.pool.query(
        'SELECT * FROM car_prices WHERE car_id = $1',
        [id]
      ),
    ]);

    return carMapper.toDomain(row, imagesResult.rows, pricesResult.rows);
  }

  async create(car: Omit<CarEntity, 'id'>): Promise<CarEntity> {
    const result = await this.pool.query(
      `INSERT INTO cars (
        name, brand, description, drive_type, type, url,
        acceleration, power, color, interior_trim, status,
        engine_type, engine_capacity, engine_fuel_cons
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *`,
      [
        car.name, car.brand, car.description, car.driveType,
        car.type, car.url, car.acceleration, car.power,
        car.color, car.interiorTrim, car.status,
        car.engine.type, car.engine.capacity, car.engine.fuel_consumption,
      ]
    );

    return carMapper.toDomain(result.rows[0], [], []);
  }

  // ... update, delete, findByBrand, findByStatus аналогично
}
```

#### 3.6 NPM-зависимости (добавить)

```bash
npm install pg node-pg-migrate
npm install -D @types/pg
```

### 4. Application слой — Use Cases (создать)

Use Cases оркестрируют бизнес-логику. Зависят **только** от Domain (Entities, Ports). Не знают о `pg`, SQL или конкретных репозиториях.

```
apps/backend/src/application/
├── use-cases/
│   ├── car/
│   │   ├── get-all-cars.use-case.ts
│   │   ├── get-car-by-id.use-case.ts
│   │   ├── create-car.use-case.ts
│   │   ├── update-car.use-case.ts
│   │   └── delete-car.use-case.ts
│   ├── user/
│   │   ├── get-user-by-id.use-case.ts
│   │   ├── create-user.use-case.ts
│   │   └── ...
│   ├── country/
│   ├── tariff/
│   ├── credit/
│   └── car-page/
├── dto/
│   ├── car.dto.ts
│   ├── user.dto.ts
│   ├── country.dto.ts
│   ├── tariff.dto.ts
│   ├── credit.dto.ts
│   └── car-page.dto.ts
└── mappers/
    ├── car-dto.mapper.ts               ← Domain Entity ↔ DTO
    ├── user-dto.mapper.ts
    └── ...
```

**Пример Use Case:**

```typescript
// apps/backend/src/application/use-cases/car/get-all-cars.use-case.ts
import { CarRepository } from 'domain';
import { CarEntity } from 'domain';

export class GetAllCarsUseCase {
  constructor(private carRepository: CarRepository) {}

  async execute(): Promise<CarEntity[]> {
    return this.carRepository.findAll();
  }
}
```

### 5. Presentation слой — подключение (Fastify + DI)

Подключить реальные репозитории вместо моков. DI — через ручной composition root в `main.js` (без DI-фреймворков, Fastify не требует контейнера).

```
apps/backend/src/
├── main.ts                              ← composition root
├── infrastructure/
│   └── create-repositories.ts           ← фабрика репозиториев
├── application/
│   └── ...                              ← use cases (см. выше)
├── endpoints/
│   ├── car.ts                           ← Fastify routes для /cars
│   ├── user.ts
│   └── ...
└── domain/
    └── services/                        ← оставить для domain services
```

**Composition Root (`main.ts`):**

```typescript
import { pool } from 'database';
import { PgCarRepository, PgUserRepository, ... } from 'database';
import { GetAllCarsUseCase, GetCarByIdUseCase } from './application/use-cases/car';

// 1. Infrastructure — конкретные реализации
const carRepository = new PgCarRepository(pool);
const userRepository = new PgUserRepository(pool);

// 2. Application — use cases с инъекцией портов
const getAllCars = new GetAllCarsUseCase(carRepository);
const getCarById = new GetCarByIdUseCase(carRepository);

// 3. Presentation — endpoints используют use cases
const endpointMap = {
  cars: createCarEndpoints({ getAllCars, getCarById }),
  users: createUserEndpoints({ ... }),
};

runServer({ port, host, endpointMap });
```

---

## Несоответствия доменной модели (требуют обновления перед реализацией)

Перед реализацией Infrastructure слоя необходимо синхронизировать Domain с новой схемой.

### 1. `CarEntity.price: Price` → `price: Price[]`

**Проблема:** Поле объявлено как единственное значение, но БД хранит цены для нескольких стран.

```typescript
// БЫЛО (libs/domain/src/entities/car.ts)
price: Price;

// ДОЛЖНО БЫТЬ
price: Price[];  // одна запись на каждую страну
```

### 2. `Option.creditId` — удалить

**Проблема:** Value Object `Option` содержит `creditId`, но в новой схеме `tariff_options` — это каталог опций тарифа (tariff × car × country), не привязанный к конкретному кредиту.

```typescript
// БЫЛО (libs/domain/src/value-object/option.ts)
export interface Option {
  name: string;
  price: number;
  carId: string;
  countryId: string;
  creditId: string;  // ← удалить
}

// ДОЛЖНО БЫТЬ
export interface Option {
  name: string;
  price: number;
  currency: string;  // ← добавить (соответствует tariff_options.currency)
  carId: string;
  countryId: string;
}
```

Связь «кредит → выбранные опции» реализуется через `credit.tariff.options` (навигация через TariffEntity), а не прямым FK.

### 3. `Image.parentType` — добавить

**Проблема:** VO `Image` не имеет поля `parentType`, а таблица `images` содержит `parent_type` для полиморфной связи.

```typescript
// БЫЛО (libs/domain/src/value-object/image.ts)
export interface Image {
  url: string;
  alt: string;
  width: number;
  height: number;
  parentId: string;
}

// ДОЛЖНО БЫТЬ
export interface Image {
  url: string;
  alt: string;
  width: number;
  height: number;
  parentId: string;
  parentType: 'car' | 'car_page_banner';  // ← добавить
}
```

---

## Порядок реализации

```
Шаг 1. Зависимости    → npm install pg node-pg-migrate @types/pg
Шаг 2. Domain          → Port-интерфейсы (абстрактные репозитории)
Шаг 3. Infra: database → Nx lib + Pool + Row-типы
Шаг 4. Infra: миграции → SQL-файлы миграций + runner
Шаг 5. Infra: mappers  → SQL Row → Domain Entity
Шаг 6. Infra: repos    → PgXxxRepository implements XxxRepository
Шаг 7. Application     → Use Cases + DTOs
Шаг 8. Presentation    → Composition root + endpoints
```

**Рекомендуемый первый вертикальный срез:**

Реализовать полный цикл для одной сущности (`Car`) — от порта до endpoint'а — и убедиться, что всё работает. Затем масштабировать на остальные сущности по аналогии.

```
Car: Port → Migration → Row type → Mapper → PgRepository → UseCase → Endpoint
```
