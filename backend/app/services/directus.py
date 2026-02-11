import httpx
from typing import List
from app.core.config import settings
from app.schemas.copilot import ShpuntInfo, MachineryInfo

async def fetch_matching_data(work_type: str, required_profile: str = None):
    # Initialize both variables at the very beginning to avoid UnboundLocalError
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
                            price=float(item.get("price") or 0), # Note: Check if price actually exists in schema
                            stock=float(item.get("stock_quantity") or 0) # Fixed field name
                        ))
            except Exception:
                pass

        # 2. Search for Machinery
        try:
            # Better search: check both name and category
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
                        description=m.get("status"), # Using status as brief description if description field is missing
                        category=m.get("category") or "Спецтехника"
                    ))
        except Exception:
            pass
            
    # Fallback for Demo if DB is empty or fails (Crucial for presentation as per HANDOVER.md)
    if not shpunts:
        shpunts = [
            ShpuntInfo(name="Ларссен L5-UM", price=125000, stock=850),
            ShpuntInfo(name="Ларссен L4", price=118000, stock=1200)
        ]
    
    if not machinery:
        machinery = [
            MachineryInfo(id="m1", name="Giken Silent Piler F201", description="Установка для бесшумного статического вдавливания", category="Вдавливание"),
            MachineryInfo(id="m2", name="Bauer BG 28", description="Буровая установка для тяжелых грунтов", category="Бурение")
        ]
            
    return shpunts, machinery

