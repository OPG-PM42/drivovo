# Drivovo API

Backend API для проекта Drivovo, построенный на Fastify с использованием PostgreSQL.

## Технологический стек

- **Fastify** - быстрый веб-фреймворк для Node.js
- **PostgreSQL** - реляционная база данных
- **TypeScript** - типизированный JavaScript
- **NX** - инструменты для монорепозитория

## Структура проекта

```
apps/api/
├── src/
│   ├── config/
│   │   └── env.ts           # Конфигурация окружения
│   ├── plugins/
│   │   └── database.ts      # Плагин подключения к PostgreSQL
│   ├── routes/
│   │   ├── health.ts        # Health check эндпоинты
│   │   └── users.ts         # CRUD операции с пользователями
│   └── main.ts              # Точка входа приложения
├── database/
│   └── init.sql             # SQL скрипт инициализации БД
└── README.md
```

## Настройка

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка PostgreSQL

Убедитесь, что PostgreSQL установлен и запущен. Создайте базу данных:

```bash
createdb drivovo
```

Инициализируйте базу данных:

```bash
psql -d drivovo -f apps/api/database/init.sql
```

### 3. Настройка переменных окружения

Скопируйте `.env.example` в `.env` и настройте параметры подключения:

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=drivovo

# API
API_PORT=3001
API_HOST=0.0.0.0

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## Запуск

### Режим разработки

```bash
# Только API
npm run dev:api

# API и фронтенд одновременно
npm run dev:all
```

API будет доступен по адресу: `http://localhost:3001`

### Production сборка

```bash
# Собрать API
npm run build:api

# Запустить production версию
npm run start:api
```

## API Endpoints

### Health Check

- `GET /api/health` - Статус сервера
- `GET /api/health/db` - Статус подключения к базе данных

### Users (CRUD)

- `GET /api/users` - Получить список всех пользователей
- `GET /api/users/:id` - Получить пользователя по ID
- `POST /api/users` - Создать нового пользователя
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com"
  }
  ```
- `PUT /api/users/:id` - Обновить пользователя
  ```json
  {
    "name": "John Updated",
    "email": "john.updated@example.com"
  }
  ```
- `DELETE /api/users/:id` - Удалить пользователя

### Root

- `GET /` - Информация об API и доступных эндпоинтах

## Особенности

### CORS

CORS настроен для работы с фронтендом. URL фронтенда задается через переменную окружения `FRONTEND_URL`.

### Логирование

Используется `pino` с `pino-pretty` для красивого вывода логов в режиме разработки.

### Graceful Shutdown

Сервер корректно обрабатывает сигналы `SIGTERM` и `SIGINT` для graceful shutdown.

### Типизация

Полная типизация TypeScript для всех роутов и моделей данных.

## Разработка

### Добавление новых роутов

1. Создайте файл в `apps/api/src/routes/`
2. Определите роуты используя Fastify plugin паттерн
3. Зарегистрируйте роуты в `apps/api/src/main.ts`

Пример:

```typescript
import { FastifyPluginAsync } from 'fastify';

const myRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/my-route', async (request, reply) => {
    return { message: 'Hello' };
  });
};

export default myRoutes;
```

### Работа с базой данных

Доступ к PostgreSQL осуществляется через `fastify.pg`:

```typescript
const client = await fastify.pg.connect();
const { rows } = await client.query('SELECT * FROM users');
client.release();
```

## Устранение неполадок

### Ошибка подключения к базе данных

- Убедитесь, что PostgreSQL запущен
- Проверьте настройки в `.env` файле
- Убедитесь, что база данных `drivovo` создана

### Порт уже используется

Измените `API_PORT` в `.env` файле на другой порт.
