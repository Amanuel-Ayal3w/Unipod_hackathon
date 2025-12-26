from fastapi import APIRouter, Depends, HTTPException, status

from ..core.llm_config import get_user_llm_config, save_user_llm_config
from ..dependencies.auth import get_current_admin
from ..schemas.config import ChatbotConfig, ChatbotConfigCreate, ChatbotConfigResponse


router = APIRouter(prefix="/config")


@router.put("/", response_model=ChatbotConfigResponse)
async def update_chatbot_config(
    payload: ChatbotConfigCreate,
    current_admin: dict = Depends(get_current_admin),
) -> ChatbotConfigResponse:
    bot_id = current_admin.get("bot_id")
    if not bot_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="UNAUTHORIZED",
        )

    # For now we only support Google Gemini
    if payload.provider != "google":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ONLY_GOOGLE_GEMINI_SUPPORTED",
        )

    save_user_llm_config(
        bot_id=bot_id,
        provider=payload.provider,
        api_key=payload.api_key,
        model=payload.model,
    )

    data = ChatbotConfig(provider=payload.provider, model=payload.model, has_api_key=True)
    return ChatbotConfigResponse(success=True, data=data)


@router.get("/", response_model=ChatbotConfigResponse)
async def get_chatbot_config(
    current_admin: dict = Depends(get_current_admin),
) -> ChatbotConfigResponse:
    bot_id = current_admin.get("bot_id")
    if not bot_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="UNAUTHORIZED",
        )

    row = get_user_llm_config(bot_id)
    if not row:
        data = ChatbotConfig(provider="google", model="gemini-1.5-flash", has_api_key=False)
    else:
        data = ChatbotConfig(provider=row["provider"], model=row["model"], has_api_key=True)

    return ChatbotConfigResponse(success=True, data=data)
