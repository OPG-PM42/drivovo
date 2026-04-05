---
name: repository-builder
description: >
  Генератор репозиториев для Nx-монорепозитория Drivovo.
  Создаёт репозитории по установленному паттерну: table types + mappers в infrastructure/database/tables/,
  repository в repositories/, с Kysely, RepositoryError и object literal singleton.
  Используй когда нужно: (1) создать новый репозиторий для entity, (2) добавить CRUD для таблицы,
  (3) создать маппинг Entity ↔ Table, (4) добавить query builder для entity.
  Активируй при упоминании "репозиторий", "repository", "CRUD для", "маппер для таблицы".
---

# Repository Builder

Генератор репозиториев для бэкенда Drivovo. Следует установленным паттернам проекта.

## Архитектура

```
apps/backend/src/
├── repositories/
│   ├── repository.ts              # Базовый интерфейс Repository<E>
│   └── <entity>.repository.ts     # Конкретные репозитории (object literal + satisfies)
└── infrastructure/database/
    ├── index.ts                   # Kysely singleton + Database interface + реэкспорт tables
    ├── errors.ts                  # RepositoryError + PG_ERROR_MAP
    └── tables/
        ├── index.ts               # Barrel export
        └── <entity>.ts            # Table type + create*Entity + create*Table + create*Updates + create*Query
```

## Паттерн: Table файл (`tables/<entity>.ts`)

Каждый table-файл содержит ВСЁ для одной таблицы: тип, маппинг, query builder.

### Структура файла

```typescript
import type { Generated, Selectable, Insertable, Updateable } from 'kysely';
import type { XxxEntity } from '@drivovo/domain';

// 1. Локальные типы для PostgreSQL enums
type SomeStatus = 'active' | 'inactive';

// 2. Интерфейс таблицы (snake_case, Kysely типы)
export interface XxxTable {
  id: Generated<string>;           // UUID, gen_random_uuid()
  name: string;
  status: ColumnType<SomeStatus, SomeStatus | undefined, SomeStatus | undefined>;
  some_nullable: string | null;
  json_field: JSONColumnType<SomeJson[]>;
  created_at: ColumnType<Date, Date | undefined, Date | undefined>;
}

// 3. createXxxEntity — DB row → Domain Entity
export function createXxxEntity(row: Selectable<XxxTable>): XxxEntity {
  return {
    id: row.id,
    name: row.name,
    someNullable: row.some_nullable ?? '',  // null → default
    // Вложенные объекты: row.engine_type → entity.engine.type
    // JSONB массивы: (row.images ?? []).map(createImage)
  };
}

// 4. createXxxTable — Domain Entity → DB row (для INSERT)
export function createXxxTable(entity: XxxEntity): Insertable<XxxTable> {
  return {
    id: entity.id,
    name: entity.name,
    some_nullable: entity.someNullable || null,  // '' → null
    // JSONB: JSON.stringify(entity.images.map(createImageJson))
  };
}

// 5. createXxxUpdates — Partial<Entity> → Partial<Table> (для UPDATE)
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

// 6. createXxxQuery — Query builder (если у entity есть репозиторий с find)
export function createXxxQuery(params?: SearchParams) {
  let query = db
    .selectFrom('xxx_table')
    .innerJoin(...)  // JOIN-ы при необходимости
    .select([...]);  // Алиасы при конфликтах имён

  if (params?.sortField && SORT_FIELD_MAP[params.sortField]) {
    query = query.orderBy(...);
  }
  if (params?.limit) query = query.limit(params.limit);
  if (params?.offset) query = query.offset(params.offset);

  return query;
}
```

## Паттерн: Repository файл (`repositories/<entity>.repository.ts`)

Репозиторий — object literal с `satisfies`, НЕ класс. Singleton через модульную систему.

### Структура файла

```typescript
import type { XxxEntity } from "@drivovo/domain";
import db from "../infrastructure/database";
import {
  createXxxTable,
  createXxxUpdates,
  createXxxQuery,
  createXxxEntity,
} from "../infrastructure/database/tables";
import type { Repository, SearchParams } from "./repository";
import { RepositoryError } from "../infrastructure/database/errors";

interface XxxRepository extends Repository<XxxEntity> {}

export default {
  async find(params: SearchParams): Promise<XxxEntity[]> {
    try {
      const rows = await createXxxQuery(params).execute();
      return rows.map(createXxxEntity);
    } catch (error) {
      throw RepositoryError.create(error);
    }
  },

  async findOne(id: string): Promise<XxxEntity> {
    try {
      const row = await createXxxQuery()
        .where('xxx_table.id', '=', id)
        .executeTakeFirstOrThrow(() => new Error(`Xxx with id ${id} not found`));
      return createXxxEntity(row);
    } catch (error) {
      throw RepositoryError.create(error);
    }
  },

  async insert(entity: XxxEntity): Promise<string> {
    try {
      const result = await db
        .insertInto('xxx_table')
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
          .updateTable('xxx_table')
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
        .deleteFrom('xxx_table')
        .where('id', '=', id)
        .execute();
    } catch (error) {
      throw RepositoryError.create(error);
    }
  },
} satisfies XxxRepository;
```

## Правила

### Именование
- Table interface: `XxxTable` (CarsTable, UsersTable, CarPagesTable)
- Функции маппинга: `createXxxEntity`, `createXxxTable`, `createXxxUpdates`
- Query builder: `createXxxQuery`
- Sort map: `SORT_FIELD_MAP` (приватный const, не экспортируется)
- Repository interface: `XxxRepository extends Repository<XxxEntity>`
- Файлы: kebab-case (`car-page.ts`, `page.repository.ts`)

### Маппинг Entity ↔ Table
- DB snake_case → Entity camelCase: `row.interior_trim → entity.interiorTrim`
- null → default: `row.field ?? ''` (или `?? 0`, `?? []`)
- Entity → DB null: `entity.field || null`
- Вложенные объекты (engine, seo, availability) раскрываются в плоские колонки
- JSONB массивы: `JSON.stringify(items.map(createItemJson))` / `(row.items ?? []).map(createItem)`
- PostgreSQL enums: дублировать как TypeScript type union в table-файле

### createUpdates паттерн
- Собрать объект `props` с маппингом camelCase → snake_case
- Для вложенных: optional chaining (`entity.engine?.type`)
- Для JSONB: тернарник (`entity.images ? JSON.stringify(...) : undefined`)
- Цикл `Object.entries` + фильтрация `undefined`

### Ошибки
- ВСЕ методы обёрнуты в `try/catch` → `throw RepositoryError.create(error)`
- `RepositoryError` маппит pg-коды в абстрактные `DATABASE_ERRORS`
- `findOne` использует `executeTakeFirstOrThrow` с кастомным сообщением

### Что НЕ делать
- НЕ использовать class для репозитория — только object literal + `satisfies`
- НЕ создавать отдельных подзапросов — один JOIN в query builder
- НЕ хранить типы в отдельном types.ts — тип таблицы живёт в table-файле
- НЕ мутировать данные в других таблицах — репозиторий управляет только своей таблицей и её value objects
- НЕ импортировать `RepositoryError` в table-файлы — только в repository

## Чеклист при создании нового репозитория

1. [ ] Создать/обновить table-файл в `infrastructure/database/tables/<entity>.ts`
2. [ ] Экспортировать из `tables/index.ts`
3. [ ] Добавить таблицу в `Database` interface в `infrastructure/database/index.ts`
4. [ ] Создать `repositories/<entity>.repository.ts`
5. [ ] Убедиться что entity существует в `libs/domain/src/entities/`
6. [ ] `npx nx build backend` — сборка без ошибок
