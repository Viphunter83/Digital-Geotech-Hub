import httpx
import logging
from typing import List
from app.core.config import settings
from app.schemas.copilot import ShpuntInfo, MachineryInfo

logger = logging.getLogger(__name__)

async def fetch_matching_data(work_type: str, required_profile: str = None):
    """Fetch matching equipment from Directus. Returns empty lists on failure (no fake data)."""
    shpunts = []
    machinery = []
    
    async with httpx.AsyncClient(base_url=settings.DIRECTUS_URL, timeout=10.0) as client:
        # 1. Search for Shpunts
        if required_profile:
            try:
                params = {"filter[name][_contains]": required_profile}
                res = await client.get("/items/shpunts", params=params)
                if res.status_code == 200:
                    items = res.json().get("data", [])
                    for item in items:
                        shpunts.append(ShpuntInfo(
                            name=item.get("name"),
                            price=float(item.get("price") or 0),
                            stock=float(item.get("stock_quantity") or 0)
                        ))
            except Exception as e:
                logger.warning(f"Shpunt lookup failed: {e}")

        # 2. Search for Machinery
        try:
            m_params = {"filter[_or]": [
                {"name": {"_contains": work_type}},
                {"category": {"_contains": work_type}}
            ], "limit": 3}
            m_res = await client.get("/items/machinery", params=m_params)
            if m_res.status_code == 200:
                m_items = m_res.json().get("data", [])
                for m in m_items:
                    machinery.append(MachineryInfo(
                        id=str(m.get("id")),
                        name=m.get("name"),
                        description=m.get("status"),
                        category=m.get("category") or "Спецтехника"
                    ))
        except Exception as e:
            logger.warning(f"Machinery lookup failed: {e}")

    if not shpunts:
        logger.info("No shpunts found in Directus for profile: %s", required_profile)
    if not machinery:
        logger.info("No machinery found in Directus for work_type: %s", work_type)
            
    return shpunts, machinery

