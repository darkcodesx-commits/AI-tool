"""
Text-to-Speech module using Coqui TTS (optional)
"""
import os
import tempfile
from config import settings
import logging

logger = logging.getLogger(__name__)

# Try to import TTS, but make it optional
try:
    from TTS.api import TTS
    TTS_AVAILABLE = True
except ImportError:
    TTS_AVAILABLE = False
    logger.warning("Coqui TTS not available. TTS features will be limited.")


class TTSEngine:
    """Text-to-Speech engine using Coqui TTS"""
    
    def __init__(self, model_name: str = None, voice: str = None):
        """
        Initialize the TTS engine
        
        Args:
            model_name: TTS model name
            voice: Voice name to use
        """
        self.model_name = model_name or settings.tts_model
        self.voice = voice or settings.tts_voice
        self.tts = None
        
        if not TTS_AVAILABLE:
            logger.warning("TTS library not available. This module is optional for phone calls.")
            return
        
        logger.info(f"Loading TTS model: {self.model_name}")
        try:
            self.tts = TTS(model_name=self.model_name, progress_bar=False)
            logger.info("TTS model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading TTS model: {str(e)}")
            # Fallback to a simpler model
            logger.info("Trying fallback model...")
            try:
                self.tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC", progress_bar=False)
            except Exception as e2:
                logger.error(f"Fallback TTS model also failed: {str(e2)}")
                self.tts = None
    
    def synthesize(self, text: str, output_path: str = None) -> str:
        """
        Convert text to speech audio file
        
        Args:
            text: Text to convert to speech
            output_path: Optional path to save audio file
            
        Returns:
            Path to generated audio file
        """
        if not TTS_AVAILABLE or self.tts is None:
            raise RuntimeError("TTS engine not available. Install Coqui TTS or use Twilio TTS for phone calls.")
        
        try:
            if output_path is None:
                # Create temporary file
                tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
                output_path = tmp_file.name
                tmp_file.close()
            
            logger.info(f"Synthesizing speech: {text[:50]}...")
            
            # Generate speech
            self.tts.tts_to_file(
                text=text,
                file_path=output_path,
                speaker=self.voice if hasattr(self.tts, 'speaker') else None
            )
            
            logger.info(f"Speech synthesized: {output_path}")
            return output_path
        
        except Exception as e:
            logger.error(f"Error synthesizing speech: {str(e)}")
            raise
    
    def synthesize_to_bytes(self, text: str) -> bytes:
        """
        Convert text to speech and return as bytes
        
        Args:
            text: Text to convert to speech
            
        Returns:
            Audio data as bytes
        """
        if not TTS_AVAILABLE or self.tts is None:
            raise RuntimeError("TTS engine not available. Install Coqui TTS or use Twilio TTS for phone calls.")
        
        try:
            # Generate to temp file first
            audio_path = self.synthesize(text)
            
            # Read file as bytes
            with open(audio_path, 'rb') as f:
                audio_data = f.read()
            
            # Clean up temp file
            if os.path.exists(audio_path):
                os.unlink(audio_path)
            
            return audio_data
        
        except Exception as e:
            logger.error(f"Error synthesizing to bytes: {str(e)}")
            raise

