from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import List
import json
import secrets

load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str
    TELEGRAM_BOT_TOKEN: str
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-2.5-flash"
    CORS_ORIGINS: str = '["http://localhost:5173","http://localhost:3000"]'

    SECRET_KEY: str = secrets.token_hex(32)
    TOKEN_EXPIRE_HOURS: int = 24

    DASHBOARD_USERNAME: str = "admin"
    DASHBOARD_PASSWORD_HASH: str = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"

    @property
    def cors_origins_list(self) -> List[str]:
        try:
            return json.loads(self.CORS_ORIGINS)
        except Exception:
            return [self.CORS_ORIGINS]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
