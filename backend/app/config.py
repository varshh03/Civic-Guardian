from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    jwt_secret: str = "dev-secret-change-in-production"
    openrouter_api_key: str = ""
    openrouter_model: str = "openai/gpt-4o-mini"
    admin_email: str = "admin@karurmc.gov.in"
    admin_password: str = "Admin@1234"
    cors_origins: list[str] = ["http://localhost:5173"]
    upload_dir: str = "uploads"
    data_dir: str = "data"
    jwt_expire_minutes: int = 60 * 24 * 7

    class Config:
        env_file = ".env"

from functools import lru_cache

@lru_cache()
def get_settings():
    return Settings()
