import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "E-Commerce Mobile App Backend API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # Security
    SECRET_KEY: str = "super-secret-jwt-key-change-in-production-2026-ecommerce"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    
    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "vrushali"
    POSTGRES_DB: str = "ecommerce_db"
    DATABASE_URL: Union[str, None] = None

    @property
    def sync_database_url(self) -> str:
        if self.DATABASE_URL:
            # ensure standard psycopg2 driver if postgresql://
            if self.DATABASE_URL.startswith("postgres://"):
                return self.DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
            if self.DATABASE_URL.startswith("postgresql://") and not self.DATABASE_URL.startswith("postgresql+"):
                return self.DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)
            return self.DATABASE_URL
        return f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "*",
        "http://localhost",
        "http://localhost:8081",
        "http://localhost:19000",
        "http://localhost:19006",
        "http://localhost:3000",
        "http://127.0.0.1:8081",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
