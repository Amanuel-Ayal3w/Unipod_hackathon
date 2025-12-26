from fastapi import Depends, Header, HTTPException, status
from typing import Optional


async def get_current_admin(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="AUTH_REQUIRED")
    return {"sub": "admin-id-stub", "bot_id": "bot-id-stub"}


async def get_bot_from_api_key(x_api_key: Optional[str] = Header(None, convert_underscores=False)) -> dict:
    if not x_api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="INVALID_API_KEY")
    return {"bot_id": "bot-id-from-api-key-stub"}


