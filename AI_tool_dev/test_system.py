"""
Test script for Voice AI system components
"""
import os
import sys

def test_imports():
    """Test if all required packages are installed"""
    print("Testing imports...")
    try:
        import fastapi
        print("[OK] FastAPI imported successfully")
    except ImportError:
        print("[X] FastAPI not installed")
        return False
    
    try:
        import faster_whisper
        print("[OK] Faster-Whisper imported successfully")
    except ImportError:
        print("[X] Faster-Whisper not installed")
        return False
    
    try:
        from TTS.api import TTS
        print("[OK] Coqui TTS imported successfully")
    except ImportError:
        print("[X] Coqui TTS not installed")
        return False
    
    try:
        from twilio.rest import Client
        print("[OK] Twilio imported successfully")
    except ImportError:
        print("[X] Twilio not installed")
        return False
    
    return True


def test_stt():
    """Test STT module"""
    print("\nTesting STT module...")
    try:
        from stt_module import STTEngine
        stt = STTEngine()
        print("[OK] STT engine initialized successfully")
        return True
    except Exception as e:
        print(f"[X] STT engine initialization failed: {str(e)}")
        return False


def test_tts():
    """Test TTS module"""
    print("\nTesting TTS module...")
    try:
        from tts_module import TTSEngine
        tts = TTSEngine()
        print("[OK] TTS engine initialized successfully")
        return True
    except Exception as e:
        print(f"[X] TTS engine initialization failed: {str(e)}")
        return False


def test_conversation():
    """Test conversation flow"""
    print("\nTesting conversation flow...")
    try:
        from conversation_flow import ConversationManager
        manager = ConversationManager()
        
        # Test greeting
        greeting = manager.get_greeting()
        print(f"[OK] Greeting: {greeting}")
        
        # Test appointment booking
        response1 = manager.process_user_input("I want to book an appointment")
        print(f"[OK] Response 1: {response1}")
        
        response2 = manager.process_user_input("Tomorrow at 4 PM")
        print(f"[OK] Response 2: {response2}")
        
        return True
    except Exception as e:
        print(f"[X] Conversation flow test failed: {str(e)}")
        return False


def test_config():
    """Test configuration"""
    print("\nTesting configuration...")
    try:
        from config import settings
        print(f"[OK] Configuration loaded")
        print(f"  - STT Model: {settings.stt_model}")
        print(f"  - TTS Model: {settings.tts_model}")
        print(f"  - Device: {settings.stt_device}")
        return True
    except Exception as e:
        print(f"[X] Configuration test failed: {str(e)}")
        print("  Make sure you have a .env file with required variables")
        return False


def main():
    """Run all tests"""
    print("=" * 50)
    print("Voice AI System Test Suite")
    print("=" * 50)
    
    results = []
    
    results.append(("Imports", test_imports()))
    results.append(("Configuration", test_config()))
    results.append(("STT Module", test_stt()))
    results.append(("TTS Module", test_tts()))
    results.append(("Conversation Flow", test_conversation()))
    
    print("\n" + "=" * 50)
    print("Test Results Summary")
    print("=" * 50)
    
    for name, result in results:
        status = "[PASS]" if result else "[FAIL]"
        print(f"{name}: {status}")
    
    all_passed = all(result for _, result in results)
    
    if all_passed:
        print("\n🎉 All tests passed! System is ready.")
    else:
        print("\n[WARNING] Some tests failed. Please check the errors above.")
        print("\nMake sure to:")
        print("1. Install all dependencies: pip install -r requirements.txt")
        print("2. Create a .env file with required configuration")
        print("3. Check that all modules are properly set up")
    
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())

