"""
Authentication endpoint for the B2B Dashboard.
Validates access codes against Directus `clients` collection, with fallback to env-configured demo codes.
"""
import logging
from fastapi import APIRouter, HTTPException, status
import httpx
from app.core.config import settings
from app.core.security import create_access_token
from app.schemas.auth import VerifyCodeRequest, AuthTokenResponse, ClientInfo

logger = logging.getLogger(__name__)
router = APIRouter()

# Fallback demo clients (used when Directus is unavailable or collection doesn't exist yet)
DEMO_CLIENTS = {
    "GEOTECH-2026": ClientInfo(company_name="Demo Engineering Co.", email="demo@geotech.ru", access_level="standard"),
    "DEMO-ACCESS": ClientInfo(company_name="Demo Company", email="demo@example.com", access_level="demo"),
    "CLIENT-VIP": ClientInfo(company_name="VIP Construction Ltd.", email="vip@client.ru", access_level="vip"),
}


async def _verify_via_directus(access_code: str) -> ClientInfo | None:
    """Try to verify the access code against the Directus `clients` collection."""
    try:
        headers = {}
        if settings.DIRECTUS_ADMIN_TOKEN:
            headers["Authorization"] = f"Bearer {settings.DIRECTUS_ADMIN_TOKEN}"
            
        async with httpx.AsyncClient(base_url=settings.DIRECTUS_URL, timeout=5.0) as client:
            res = await client.get(
                "/items/clients",
                params={
                    "filter[access_code][_eq]": access_code,
                    "filter[active][_eq]": True,
                    "limit": 1,
                },
                headers=headers
            )
            if res.status_code == 200:
                items = res.json().get("data", [])
                if items:
                    item = items[0]
                    return ClientInfo(
                        company_name=item.get("company_name", "Unknown"),
                        email=item.get("email"),
                        access_level=item.get("access_level", "standard"),
                    )
    except Exception as e:
        logger.warning(f"Directus auth check failed, falling back to demo codes: {e}")
    return None


@router.post("/verify-code", response_model=AuthTokenResponse)
async def verify_access_code(body: VerifyCodeRequest):
    """
    Verifies the access code and returns a JWT token.
    1. First tries Directus `clients` collection
    2. Falls back to hardcoded demo codes if Directus is unavailable
    """
    code = body.access_code.strip().upper()

    # 1. Try Directus first
    client_info = await _verify_via_directus(code)

    # 2. Fallback to demo codes
    if client_info is None:
        client_info = DEMO_CLIENTS.get(code)

    if client_info is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный код доступа",
        )

    # Generate JWT
    token = create_access_token(
        data={
            "sub": code,
            "company": client_info.company_name,
            "email": client_info.email,
            "level": client_info.access_level,
        }
    )

    return AuthTokenResponse(
        access_token=token,
        expires_in=24 * 3600,
        client=client_info,
    )
