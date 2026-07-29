import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    database_url: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/stocklyzer")

    # JWT auth
    jwt_secret: str = os.getenv("JWT_SECRET", "change-this-secret-in-production")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # Google OAuth
    google_client_id: str = os.getenv("GOOGLE_CLIENT_ID", "")

    # Claude API (for AI insights layer)
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    anthropic_model: str = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")

    # CORS
    frontend_origin: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

    class Config:
        env_file = ".env"


settings = Settings()
