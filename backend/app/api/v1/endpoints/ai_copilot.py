from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.copilot import DraftProposalResponse, ChatRequest, ChatResponse
from app.services.extractor import extract_text_from_file
from app.services.llm import parse_text_with_ai
from app.services.directus import fetch_matching_data

router = APIRouter()

@router.post("/parse-document", response_model=DraftProposalResponse)
async def parse_document(file: UploadFile = File(...)):
    """
    Endpoint for professional technical audit of uploaded documents.
    """
    # 1. Extract text from PDF/Excel
    try:
        raw_text = await extract_text_from_file(file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error extracting text: {str(e)}")
    
    # 2. AI Parsing & Technical Audit
    try:
        parsed_data, technical_summary, confidence_score = await parse_text_with_ai(raw_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI technical audit failed: {str(e)}")
    
    # 3. Directus Lookup
    shpunts, machinery = await fetch_matching_data(
        work_type=parsed_data.work_type,
        required_profile=parsed_data.required_profile
    )
    
    # 4. Calculate Estimate (simplistic logic)
    estimated_total = 0
    if shpunts and parsed_data.volume:
        estimated_total = shpunts[0].price * parsed_data.volume
    
    return DraftProposalResponse(
        parsed_data=parsed_data,
        technical_summary=technical_summary,
        matched_shpunts=shpunts,
        recommended_machinery=machinery,
        estimated_total=estimated_total if estimated_total > 0 else None,
        confidence_score=confidence_score
    )

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Interactive chat with the AI Senior Geotechnical Engineer.
    """
    try:
        from app.services.llm import chat_with_ai
        answer = await chat_with_ai(
            message=request.message,
            history=request.history,
            context=request.context
        )
        return ChatResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")
