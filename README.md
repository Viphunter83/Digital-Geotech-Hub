# Digital Geotech Hub

B2B-платформа для строительной компании «ГеоTechnologies».

## Структура проекта

- `frontend/` — Next.js 15+ (App Router, Tailwind CSS)
- `backend/` — FastAPI (Python 3.14.2, ProxyAPI integration)
- `cms/` — Directus (Headless CMS, PostgreSQL)
- `infrastructure/` — Docker configuration

## Быстрый старт

### 1. Инициализация переменных окружения
Скопируйте `.env.example` в `.env` и заполните необходимые ключи:
```bash
cp .env.example .env
```

### 2. Запуск инфраструктуры (Docker)
Убедитесь, что у вас установлен Docker. Запустите базу данных, Redis и Directus:
```bash
docker compose up -d
```
Directus будет доступен по адресу: [http://localhost:8055](http://localhost:8055)

### 3. Инициализация Git
(Уже выполнено при создании проекта)
```bash
git init
git add .
git commit -m "Initial commit: boilerplate & infra"
```

## Дизайн-система (Tailwind Configuration)

### Концепция: B2B-минимализм и техническая эстетика.

- **Палитра**:
  - `primary`: `#0F172A` (Slate-950) — глубина и надежность.
  - `accent`: `#F97316` (Orange-500) — акценты на технике и действиях (Safety Orange).
  - `bg-light`: `#F8FAFC` (Slate-50) — чистота и пространство.
  - `bg-dark`: `#020617` (Dark Blue) — премиальный темный режим.

- **Типографика**:
  - Заголовки: **Inter** или **Montserrat** (Геометрические, читаемые).
  - Контент: **Outfit** (Современный, премиальный).

- **Сетка и формы**:
  - Контейнерная верстка (12 колонок).
  - Скругления: `4px` (Small) — для сохранения "строгости" и "инженерного" вида.
  - Эффект: Тонкие границы (1px) и Hover-анимации для интерактивных элементов.

---
Разработано для «ГеоТехнологии» в Antigravity IDE (2026).
