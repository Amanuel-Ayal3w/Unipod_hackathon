from typing import Any, Dict, Optional

from postgrest.exceptions import APIError

from .db import get_supabase_client


TABLE_NAME = "user_api_keys"


def _encrypt_api_key(plain: str) -> str:
    # TODO: replace with real encryption using ENCRYPTION_KEY
    return plain


def _decrypt_api_key(cipher: str) -> str:
    # TODO: replace with real decryption
    return cipher


def save_user_llm_config(
    bot_id: str,
    provider: str,
    api_key: str,
    model: str,
) -> None:
    client = get_supabase_client()
    encrypted = _encrypt_api_key(api_key)

    payload = {
        "bot_id": bot_id,
        "provider": provider,
        "api_key_encrypted": encrypted,
        "model": model,
        "is_active": True,
    }

    # On Supabase, define UNIQUE (bot_id, provider, model)
    client.table(TABLE_NAME).upsert(payload).execute()


def get_user_llm_config(bot_id: str) -> Optional[Dict[str, Any]]:
    """Fetch latest active Google LLM config for a bot.

    For demo purposes, if the user_api_keys table does not exist or any
    API error occurs, we simply return None and let callers fall back
    to environment-based defaults.
    """

    client = get_supabase_client()
    try:
        resp = (
            client.table(TABLE_NAME)
            .select("*")
            .eq("bot_id", bot_id)
            .eq("is_active", True)
            .eq("provider", "google")
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
    except APIError:
        # Table missing or other API error: no stored config
        return None

    rows = getattr(resp, "data", None) or []
    if not rows:
        return None

    row = rows[0]
    row["api_key"] = _decrypt_api_key(row["api_key_encrypted"])
    return row
