from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.copilot import DraftProposalResponse
from app.services.extractor import extract_text_from_file
from app.services.llm import parse_text_with_ai
from app.services.directus import fetch_matching_data

router = APIRouter()

@router.post("/parse-document", response_model=DraftProposalResponse)
async def parse_document(file: UploadFile = File(...)):
    """
    Endpoint for AI parsing of uploaded technical documents and matching with Directus data.
    """
    # 1. Extract text from PDF/Excel
    try:
        raw_text = await extract_text_from_file(file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error extracting text: {str(e)}")
    
    # 2. AI Parsing
    try:
        parsed_data = await parse_text_with_ai(raw_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI parsing failed: {str(e)}")
    
    # 3. Directus Lookup
    shpunts, machinery = await fetch_matching_data(
        work_type=parsed_data.work_type,
        required_profile=parsed_data.required_profile
    )
    
    # 4. Calculate Estimate (simplistic logic)
    estimated_total = 0
    if shpunts:
        estimated_total += shpunts[0].price * parsed_data.volume
    
    return DraftProposalResponse(
        parsed_data=parsed_data,
        matched_shpunts=shpunts,
        recommended_machinery=machinery,
        estimated_total=estimated_total
    )
