#!/bin/bash

# start-demo.sh - Автоматизация запуска демо-среды (Apple Silicon / ARM64)

echo "🚀 Запуск Digital Geotech Hub Demo..."

# 1. Проверка Docker
if ! docker info > /dev/null 2>&1; then
    echo "❌ Ошибка: Docker не запущен. Пожалуйста, запустите Docker Desktop."
    exit 1
fi

# 2. Запуск контейнеров (Directus, Postgres, Redis)
echo "📦 Запуск базы данных и CMS..."
docker compose up -d

# 3. Ожидание готовности Directus (порт 8055)
echo "⏳ Ожидание Directus..."
while ! nc -z localhost 8055; do   
  sleep 1
done
echo "✅ Directus готов!"

# 4. Запуск Backend (FastAPI) в фоновом режиме
echo "⚙️ Запуск Backend (FastAPI)..."
cd backend
source venv/bin/activate || python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# 5. Запуск Frontend (Next.js) в фоновом режиме
echo "🌐 Запуск Frontend (Next.js)..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

# 6. Запуск Cloudflare Tunnel
echo "🔗 Создание публичного туннеля через Cloudflare..."
echo "--------------------------------------------------"
cloudflared tunnel --url http://localhost:3000

# Завершение процессов при выходе
trap "kill $BACKEND_PID $FRONTEND_PID; echo 'Stopping...'" EXIT
