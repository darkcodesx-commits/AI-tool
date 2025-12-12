"""
Speech-to-Text module using Faster-Whisper
"""
import os
from faster_whisper import WhisperModel
from config import settings
import logging

logger = logging.getLogger(__name__)


class STTEngine:
    """Speech-to-Text engine using Faster-Whisper"""
    
    def __init__(self, model_size: str = None, device: str = None):
        """
        Initialize the STT engine
        
        Args:
            model_size: Whisper model size (tiny, base, small, medium, large)
            device: Device to use (cpu or cuda)
        """
        self.model_size = model_size or settings.stt_model
        self.device = device or settings.stt_device
        
        logger.info(f"Loading Whisper model: {self.model_size} on {self.device}")
        self.model = WhisperModel(self.model_size, device=self.device)
        logger.info("Whisper model loaded successfully")
    
    def transcribe(self, audio_path: str, language: str = "en") -> str:
        """
        Transcribe audio file to text
        
        Args:
            audio_path: Path to audio file
            language: Language code (default: "en")
            
        Returns:
            Transcribed text
        """
        try:
            logger.info(f"Transcribing audio: {audio_path}")
            segments, info = self.model.transcribe(
                audio_path,
                language=language,
                beam_size=5,
                vad_filter=True
            )
            
            # Combine all segments into full text
            text = " ".join([segment.text for segment in segments])
            logger.info(f"Transcription completed: {text[:50]}...")
            return text.strip()
        
        except Exception as e:
            logger.error(f"Error transcribing audio: {str(e)}")
            raise
    
    def transcribe_stream(self, audio_data: bytes, language: str = "en") -> str:
        """
        Transcribe audio data from stream
        
        Args:
            audio_data: Audio bytes
            language: Language code (default: "en")
            
        Returns:
            Transcribed text
        """
        try:
            # Save temporary audio file
            import tempfile
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
                tmp_file.write(audio_data)
                tmp_path = tmp_file.name
            
            try:
                text = self.transcribe(tmp_path, language)
            finally:
                # Clean up temp file
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)
            
            return text
        
        except Exception as e:
            logger.error(f"Error transcribing stream: {str(e)}")
            raise

