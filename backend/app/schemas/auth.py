from pydantic import BaseModel, Field
from typing import Optional


class VerifyCodeRequest(BaseModel):
    access_code: str = Field(..., min_length=4, description="Код доступа клиента")


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = Field(..., description="Срок жизни токена в секундах")
    client: "ClientInfo"


class ClientInfo(BaseModel):
    company_name: str
    email: Optional[str] = None
    access_level: str = "standard"


# Rebuild to resolve forward ref
AuthTokenResponse.model_rebuild()
