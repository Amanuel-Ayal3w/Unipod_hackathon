import os
from functools import lru_cache


class Settings:
    def __init__(self) -> None:
        self.supabase_url: str = os.getenv("SUPABASE_URL", "")
        self.supabase_service_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

        if not self.supabase_url or not self.supabase_service_key:
            raise RuntimeError("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set")


@lru_cache()
def get_settings() -> Settings:
    return Settings()
