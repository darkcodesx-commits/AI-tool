"""
Utility functions for the Voice AI system
"""
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def ensure_directory(path: str):
    """Ensure a directory exists, create if it doesn't"""
    if not os.path.exists(path):
        os.makedirs(path)
        logger.info(f"Created directory: {path}")


def format_phone_number(phone: str) -> str:
    """
    Format phone number to E.164 format
    
    Args:
        phone: Phone number in various formats
        
    Returns:
        Formatted phone number
    """
    # Remove all non-digit characters
    digits = ''.join(filter(str.isdigit, phone))
    
    # Add + if not present and number doesn't start with country code
    if not phone.startswith('+'):
        # Assume US number if 10 digits
        if len(digits) == 10:
            return f"+1{digits}"
        else:
            return f"+{digits}"
    
    return phone


def validate_phone_number(phone: str) -> bool:
    """
    Validate phone number format
    
    Args:
        phone: Phone number to validate
        
    Returns:
        True if valid, False otherwise
    """
    # Remove formatting
    digits = ''.join(filter(str.isdigit, phone))
    
    # Check length (should be 10-15 digits for international)
    if len(digits) < 10 or len(digits) > 15:
        return False
    
    return True


def sanitize_text(text: str, max_length: int = 500) -> str:
    """
    Sanitize and truncate text
    
    Args:
        text: Text to sanitize
        max_length: Maximum length
        
    Returns:
        Sanitized text
    """
    if not text:
        return ""
    
    # Remove excessive whitespace
    text = ' '.join(text.split())
    
    # Truncate if too long
    if len(text) > max_length:
        text = text[:max_length] + "..."
    
    return text.strip()


def get_audio_duration(audio_path: str) -> Optional[float]:
    """
    Get duration of audio file in seconds
    
    Args:
        audio_path: Path to audio file
        
    Returns:
        Duration in seconds, or None if error
    """
    try:
        from pydub import AudioSegment
        audio = AudioSegment.from_file(audio_path)
        return len(audio) / 1000.0  # Convert milliseconds to seconds
    except Exception as e:
        logger.error(f"Error getting audio duration: {str(e)}")
        return None

