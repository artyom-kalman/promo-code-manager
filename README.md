# PromoCode Manager

## Использование ИИ-агентов

Проект был создан с использованием ИИ-агента (Claude Code). Не вижу смысла этого отрицать. Я использую его в работе каждый день, так что посчитал справедливым использовать и здесь. Это не значит, что проект был полностью "завайбкожен". Я проводил ревью большей части кода и принимал архитектурные решения. Также ИИ помог мне ознакомиться с новыми для меня технологиями - MongoDB и ClickHouse. И часть реализации я писал сам, с целью практики и обучения.

Fullstack-приложение для управления промокодами с аналитикой, построенное на принципах CQRS.

## Технологический стек

| Слой | Технологии |
|------|-----------|
| Backend | NestJS, TypeScript, Mongoose, @clickhouse/client |
| Frontend | React, TypeScript, Mantine UI, TanStack Table + Query |
| Базы данных | MongoDB, ClickHouse, Redis |
| Инфраструктура | Docker Compose |

## Запуск

### Требования

- Docker и Docker Compose

### Запуск приложения

```bash
docker-compose up --build
```

После запуска:

- **Frontend:** http://localhost
- **Backend API:** http://localhost:3000
- **Swagger:** http://localhost:3000/api

Все сервисы (MongoDB, ClickHouse, Redis) имеют healthcheck-и — backend дождётся их готовности перед стартом.

## Архитектура

### CQRS: разделение записи и чтения

```
┌─────────────┐    CRUD     ┌──────────┐   sync-on-write   ┌────────────┐
│   Frontend  │ ──────────> │  MongoDB │ ────────────────> │ ClickHouse │
│             │             │ (запись)  │   (event-driven)  │  (чтение)  │
│  Таблицы <──│─────────────│──────────│────────────────────│────────────│
│  Формы   ──>│             │          │                    │            │
└─────────────┘             └──────────┘                    └────────────┘
```

- **MongoDB** — источник истины. Все мутации (создание, обновление, деактивация) проходят через Mongoose с валидацией.
- **ClickHouse** — аналитическое хранилище. Все таблицы на фронтенде читают данные только из ClickHouse, без обращений к MongoDB.
- **Redis** — кэширование аналитических запросов и distributed locks.

### Синхронизация MongoDB -> ClickHouse

Используется **sync-on-write** через event-driven подход:

1. Сервис выполняет мутацию в MongoDB
2. Генерируется событие через `@nestjs/event-emitter` (`USER_CHANGED`, `PROMOCODE_CHANGED`, `ORDER_CREATED`, `ORDER_PROMO_APPLIED`, `PROMO_USAGE_CREATED`)
3. `SyncListener` обрабатывает событие асинхронно и вызывает `SyncService`
4. `SyncService` вставляет/обновляет данные в ClickHouse с retry-логикой (3 попытки, exponential backoff)
5. После синхронизации инвалидируется кэш аналитики в Redis

Ошибки синхронизации не блокируют основную операцию — retry происходит в фоне.

### Таблицы в ClickHouse

| Таблица | Engine | Содержимое |
|---------|--------|-----------|
| `users` | ReplacingMergeTree(updated_at) | Данные пользователей: имя, email, телефон, статус, даты |
| `promocodes` | ReplacingMergeTree(updated_at) | Промокоды: код, скидка, лимиты, даты действия, статус |
| `orders` | ReplacingMergeTree(updated_at) | Заказы с денормализованными данными: user_name, user_email, promocode_code |
| `promo_usages` | MergeTree | История применений промокодов: user_name, user_email, promocode_code, сумма скидки |

`ReplacingMergeTree` используется для users, promocodes и orders, чтобы при обновлении записи (повторный INSERT с тем же `id`) ClickHouse сохранял только последнюю версию (по `updated_at`).

### Server-side таблицы на фронтенде

Все три аналитические таблицы (пользователи, промокоды, история использований) реализуют:

- **Server-side пагинацию** — параметры `page` и `pageSize` передаются в API, выбор размера страницы [10, 25, 50]
- **Server-side сортировку** — `sortBy` и `sortOrder` передаются в API, сортировка по всем колонкам
- **Server-side фильтрацию** — фильтры по колонкам (текст, число, enum) с debounce 500ms
- **Глобальный фильтр по датам** — `dateFrom` и `dateTo` с пресетами (Сегодня, 7 дней, 30 дней, Произвольный)

Используются TanStack Table (управление состоянием таблицы) и TanStack Query (data fetching с кэшированием и `keepPreviousData`).

### Redis

Два use-case:

1. **Distributed lock** — при применении промокода к заказу (`POST /orders/:id/apply-promocode`). Блокировки на уровне заказа и промокода (`SET key value EX ttl NX`), атомарное освобождение через Lua-скрипт. Предотвращает race condition при параллельных запросах.

2. **Кэширование аналитики** — результаты запросов к ClickHouse кэшируются с TTL 30 секунд. При мутациях кэш инвалидируется по префиксу (`analytics:users:*`, `analytics:promocodes:*`, `analytics:promo-usages:*`).

### Основные data flow

**Создание заказа и применение промокода:**

1. `POST /orders` — создание заказа (сумма привязывается к текущему пользователю из JWT) -> MongoDB -> событие -> ClickHouse
2. `POST /orders/:id/apply-promocode` — валидация (активность, лимиты, сроки, не применён ранее) -> distributed lock -> обновление заказа + создание записи использования -> MongoDB -> событие -> ClickHouse

**Аналитическая таблица:**

1. Frontend запрашивает `GET /analytics/users?page=1&pageSize=10&sortBy=total_spent&dateFrom=...`
2. Backend проверяет Redis-кэш. При промахе — выполняет запрос к ClickHouse с JOIN/GROUP BY
3. Результат кэшируется в Redis и возвращается клиенту — без обращений к MongoDB
