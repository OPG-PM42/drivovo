---
name: repository-builder
description: >
  Генератор репозиториев для Nx-монорепозитория Drivovo.
  Создаёт репозитории по установленному паттерну: table types + mappers в infrastructure/database/tables/,
  repository в repositories/, с Kysely, RepositoryError и object literal singleton.
  Используй когда нужно: (1) создать новый репозиторий для entity, (2) добавить CRUD для таблицы,
  (3) создать маппинг Entity ↔ Table, (4) создать PG VIEW для сложных JOIN-ов.
  Активируй при упоминании "репозиторий", "repository", "CRUD для", "маппер для таблицы".
---

# Repository Builder

Генератор репозиториев для бэкенда Drivovo. Следует установленным паттернам проекта.

## Архитектура

```
apps/backend/src/
├── repositories/
│   ├── repository.ts              # Базовый интерфейс Repository<E, P> + SearchParams<T>
│   └── <entity>.repository.ts     # Конкретные репозитории (object literal + satisfies)
└── infrastructure/database/
    ├── index.ts                   # Kysely singleton + Database interface + реэкспорт tables
    ├── errors.ts                  # RepositoryError + PG_ERROR_MAP + DATABASE_ERRORS
    ├── migrations/                # Kysely миграции (таблицы, индексы, VIEW)
    └── tables/
        ├── index.ts               # Barrel export
        └── <entity>.ts            # Table type + View type (если есть) + create*Entity + create*Table + create*Updates
```

## Паттерн: Table файл (`tables/<entity>.ts`)

Каждый table-файл содержит: тип таблицы, маппинг, и (опционально) интерфейс VIEW.
Query building НЕ живёт в table-файле — оно в репозитории.

### Структура файла

```typescript
import type { Generated, Selectable, Insertable, Updateable } from 'kysely';
import type { XxxEntity } from '@drivovo/domain';

// 1. Экспортируемые типы для PostgreSQL enums (export чтобы переиспользовать в VIEW)
export type SomeStatus = 'active' | 'inactive';

// 2. Интерфейс таблицы (snake_case, Kysely типы)
export interface XxxTable {
  id: Generated<string>;           // UUID, gen_random_uuid()
  name: string;
  status: ColumnType<SomeStatus, SomeStatus | undefined, SomeStatus | undefined>;
  some_nullable: string | null;
  json_field: JSONColumnType<SomeJson[]>;
  created_at: ColumnType<Date, Date | undefined, Date | undefined>;
}

// 3. (Опционально) Интерфейс VIEW для сложных JOIN-ов
//    Все поля — SELECT-only типы, без Generated/ColumnType обёрток
export interface XxxEntityView {
  xxx_id: string;
  xxx_name: string;
  related_field: string | null;     // nullable из-за LEFT JOIN
  json_field: SomeJson[];           // JSONB → plain JS type
}

type XxxRow = Selectable<XxxEntityView>;  // или Selectable<XxxTable> если без VIEW

// 4. createXxxEntity — DB row → Domain Entity
export function createXxxEntity(row: XxxRow): XxxEntity {
  return {
    id: row.xxx_id,
    name: row.xxx_name,
    someNullable: row.some_nullable ?? '',  // null → default
    // Вложенные объекты: row.engine_type → entity.engine.type
    // JSONB массивы: (row.images ?? []).map(createImage)
  };
}

// 5. createXxxTable — Domain Entity → DB row (для INSERT)
export function createXxxTable(entity: XxxEntity): Insertable<XxxTable> {
  return {
    id: entity.id,
    name: entity.name,
    some_nullable: entity.someNullable || null,  // '' → null
    // JSONB: JSON.stringify(entity.images.map(createImageJson))
  };
}

// 6. createXxxUpdates — Partial<Entity> → Partial<Table> (для UPDATE)
export function createXxxUpdates(entity: Partial<XxxEntity>): Updateable<XxxTable> {
  const props = {
    name: entity.name,
    some_nullable: entity.someNullable,
    // Вложенные: engine_type: entity.engine?.type
    // JSONB: images: entity.images ? JSON.stringify(...) : undefined
  };
  const result: Record<string, string | number | null> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) result[key] = value;
  }
  return result;
}
```

## Паттерн: Repository файл (`repositories/<entity>.repository.ts`)

Репозиторий — object literal с `satisfies`, НЕ класс. Singleton через модульную систему.
Query building живёт в репозитории, используя `$if` для условной сортировки/пагинации.

### Структура файла

```typescript
import type { XxxEntity } from "@drivovo/domain";
import db from "../infrastructure/database";
import {
  createXxxTable,
  createXxxUpdates,
  createXxxEntity,
} from "../infrastructure/database/tables";
import type { Repository, SearchParams } from "./repository";
import { DATABASE_ERRORS, RepositoryError } from "../infrastructure/database/errors";

// SORT_FIELD_MAP живёт в репозитории, as const для type safety
const SORT_FIELD_MAP = {
  name: 'name',
  status: 'status',
} as const;

type XxxSearchParams = SearchParams<'name' | 'status'>;
interface XxxRepository extends Repository<XxxEntity, XxxSearchParams> {}

export default {
  async find(params: XxxSearchParams): Promise<XxxEntity[]> {
    try {
      const rows = await db
        .selectFrom('xxx_table')       // или 'xxx_entity_view' для VIEW
        .selectAll()
        .$if(Boolean(params?.sortField && SORT_FIELD_MAP[params.sortField!]), (query) =>
          query.orderBy(SORT_FIELD_MAP[params.sortField!], params.sortOrder),
        )
        .$if(Boolean(params?.limit), (query) => query.limit(params.limit!))
        .$if(Boolean(params?.offset), (query) => query.offset(params.offset!))
        .execute();

      return rows.map(createXxxEntity);
    } catch (error) {
      throw RepositoryError.create(error);
    }
  },

  async findOne(id: string): Promise<XxxEntity> {
    try {
      const row = await db
        .selectFrom('xxx_table')       // или 'xxx_entity_view' для VIEW
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirstOrThrow(() =>
          new RepositoryError(
            DATABASE_ERRORS.NOT_FOUND_ERROR,
            `Xxx with id ${id} not found`
          )
        );

      return createXxxEntity(row);
    } catch (error) {
      throw RepositoryError.create(error);
    }
  },

  async insert(entity: XxxEntity): Promise<string> {
    try {
      const result = await db
        .insertInto('xxx_table')       // INSERT всегда в таблицу, не во VIEW
        .values(createXxxTable(entity))
        .returning('id')
        .executeTakeFirstOrThrow();
      return result.id;
    } catch (error) {
      throw RepositoryError.create(error);
    }
  },

  async update(entity: Partial<XxxEntity> & { id: string }): Promise<void> {
    try {
      const updates = createXxxUpdates(entity);
      if (Object.keys(updates).length > 0) {
        await db
          .updateTable('xxx_table')    // UPDATE всегда в таблицу, не во VIEW
          .set(updates)
          .where('id', '=', entity.id)
          .execute();
      }
    } catch (error) {
      throw RepositoryError.create(error);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await db
        .deleteFrom('xxx_table')       // DELETE всегда из таблицы, не из VIEW
        .where('id', '=', id)
        .execute();
    } catch (error) {
      throw RepositoryError.create(error);
    }
  },
} satisfies XxxRepository;
```

## Паттерн: PG VIEW (для сложных JOIN-ов)

Когда entity требует JOIN нескольких таблиц для чтения, используй PostgreSQL VIEW вместо inline query builder.

### Когда использовать VIEW
- Entity собирается из 2+ таблиц (JOIN-ы)
- Один и тот же JOIN используется в `find()` и `findOne()`

### Когда НЕ использовать VIEW
- Простой SELECT из одной таблицы — запрос строится inline в репозитории

### Структура

1. **Миграция** — `CREATE OR REPLACE VIEW` в `0001_initial_schema.ts` (или новой миграции)
2. **View interface** — в том же table-файле, SELECT-only типы
3. **Database interface** — зарегистрировать VIEW: `xxx_entity_view: XxxEntityView`
4. **Repository** — `find`/`findOne` читают из VIEW, `insert`/`update`/`delete` пишут в таблицу

Пример VIEW миграции:
```typescript
await sql`
  CREATE OR REPLACE VIEW xxx_entity_view AS
  SELECT
    x.id AS xxx_id,
    x.name AS xxx_name,
    r.field AS related_field
  FROM xxx_table x
  INNER JOIN related r ON r.id = x.related_id
`.execute(db);
```

## Правила

### Именование
- Table interface: `XxxTable` (CarsTable, UsersTable, CarPagesTable)
- View interface: `XxxEntityView` (CarPageEntityView)
- Функции маппинга: `createXxxEntity`, `createXxxTable`, `createXxxUpdates`
- Sort map: `SORT_FIELD_MAP` (`as const`, живёт в репозитории)
- Search params: `type XxxSearchParams = SearchParams<'field1' | 'field2'>`
- Repository interface: `XxxRepository extends Repository<XxxEntity, XxxSearchParams>`
- Файлы: kebab-case (`car-page.ts`, `page.repository.ts`)
- PostgreSQL enums: `export type` в table-файле для переиспользования

### Маппинг Entity ↔ Table
- DB snake_case → Entity camelCase: `row.interior_trim → entity.interiorTrim`
- null → default: `row.field ?? ''` (или `?? 0`, `?? []`)
- Entity → DB null: `entity.field || null`
- Вложенные объекты (engine, seo, availability) раскрываются в плоские колонки
- JSONB массивы: `JSON.stringify(items.map(createItemJson))` / `(row.items ?? []).map(createItem)`

### createUpdates паттерн
- Собрать объект `props` с маппингом camelCase → snake_case
- Для вложенных: optional chaining (`entity.engine?.type`)
- Для JSONB: тернарник (`entity.images ? JSON.stringify(...) : undefined`)
- Цикл `Object.entries` + фильтрация `undefined`

### Query building
- Запросы строятся inline в репозитории, НЕ в table-файле
- Используй `$if` с `Boolean()` для условной сортировки/пагинации
- НЕ используй `!!` — используй `Boolean()`
- НЕ используй мутабельные `let query` + `if` — используй chainable `$if`

### Ошибки
- ВСЕ методы обёрнуты в `try/catch` → `throw RepositoryError.create(error)`
- `RepositoryError.create()` пробрасывает `RepositoryError` как есть (без повторной обёртки)
- `RepositoryError` маппит pg-коды в абстрактные `DATABASE_ERRORS`
- `findOne` использует `executeTakeFirstOrThrow` с `new RepositoryError(DATABASE_ERRORS.NOT_FOUND_ERROR, message)`

### Что НЕ делать
- НЕ использовать class для репозитория — только object literal + `satisfies`
- НЕ создавать `createXxxQuery` в table-файлах — query building живёт в репозитории
- НЕ хранить типы в отдельном types.ts — тип таблицы живёт в table-файле
- НЕ мутировать данные в других таблицах — репозиторий управляет только своей таблицей
- НЕ импортировать `RepositoryError` в table-файлы — только в repository
- НЕ использовать `new Error()` в `executeTakeFirstOrThrow` — использовать `new RepositoryError(DATABASE_ERRORS.NOT_FOUND_ERROR, ...)`

## Чеклист при создании нового репозитория

1. [ ] Создать/обновить table-файл в `infrastructure/database/tables/<entity>.ts`
2. [ ] Экспортировать из `tables/index.ts`
3. [ ] Добавить таблицу (и VIEW если есть) в `Database` interface в `infrastructure/database/index.ts`
4. [ ] Если нужен VIEW — добавить миграцию с `CREATE OR REPLACE VIEW`
5. [ ] Создать `repositories/<entity>.repository.ts` с `$if` query building
6. [ ] Убедиться что entity существует в `libs/domain/src/entities/`
7. [ ] `npx nx build backend` — сборка без ошибок
