import os
from functools import lru_cache

from dotenv import load_dotenv


# Ensure environment variables from backend/.env are loaded when the app starts
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
ENV_PATH = os.path.join(BASE_DIR, ".env")
load_dotenv(ENV_PATH)


class Settings:
    def __init__(self) -> None:
        self.supabase_url: str = os.getenv("SUPABASE_URL", "")
        self.supabase_service_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

        if not self.supabase_url or not self.supabase_service_key:
            raise RuntimeError("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set")


@lru_cache()
def get_settings() -> Settings:
    return Settings()
