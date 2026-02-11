from fastapi import APIRouter

router = APIRouter()

@router.post("/parse")
async def parse_document():
    """
    Endpoint for AI parsing of uploaded technical documents.
    """
    return {"message": "AI parsing endpoint - TBD"}
