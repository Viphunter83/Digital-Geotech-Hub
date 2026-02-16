from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Digital Geotech Hub"
    API_V1_STR: str = "/api/v1"
    
    # CMS
    DIRECTUS_URL: str = "http://localhost:8055"
    DIRECTUS_ADMIN_TOKEN: Optional[str] = None
    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "admin-password"
    
    # ProxyAPI
    PROXY_API_KEY: Optional[str] = None
    PROXY_API_BASE_URL: str = "https://api.proxyapi.ru/openai/v1"

    # Infrastructure
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Auth
    JWT_SECRET: str = "change-me-in-production-geotech-hub-2026"
    
    # Frontend (for CORS)
    FRONTEND_URL: str = "http://localhost:3000"

    # Security/Optimization
    AUDIT_RATE_LIMIT: int = 5  # requests per hour
    MAX_FILE_SIZE_MB: int = 5

    # Email (SMTP)
    SMTP_HOST: str = "smtp.yandex.ru"
    SMTP_PORT: int = 465
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_NAME: str = "Digital Geotech Hub"
    SMTP_FROM_EMAIL: str = "noreply@geotech-hub.ru"
    EMAIL_ENABLED: bool = False  # Enable when SMTP credentials are set

    model_config = SettingsConfigDict(
        env_file=["../.env", ".env"],
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
