# Drivovo

Nx-монорепозиторий на базе Next.js 16 и React 19 с архитектурой Clean Architecture / DDD. В рамках курсах по паттернам Метархии.

## Технологический стек

- **Монорепозиторий:** Nx 22.5
- **Фреймворк:** Next.js 16 (App Router)
- **UI:** React 19
- **Язык:** TypeScript 5.6 (strict mode)
- **Стили:** Tailwind CSS 3.4
- **Линтинг:** ESLint 9 + Prettier

## Запуск проекта

### Первый запуск

```shell
npm ci
cp .env.example .env          # при необходимости отредактируйте переменные
docker compose up db -d        # поднять PostgreSQL
npm run migrate                # создать схему БД
docker compose exec -T db psql -U drivovo -d drivovo < apps/backend/src/utils/seed/seed.sql  # загрузить seed-данные
```

### Последующие запуски

```shell
docker compose up db -d        # поднять PostgreSQL (если остановлен)
npm run migrate                # применить новые миграции (если есть)
```

### Запуск всех сервисов через Docker

```shell
docker compose up -d           # backend + web + admin + db
```

Или по отдельности:

```shell
docker compose up db -d
npm run dev                    # web на http://localhost:3000
npm run dev:backend            # backend на http://localhost:5000
npm run dev:admin              # admin на http://localhost:4200
```

### Миграции БД

```shell
npm run migrate                # применить все pending-миграции
npm run migrate:up             # одна миграция вверх
npm run migrate:down           # одна миграция вниз (откат)
npm run migrate:status         # статус всех миграций
npm run migrate:create -- name # создать новый файл миграции
```

Миграции находятся в `apps/backend/src/infrastructure/database/migrations/`.

### Seed-данные

Seed-данные загружаются вручную и нужны только при первом запуске или после полного сброса БД:

```shell
docker compose exec -T db psql -U drivovo -d drivovo < apps/backend/src/utils/seed/seed.sql
```

### Полный сброс БД

```shell
docker compose down -v         # удалить контейнер и volume
docker compose up db -d
npm run migrate
docker compose exec -T db psql -U drivovo -d drivovo < apps/backend/src/utils/seed/seed.sql
```

### Сборка и запуск

```shell
npm run build                  # сборка production
npm run start                  # запуск production сервера
```

### Линтинг и форматирование

```shell
npm run lint
npm run format
npm run format:check
```

## Соглашения по разработке

- комментарии в коде и документацию пишем на русском/английском;
- сообщения к коммитам пишем на английском;
- при создании pull request заголовок должен описывать кратко изменения в вашей ветке;
- если в рабочей ветке много коммитов, при мерже ветки в main используйте squash;

## Именование

- Используйте `kebab-case` для имён файлов (пример: `credit.service.ts`, `car-page.ts`)
- Используйте `camelCase` для переменных и свойств (пример: `dateFormat`, `isActive`)
- Используйте `UPPER_SNAKE_CASE` для констант (пример: `BASE_URL`, `MAX_RETRY_COUNT`)
- Используйте `PascalCase` для типов, интерфейсов, enum и компонентов (пример: `CarEntity`, `CreditService`)
- Используйте суффикс `Entity` для доменных сущностей (пример: `CarEntity`), файл: `car.ts` в `domain/entities/`
- Используйте суффикс `Service` для сервисов (пример: `CreditService`), файл с суффиксом `.service.ts`
- Используйте суффикс `Repository` для репозиториев (пример: `CarRepository`), файл с суффиксом `.repository.ts`
- Используйте barrel exports (`index.ts`) для упрощения импортов

Пример структуры доменной сущности:

```text
domain/
├── entities/
│   ├── car.ts
│   ├── credit.ts
│   └── user.ts
├── services/
│   └── credit.service.ts
└── value-objects/
    └── image.ts
```

## Стиль кода

- Отступы: 2 пробела (настроено в Prettier)
- Используйте модификаторы доступа для свойств и методов классов
- Определяйте возвращаемое значение для каждой функции (enforced ESLint)
- Используйте строгие типы вместо `any` (enforced ESLint)
- Алиасы для импортов (см. секцию `paths` в `tsconfig.base.json`)
- Используйте следующий порядок для членов класса:

1. private поля
2. protected поля
3. public поля
4. constructors
5. public методы
6. protected методы
7. private методы

### React / Next.js

- Используйте функциональные компоненты
- Используйте React Server Components где это возможно
- Применяйте `use client` директиву только когда необходимо
- Применяйте lazy loading для тяжёлых компонентов (`next/dynamic`)
- Используйте `next/image` для оптимизации изображений
- Используйте `next/link` для навигации

### Общие принципы

- Применяйте принципы SOLID и чистого кода
- Избегайте глубокой вложенности (максимум 3-4 уровня)
- Используйте meaningful variable names (например, `isActive`, `hasPermission`)
- Применяйте immutability и pure functions где это возможно
- Предпочитайте композицию компонентов для модульности
- Избегайте использования `dangerouslySetInnerHTML` без санитизации
- Валидируйте все пользовательские данные

## Процесс разработки

1. Создайте issue с кратким описанием. Номер тикета будет сгенерирован автоматически

2. Создайте новую ветку: id тикета + краткое описание

```text
7-create-nx-monorepo
42-add-car-listing-page
```

3. Добавьте коммиты. Используйте следующий паттерн:

   #### Паттерн:

   `#номер_тикета [type] area: description`

   Где:
   - `#номер_тикета` — номер issue (например, #11)
   - `[type]` — тип изменения: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `ci`
   - `area` — область изменений: `core`, `web`, `domain`, `infra` и т.д.
   - `description` — краткое описание изменений

   #### Примеры:

```text
#7 [core] init nx monorepo
#11 [core] configure linting and rules
#42 [feat] web: add car listing page
#43 [fix] domain: fix credit calculation
#44 [refactor] web: extract car card component
```

4. Смержите последний `main` или ветку эпика в вашу ветку
5. Запустите линтинг и форматирование локально
6. Соберите проект локально в production режиме
7. Сделайте push коммитов в origin
8. Создайте pull request в `main` или ветку эпика
9. Обсудите и проверьте ваш код (нужно получить как минимум одно одобрение от другого разработчика)

## Инструменты разработки

- Применяйте ESLint и Prettier для качества кода
- Используйте Nx Console (расширение VSCode) для управления монорепозиторием
- Используйте Nx Graph (`npx nx graph`) для визуализации зависимостей

## Применение правил

- Все новые фичи, модули и компоненты должны разрабатываться с соблюдением установленных правил и стандартов
- Для существующего кода применение правил рекомендуется по возможности, если это не приводит к значительным затратам времени и не выходит за рамки задачи
- В случае если требуется масштабный рефакторинг старого кода, для этого должна заводиться отдельная задача
