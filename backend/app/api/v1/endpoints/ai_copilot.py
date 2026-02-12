from fastapi import APIRouter, UploadFile, File, HTTPException, Response
from app.schemas.copilot import DraftProposalResponse, ChatRequest, ChatResponse, ProposalSchema
from app.services.ai.document_processor import doc_processor
from app.services.ai.geotech_analyzer import geotech_analyzer
from app.services.directus import fetch_matching_data
from app.core.config import settings
from app.core.redis import get_redis
from app.services.pdf_generator import pdf_generator
import hashlib
import json
from fastapi import Request

router = APIRouter()

@router.post("/parse-document", response_model=DraftProposalResponse)
async def parse_document(request: Request, file: UploadFile = File(...)):
    """
    Professional technical audit of uploaded documents with abuse protection.
    """
    client_ip = request.client.host
    redis = get_redis()
    
    # 0. Basic Protection: File Size
    content = await file.read()
    file_size_mb = len(content) / (1024 * 1024)
    if file_size_mb > settings.MAX_FILE_SIZE_MB:
        raise HTTPException(status_code=413, detail=f"File too large. Max {settings.MAX_FILE_SIZE_MB}MB")
    
    # 0. Protection: Rate Limiting (IP based)
    rate_key = f"rate_limit:{client_ip}"
    current_requests = redis.get(rate_key)
    if current_requests and int(current_requests) >= settings.AUDIT_RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again in an hour.")
    
    # 1. Check Cache (File Hash)
    file_hash = hashlib.sha256(content).hexdigest()
    cache_key = f"audit_cache:{file_hash}"
    cached_result = redis.get(cache_key)
    if cached_result:
        return DraftProposalResponse(**json.loads(cached_result))

    # Reset file pointer for processor
    await file.seek(0)

    # 1. High-fidelity Processing
    try:
        processed_doc = await doc_processor.process_file(file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing document: {str(e)}")
    
    # 2. Expert Engineering Analysis (with pre-validation)
    try:
        analysis_result = await geotech_analyzer.analyze_project(processed_doc)
    except Exception as e:
        # If it's a validation error (not a geotech doc), we don't count it towards rate limit
        if "not a geotechnical" in str(e).lower():
            raise HTTPException(status_code=422, detail=str(e))
        raise HTTPException(status_code=500, detail=f"Professional audit failed: {str(e)}")
    
    parsed_data = analysis_result["parsed_data"]
    
    # 3. Directus Lookup
    shpunts, machinery = await fetch_matching_data(
        work_type=parsed_data.work_type,
        required_profile=parsed_data.required_profile
    )
    
    # 4. Professional Estimate Calculation
    estimated_total = 0
    if shpunts and parsed_data.volume:
        estimated_total = shpunts[0].price * parsed_data.volume
    
    response_data = DraftProposalResponse(
        parsed_data=parsed_data,
        technical_summary=analysis_result["technical_summary"],
        risks=analysis_result["risks"],
        matched_shpunts=shpunts,
        recommended_machinery=machinery,
        estimated_total=estimated_total if estimated_total > 0 else None,
        confidence_score=analysis_result["confidence_score"]
    )

    # Increment rate limit counter
    if not current_requests:
        redis.setex(rate_key, 3600, 1) # 1 hour TTL
    else:
        redis.incr(rate_key)

    # Store in cache
    redis.setex(cache_key, 86400, response_data.model_dump_json()) # 24 hour cache

    return response_data

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

@router.post("/download-report")
async def download_report(proposal: ProposalSchema):
    """
    Generates and returns a PDF report based on the provided proposal data.
    """
    try:
        pdf_content = pdf_generator.generate_audit_report(proposal.model_dump())
        
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=geotech_audit_report.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF report: {str(e)}")
