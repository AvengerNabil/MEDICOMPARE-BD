from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "MediCompare BD"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "temporary_secret_key_change_in_production_32chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 1 day
    
    # Database
    DATABASE_URL: str = "sqlite:///./medicompare_dev.db" # Default fallback for local testing, PostgreSQL for prod
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
