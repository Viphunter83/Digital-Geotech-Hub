import redis
from app.core.config import settings

# Initialize Redis client
# The REDIS_URL should be in format redis://host:port/db
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

def get_redis():
    return redis_client
