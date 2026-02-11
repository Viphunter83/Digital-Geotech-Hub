from pydantic import BaseModel, Field
from typing import List, Optional

class ParsedSpecSchema(BaseModel):
    work_type: str = Field(..., description="Тип работ (например, вдавливание, погружение, бурение)")
    volume: float = Field(..., description="Объем работ в погонных метрах или тоннах")
    soil_type: Optional[str] = Field(None, description="Тип грунта, если указан")
    required_profile: Optional[str] = Field(None, description="Марка шпунта (например, Л5-УМ, Л4)")

class ShpuntInfo(BaseModel):
    name: str
    price: float
    stock: float

class MachineryInfo(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    category: str

class DraftProposalResponse(BaseModel):
    parsed_data: ParsedSpecSchema
    matched_shpunts: List[ShpuntInfo] = []
    recommended_machinery: List[MachineryInfo] = []
    estimated_total: Optional[float] = None
