"""
Quick start script for Voice AI Receptionist Server
"""
import os
import sys
import subprocess

def check_env_file():
    """Check if .env file exists"""
    if not os.path.exists('.env'):
        print("⚠️  Warning: .env file not found!")
        print("Please create a .env file with your configuration.")
        print("See .env.example or setup_guide.md for details.")
        response = input("Continue anyway? (y/n): ")
        if response.lower() != 'y':
            sys.exit(1)
    else:
        print("✓ .env file found")

def check_dependencies():
    """Check if required packages are installed"""
    print("Checking dependencies...")
    try:
        import fastapi
        import faster_whisper
        from TTS.api import TTS
        from twilio.rest import Client
        print("✓ All dependencies installed")
        return True
    except ImportError as e:
        print(f"✗ Missing dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def main():
    """Start the server"""
    print("=" * 50)
    print("Voice AI Receptionist - Server Startup")
    print("=" * 50)
    
    # Check environment
    check_env_file()
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Start server
    print("\n🚀 Starting server...")
    print("Server will be available at: http://localhost:8000")
    print("API docs at: http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop the server\n")
    
    try:
        import uvicorn
        from config import settings
        
        uvicorn.run(
            "main:app",
            host=settings.host,
            port=settings.port,
            reload=True
        )
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped")
    except Exception as e:
        print(f"\n✗ Error starting server: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()

