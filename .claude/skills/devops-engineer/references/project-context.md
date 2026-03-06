# Контекст проекта Drivovo

## Стек

| Приложение | Фреймворк | Сборка | Выходная директория | Runtime |
|---|---|---|---|---|
| `apps/web` | Next.js 16 + React 19 | Next.js built-in | `dist/apps/web` | Node.js |
| `apps/admin` | Angular 21 | @angular/build:application | `dist/apps/admin/browser` | Static (Nginx) |
| `apps/backend` | Fastify 5 | esbuild (@nx/esbuild) | `dist/apps/backend` | Node.js |

## Shared-библиотеки

- `libs/domain` — доменные сущности и value objects, алиас `domain`

## Менеджер пакетов

- npm (lock-файл: `package-lock.json`)

## Nx

- Версия: 22.5.2
- `nx affected` — для инкрементальных билдов (только изменённые проекты)
- `nx run-many --target=build` — сборка всех проектов
- `nx build <app>` — сборка конкретного приложения

## Скрипты сборки (package.json)

```json
{
  "build": "nx build web",
  "build:admin": "nx build admin",
  "build:backend": "nx build backend",
  "lint": "eslint apps/web apps/admin",
  "format:check": "prettier --check ."
}
```

## Особенности сборки

### Backend (Fastify/esbuild)
- `generatePackageJson: true` — генерирует отдельный package.json в dist
- Формат: CommonJS
- Platform: node
- Точка входа: `dist/apps/backend/main.js`
- Нужен `npm install --production` в контейнере для зависимостей

### Admin (Angular)
- Статические файлы в `dist/apps/admin/browser/`
- Содержит `index.html` — SPA, нужен fallback на index.html в Nginx
- Output hashing включен (кэширование через Nginx)

### Web (Next.js)
- Standalone output в `dist/apps/web/`
- Запуск: `node dist/apps/web/server.js` (standalone mode)
- Порт по умолчанию: 3000

## Порты (рекомендация)

| Сервис | Порт |
|---|---|
| web (Next.js) | 3000 |
| admin (Nginx) | 80 |
| backend (Fastify) | 5000 |
