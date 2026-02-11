from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.copilot import DraftProposalResponse, ChatRequest, ChatResponse
from app.services.ai.document_processor import doc_processor
from app.services.ai.geotech_analyzer import geotech_analyzer

router = APIRouter()

@router.post("/parse-document", response_model=DraftProposalResponse)
async def parse_document(file: UploadFile = File(...)):
    """
    Professional technical audit of uploaded documents using multi-pass AI analysis.
    """
    # 1. High-fidelity Processing
    try:
        processed_doc = await doc_processor.process_file(file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing document: {str(e)}")
    
    # 2. Expert Engineering Analysis
    try:
        analysis_result = await geotech_analyzer.analyze_project(processed_doc)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Professional audit failed: {str(e)}")
    
    parsed_data = analysis_result["parsed_data"]
    
    # 3. Directus Lookup for recommendations
    shpunts, machinery = await fetch_matching_data(
        work_type=parsed_data.work_type,
        required_profile=parsed_data.required_profile
    )
    
    # 4. Professional Estimate Calculation
    estimated_total = 0
    if shpunts and parsed_data.volume:
        # Simplistic but matches current business logic
        estimated_total = shpunts[0].price * parsed_data.volume
    
    return DraftProposalResponse(
        parsed_data=parsed_data,
        technical_summary=analysis_result["technical_summary"],
        risks=analysis_result["risks"],
        matched_shpunts=shpunts,
        recommended_machinery=machinery,
        estimated_total=estimated_total if estimated_total > 0 else None,
        confidence_score=analysis_result["confidence_score"]
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
