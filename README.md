# Drivovo

Nx-монорепозиторий на базе Next.js 16 и React 19 с архитектурой Clean Architecture / DDD. В рамках курсах по паттернам Метархии.

## Технологический стек

### Frontend
- **Монорепозиторий:** Nx 22.5
- **Фреймворк:** Next.js 16 (App Router)
- **UI:** React 19
- **Язык:** TypeScript 5.6 (strict mode)
- **Стили:** Tailwind CSS 3.4
- **Линтинг:** ESLint 9 + Prettier

### Backend
- **Фреймворк:** Fastify 5
- **База данных:** PostgreSQL 16
- **ORM:** Нативный PostgreSQL клиент (@fastify/postgres)
- **Язык:** TypeScript 5.6 (strict mode)

## Структура проекта

```
drivovo/
├── apps/
│   ├── web/              # Next.js фронтенд приложение
│   └── api/              # Fastify бэкенд API
│       ├── src/
│       │   ├── config/   # Конфигурация
│       │   ├── plugins/  # Fastify плагины (БД, и др.)
│       │   ├── routes/   # API маршруты
│       │   └── main.ts   # Точка входа
│       ├── database/     # SQL скрипты
│       └── README.md     # Документация API
├── .env.example          # Пример переменных окружения
├── .env                  # Локальные переменные окружения
└── docker-compose.yml    # Docker конфигурация для PostgreSQL
```

## Локальная установка и настройка

1. Версия Node: >=18.10.0

2. Установка зависимостей:

```shell
npm ci
```

3. Настройка переменных окружения:

```shell
# Скопируйте .env.example в .env и настройте параметры
cp .env.example .env
```

4. Запуск PostgreSQL (требуется Docker):

```shell
docker-compose up -d
```

База данных будет инициализирована автоматически с примерами данных.

5. Запуск проектов:

```shell
# Только фронтенд (http://localhost:3000)
npm run dev

# Только API (http://localhost:3001)
npm run dev:api

# Фронтенд и API одновременно
npm run dev:all
```

6. Сборка проектов в production режиме:

```shell
# Только фронтенд
npm run build

# Только API
npm run build:api

# Все проекты
npm run build:all
```

7. Запуск production серверов:

```shell
# Фронтенд
npm run start

# API
npm run start:api
```

8. Линтинг:

```shell
npm run lint
```

9. Форматирование кода:

```shell
npm run format
npm run format:check
```

## API Документация

Подробная документация по API доступна в [apps/api/README.md](apps/api/README.md).

### Основные эндпоинты

- `GET /api/health` - Проверка состояния сервера
- `GET /api/health/db` - Проверка подключения к БД
- `GET /api/users` - Получить список пользователей
- `POST /api/users` - Создать пользователя
- `GET /api/users/:id` - Получить пользователя по ID
- `PUT /api/users/:id` - Обновить пользователя
- `DELETE /api/users/:id` - Удалить пользователя

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
