from fastapi import APIRouter, Depends, Header
from typing import Optional

from ..core.rag import chat_with_rag
from ..dependencies.auth import get_bot_from_api_key
from ..schemas.chat import ChatRequest, ChatResponse


router = APIRouter()


@router.post("/", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    x_api_key: Optional[str] = Header(None, convert_underscores=False),
    bot: dict = Depends(get_bot_from_api_key),
) -> ChatResponse:
    answer, sources, confidence = await chat_with_rag(
        message=payload.message,
        context=payload.context,
        bot_id=bot["bot_id"],
    )

    return ChatResponse(
        response=answer,
        sources=sources,
        confidence=confidence,
    )
