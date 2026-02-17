"""
Dashboard API endpoints.
Serves client-specific data (projects, overview, audit history) from Directus.
All endpoints require JWT authentication.
"""
import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
import httpx
from app.core.config import settings
from app.core.security import get_current_client
from app.core.http_client import http_manager

logger = logging.getLogger(__name__)
router = APIRouter()

async def _directus_get(path: str, params: Optional[Dict] = None) -> Optional[Any]:
    """Helper to fetch data from Directus."""
    headers = {}
    if settings.DIRECTUS_ADMIN_TOKEN:
        headers["Authorization"] = f"Bearer {settings.DIRECTUS_ADMIN_TOKEN}"

    async def _do_get():
        if not http_manager.client:
            # Fallback if lifecycle failing or in tests
            async with httpx.AsyncClient(base_url=settings.DIRECTUS_URL, timeout=10.0) as client:
                return await client.get(path, params=params or {}, headers=headers)
        return await http_manager.client.get(f"{settings.DIRECTUS_URL}{path}", params=params or {}, headers=headers)

    res = await _do_get()
    if res.status_code != 200:
        logger.warning(f"Directus GET {path} returned {res.status_code}: {res.text[:200]}")
        return None
    return res.json().get("data")


async def _get_client_id(access_code: str) -> Optional[int]:
    """Resolve access_code to client_id in Directus."""
    data = await _directus_get("/items/clients", {
        "filter[access_code][_eq]": access_code,
        "fields": "id",
        "limit": 1,
    })
    if data and len(data) > 0:
        return data[0].get("id")
    return None


@router.get("/overview")
async def get_overview(client: Dict = Depends(get_current_client)):
    """
    Dashboard overview: stats + recent activity.
    """
    access_code = client.get("sub")
    client_id = await _get_client_id(access_code)

    # Defaults
    stats = {
        "active_projects": 0,
        "total_audits": 0,
        "completed_projects": 0,
        "company_name": client.get("company", "Клиент"),
    }
    recent_projects = []
    recent_audits = []

    if client_id:
        # Fetch projects
        projects = await _directus_get("/items/projects", {
            "filter[client_id][_eq]": client_id,
            "fields": "id,title,status,progress,location,work_type,start_date",
            "sort": "-date_created",
            "limit": 10,
        })
        if projects:
            stats["active_projects"] = sum(1 for p in projects if p.get("status") in ("in_progress", "planning"))
            stats["completed_projects"] = sum(1 for p in projects if p.get("status") == "completed")
            recent_projects = projects[:5]

        # Fetch audit history
        audits = await _directus_get("/items/audit_history", {
            "filter[client_id][_eq]": client_id,
            "fields": "id,filename,work_type,confidence_score,risks_count,estimated_total,date_created",
            "sort": "-date_created",
            "limit": 10,
        })
        if audits:
            stats["total_audits"] = len(audits)
            recent_audits = audits[:5]

    return {
        "stats": stats,
        "recent_projects": recent_projects,
        "recent_audits": recent_audits,
    }


@router.get("/projects")
async def get_projects(client: Dict = Depends(get_current_client)):
    """
    List all projects for the authenticated client.
    """
    access_code = client.get("sub")
    client_id = await _get_client_id(access_code)

    if not client_id:
        return {"projects": []}

    projects = await _directus_get("/items/projects", {
        "filter[client_id][_eq]": client_id,
        "fields": "id,title,description,status,location,progress,work_type,start_date,end_date,tags,date_created,photos.directus_files_id.id,photos.directus_files_id.filename_disk,documents.directus_files_id.id,documents.directus_files_id.filename_download,documents.directus_files_id.title,machinery_used.machinery_id.*",
        "sort": "-date_created",
    })

    return {"projects": projects or []}


@router.get("/audit-history")
async def get_audit_history(client: Dict = Depends(get_current_client)):
    """
    List audit history for the authenticated client.
    """
    access_code = client.get("sub")
    client_id = await _get_client_id(access_code)

    if not client_id:
        return {"audits": []}

    audits = await _directus_get("/items/audit_history", {
        "filter[client_id][_eq]": client_id,
        "fields": "id,filename,work_type,soil_type,volume,depth,confidence_score,risks_count,estimated_total,technical_summary,date_created",
        "sort": "-date_created",
    })

    return {"audits": audits or []}


@router.get("/profile")
async def get_profile(client: Dict = Depends(get_current_client)):
    """
    Get client profile info.
    """
    access_code = client.get("sub")
    data = await _directus_get("/items/clients", {
        "filter[access_code][_eq]": access_code,
        "fields": "id,company_name,email,phone,access_level,date_created",
        "limit": 1,
    })

    if data and len(data) > 0:
        return {"profile": data[0]}

    # Fallback from JWT
    return {
        "profile": {
            "company_name": client.get("company"),
            "email": client.get("email"),
            "access_level": client.get("level", "standard"),
        }
    }


@router.patch("/profile")
async def update_profile(
    updates: Dict[str, Any],
    client: Dict = Depends(get_current_client),
):
    """
    Update client profile (email, phone, company_name).
    Only allows safe fields.
    """
    access_code = client.get("sub")
    client_id = await _get_client_id(access_code)

    if not client_id:
        raise HTTPException(status_code=404, detail="Клиент не найден")

    allowed_fields = {"email", "phone", "company_name"}
    safe_updates = {k: v for k, v in updates.items() if k in allowed_fields}

    if not safe_updates:
        raise HTTPException(status_code=400, detail="Нет допустимых полей для обновления")

    headers = {}
    if settings.DIRECTUS_ADMIN_TOKEN:
        headers["Authorization"] = f"Bearer {settings.DIRECTUS_ADMIN_TOKEN}"
        
    if http_manager.client:
        res = await http_manager.client.patch(
            f"{settings.DIRECTUS_URL}/items/clients/{client_id}",
            json=safe_updates,
            headers=headers
        )
    else:
        async with httpx.AsyncClient(base_url=settings.DIRECTUS_URL, timeout=10.0) as http_client:
            res = await http_client.patch(
                f"/items/clients/{client_id}",
                json=safe_updates,
                headers=headers
            )
            
    if res.status_code != 200:
        raise HTTPException(status_code=500, detail="Ошибка обновления профиля")

    return {"success": True, "updated": safe_updates}
