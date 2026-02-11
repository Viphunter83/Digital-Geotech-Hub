import httpx
from typing import List
from app.core.config import settings
from app.schemas.copilot import ShpuntInfo, MachineryInfo

async def fetch_matching_data(work_type: str, required_profile: str = None):
    async with httpx.AsyncClient(base_url=settings.DIRECTUS_URL) as client:
        # 1. Поиск шпунта
        shpunts = []
        if required_profile:
            # Маппинг коллекции 'products' (где категория шпунт) или специальной 'shpunts'
            # Судя по PROJECT_STATE, есть коллекция 'shpunts'
            params = {
                "filter[name][_contains]": required_profile
            }
            res = await client.get("/items/shpunts", params=params)
            if res.status_code == 200:
                items = res.json().get("data", [])
                for item in items:
                    shpunts.append(ShpuntInfo(
                        name=item.get("name"),
                        price=float(item.get("price") or 0),
                        stock=float(item.get("stock") or 0)
                    ))

        # 2. Поиск техники
        machinery = []
        # Фильтр по названию или описанию, связанному с типом работ
        m_params = {
            "filter[description][_contains]": work_type,
            "limit": 3
        }
        m_res = await client.get("/items/machinery", params=m_params)
        if m_res.status_code == 200:
            m_items = m_res.json().get("data", [])
            for m in m_items:
                machinery.append(MachineryInfo(
                    id=str(m.get("id")),
                    name=m.get("name"),
                    description=m.get("description"),
                    category="Спецтехника"
                ))
                
        return shpunts, machinery
