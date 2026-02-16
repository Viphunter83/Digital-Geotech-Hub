import logging
import httpx
from fastapi import APIRouter, HTTPException, Depends
from app.api.v1.endpoints.dashboard import _directus_get # Reuse helper if possible or keep local
from app.core.config import settings
from app.schemas.copilot import LeadInput, LeadResponse
from app.services.amocrm import amocrm_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/submit", response_model=LeadResponse)
async def submit_lead(lead_data: LeadInput):
    """
    Submits a lead from the frontend (Hero form or Audit capture).
    1. Saves the lead to Directus for local persistence and display.
    2. Integrates with AmoCRM to create a lead/deal.
    """
    try:
        # 1. Save to Directus
        headers = {}
        if settings.DIRECTUS_ADMIN_TOKEN:
            headers["Authorization"] = f"Bearer {settings.DIRECTUS_ADMIN_TOKEN}"
            
        async with httpx.AsyncClient(base_url=settings.DIRECTUS_URL, timeout=10.0) as cms_client:
            res = await cms_client.post(
                "/items/leads",
                json={
                    "name": lead_data.name,
                    "phone": lead_data.phone,
                    "email": lead_data.email,
                    "company": lead_data.company,
                    "audit_data": lead_data.audit_data,
                    "status": "new"
                },
                headers=headers
            )
            if res.status_code not in (200, 201, 204):
                logging.warning(f"Failed to save lead to Directus: {res.status_code} {res.text}")

        # 2. Call AmoCRM (or mock)
        lead_id = await amocrm_service.create_lead(
            name=lead_data.name,
            phone=lead_data.phone,
            email=lead_data.email,
            company=lead_data.company,
            audit_data=lead_data.audit_data
        )
        
        return LeadResponse(
            success=True,
            message="Заявка успешно отправлена. Наш инженер свяжется с вами в ближайшее время.",
            lead_id=lead_id
        )
    except Exception as e:
        logger.error(f"Error submitting lead: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка при отправке заявки: {str(e)}")
