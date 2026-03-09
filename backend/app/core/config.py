from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from pathlib import Path


BACKEND_BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Resume to Portfolio API"
    
    # Database
    DATABASE_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "resume_portfolio"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Firebase
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None
    
    # AI Service
    GEMINI_API_KEY: Optional[str] = None

    # Payments (optional)
    RAZORPAY_KEY_ID: Optional[str] = None
    RAZORPAY_KEY_SECRET: Optional[str] = None

    # Billing admin (for creating coupons via API)
    BILLING_ADMIN_SECRET: Optional[str] = None

    # Development-only auth bypass (DO NOT enable in production)
    DEV_AUTH_BYPASS: bool = False
    DEV_AUTH_USER_ID: str = "demo-user"
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = str(BACKEND_BASE_DIR / "uploads")
    TEMP_DIR: str = str(BACKEND_BASE_DIR / "temp")
    
    # Portfolio Publishing
    PORTFOLIO_DOMAIN: str = "http://localhost:3000"
    PORTFOLIO_BUILD_DIR: str = str(BACKEND_BASE_DIR / "portfolio_builds")
    
    model_config = SettingsConfigDict(
        env_file=str(BACKEND_BASE_DIR / ".env"),
        case_sensitive=True,
    )


settings = Settings()
