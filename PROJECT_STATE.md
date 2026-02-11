# Project State: Digital Geotech Hub

## 🚀 Общий статус
**Стадия**: Прототип (MVP)
**Версия**: 0.1.0
**Последнее обновление**: 11.02.2026

## 🛠 Технологический стек
- **Frontend**: Next.js 15+ (App Router), Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: FastAPI (Python 3.14+).
- **CMS/DB**: Directus (Headless CMS) + PostgreSQL + Redis.
- **AI**: ProxyAPI (OpenAI/Anthropic) для парсинга документов.

## ✅ Реализовано (Proof of Concept)
### Infrastructure
- [x] Docker stack (Postgres, Directus, Redis).
- [x] Окружение `.env` и `.env.example`.
- [x] Git инициализация.

### Data Model (Directus)
- [x] Коллекции: `services`, `machinery`, `machinery_categories`, `cases`, `shpunts`.
- [x] M2M связи между техникой и кейсами.
- [x] Базовые поля и интерфейсы.

### Frontend
- [x] Дизайн-система (Outfit/Inter, industrial palette).
- [x] Hero-секция с анимациями.
- [x] Секция услуг и техники (карточки).
- [x] Smart Dropzone (UI-заглушка для AI).
- [x] Navbar & Footer.
- [x] Directus SDK Utility.

## 🔜 Актуальные задачи (Next Steps)
1. **AI Integration**:
   - Настройка эндпоинта в FastAPI для приема файлов из Dropzone.
   - Подключение ProxyAPI для парсинга PDF/Excel.
   - Маппинг данных из AI в структуру контракта.
2. **Dynamic Data**:
   - Замена статических данных во фронтенде на реальные запросы к Directus API.
   - Настройка типизации для всех коллекций.
3. **Admin UI Polish**:
   - Настройка ролей (Менеджеры, Сметчики) в Directus.
   - Создание кастомных дашбордов.

## 📝 Важные инструкции
### Запуск проекта
```bash
# Инфраструктура
docker-compose up -d

# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
```

### URL-адреса
- **Frontend**: `http://localhost:3000`
- **Directus Admin**: `http://localhost:8055` (admin@geotech.hub / geotech-hub-2026)
- **FastAPI Docs**: `http://localhost:8000/docs`

## 🎨 Дизайн-принципы
- **Сетка**: 12-колончатая container-based.
- **Цвета**: 
  - Primary: `#0F172A` (Slate 900)
  - Accent: `#F97316` (Orange 500)
  - Background: White / Gray 50
- **Стиль**: Технический минимализм, использование микро-анимаций (Framer Motion).
