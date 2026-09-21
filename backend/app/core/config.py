from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_NAME: str = "VoiceShield API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    
    FRONTEND_URL: str = "http://localhost:5173"
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    MODEL_PATH: str = "models/aasist.pth"
    MAX_AUDIO_SIZE_MB: int = 50
    TARGET_SAMPLE_RATE: int = 16000
    SUPPORTED_EXTENSIONS: List[str] = [".wav", ".mp3", ".flac", ".m4a", ".ogg"]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
