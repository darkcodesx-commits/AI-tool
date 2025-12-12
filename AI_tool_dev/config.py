"""
Configuration settings for the Voice AI system
"""
import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Twilio Configuration
    twilio_account_sid: str
    twilio_auth_token: str
    twilio_phone_number: str
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Database
    database_url: str = "sqlite:///./voice_ai.db"
    
    # TTS Configuration
    tts_model: str = "tts_models/en/ljspeech/tacotron2-DDC"
    tts_voice: str = "default"
    
    # STT Configuration
    stt_model: str = "base"
    stt_device: str = "cpu"  # or "cuda" for GPU
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()

