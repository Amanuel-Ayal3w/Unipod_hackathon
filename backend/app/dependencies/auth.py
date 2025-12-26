from fastapi import Header
from typing import Optional


async def get_current_admin(authorization: Optional[str] = Header(None)) -> dict:
    # Demo mode: ignore Authorization and always return a fixed admin/bot
    return {"sub": "demo-admin", "bot_id": "demo-bot"}


async def get_bot_from_api_key(x_api_key: Optional[str] = Header(None, convert_underscores=False)) -> dict:
    # Demo mode: ignore x-api-key and always return the same bot_id
    return {"bot_id": "demo-bot"}


