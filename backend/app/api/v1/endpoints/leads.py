from fastapi import APIRouter, HTTPException
from app.schemas.copilot import LeadInput, LeadResponse
from app.services.amocrm import amocrm_service

router = APIRouter()

@router.post("/submit", response_model=LeadResponse)
async def submit_lead(lead_data: LeadInput):
    """
    Submits a lead from the frontend (Hero form or Audit capture).
    Integrates with AmoCRM to create a lead/deal.
    """
    try:
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
        raise HTTPException(status_code=500, detail=f"Ошибка при отправке заявки: {str(e)}")
