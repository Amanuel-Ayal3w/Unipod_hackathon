from pydantic import BaseModel
from typing import List, Optional


class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    sources: List[str]
    confidence: float
