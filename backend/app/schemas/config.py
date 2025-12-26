from pydantic import BaseModel


class ChatbotConfigCreate(BaseModel):
    provider: str
    api_key: str
    model: str


class ChatbotConfig(BaseModel):
    provider: str
    model: str
    has_api_key: bool


class ChatbotConfigResponse(BaseModel):
    success: bool
    data: ChatbotConfig
