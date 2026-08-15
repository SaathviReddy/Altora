import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./altora.db"
    JWT_SECRET: str = "supersecretaltora_jwt_secret_key_2026_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    FRONTEND_URL: str = "http://localhost:5173"
    AI_API_KEY: str = ""
    ENVIRONMENT: str = "development"
    PORT: int = 8000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
