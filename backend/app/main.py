from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.http_client import http_manager
from app.api.v1.endpoints import auth, dashboard, ai_copilot, leads

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize global HTTP client
    http_manager.start()
    yield
    # Shutdown: Close global HTTP client
    await http_manager.stop()

app = FastAPI(
    title="Digital Geotech Hub API",
    description="API for B2B platform of Geotechnologies",
    version="1.0.0",
    lifespan=lifespan,
)

# Dynamically set origins from settings
allowed_origins = [
    "http://localhost:3000",
    "https://geotech-hub.ru",
    "https://www.geotech-hub.ru",
]
if settings.FRONTEND_URL and settings.FRONTEND_URL not in allowed_origins:
    allowed_origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Auth"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["Dashboard"])
app.include_router(ai_copilot.router, prefix=f"{settings.API_V1_STR}/ai", tags=["AI Copilot"])
app.include_router(leads.router, prefix=f"{settings.API_V1_STR}/leads", tags=["Leads"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {"message": "Welcome to Digital Geotech Hub API"}
