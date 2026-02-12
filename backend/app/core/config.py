from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Digital Geotech Hub"
    API_V1_STR: str = "/api/v1"
    
    # CMS
    DIRECTUS_URL: str = "http://localhost:8055"
    
    # ProxyAPI
    PROXY_API_KEY: Optional[str] = None
    PROXY_API_BASE_URL: str = "https://api.proxyapi.ru/openai/v1"

    # Infrastructure
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Security/Optimization
    AUDIT_RATE_LIMIT: int = 5  # requests per hour
    MAX_FILE_SIZE_MB: int = 5

    class Config:
        env_file = ["../.env", ".env"]
        case_sensitive = True
        extra = "ignore"

settings = Settings()
