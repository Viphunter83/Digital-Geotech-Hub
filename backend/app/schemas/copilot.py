from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class ParsedSpecSchema(BaseModel):
    work_type: str = Field(..., description="Тип работ (например, вдавливание, погружение, бурение)")
    volume: Optional[float] = Field(None, description="Объем работ (если указан)")
    soil_type: Optional[str] = Field(None, description="Тип грунта/геология")
    required_profile: Optional[str] = Field(None, description="Марка шпунта (например, Л5-УМ, Л4)")
    depth: Optional[float] = Field(None, description="Глубина погружения (метры)")
    groundwater_level: Optional[float] = Field(None, description="Уровень грунтовых вод (если указан)")
    special_conditions: List[str] = Field(default_factory=list, description="Особые условия (стесненность, близость зданий и т.д.)")

class RiskItem(BaseModel):
    risk: str
    impact: str

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
    technical_summary: str = Field(..., description="Профессиональное резюме от AI-инженера (Markdown)")
    risks: List[RiskItem] = Field(default_factory=list, description="Список выявленных инженерных рисков")
    matched_shpunts: List[ShpuntInfo] = []
    recommended_machinery: List[MachineryInfo] = []
    estimated_total: Optional[float] = Field(None, description="Ориентировочная стоимость (может отсутствовать)")
    confidence_score: float = Field(..., description="Уровень уверенности AI в извлеченных данных (0-1)")

class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str

class ChatRequest(BaseModel):
    history: List[ChatMessage]
    message: str
    context: Optional[str] = Field(None, description="Контекст документа (если есть)")

class ChatResponse(BaseModel):
    answer: str

class LeadInput(BaseModel):
    name: str = Field(..., min_length=2)
    phone: str = Field(..., pattern=r"^\+?[\d\s\-()]{10,}$")
    email: Optional[str] = None
    company: Optional[str] = None
    audit_data: Optional[Dict] = None # To store technical data from the audit

class LeadResponse(BaseModel):
    success: bool
    message: str
    lead_id: Optional[str] = None

class ProposalSchema(DraftProposalResponse):
    pass
