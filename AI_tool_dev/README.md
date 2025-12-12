# Voice AI Receptionist System

A complete AI-powered voice receptionist system that handles incoming and outbound phone calls with natural conversation capabilities.

## 🎯 Features

- **Speech-to-Text (STT)**: Converts user voice to text using Faster-Whisper
- **Text-to-Speech (TTS)**: Converts AI responses to natural human-like voice using Coqui TTS
- **Phone Integration**: Handles calls via Twilio (incoming and outbound)
- **Multi-turn Conversations**: Maintains context across conversation turns
- **Appointment Booking**: Intelligent appointment scheduling with natural language understanding
- **Call Logging**: Stores call transcripts and metadata in SQLite database
- **RESTful API**: FastAPI backend for easy integration

## 🏗️ Architecture

```
┌─────────────┐
│   Twilio    │ ← Phone Calls
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  FastAPI    │ ← Backend Server
│   Server    │
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
   ▼       ▼
┌─────┐ ┌─────┐
│ STT │ │ TTS │ ← Speech Processing
└─────┘ └─────┘
   │       │
   ▼       ▼
┌─────────────┐
│Conversation │ ← Flow Logic
│  Manager    │
└─────────────┘
```

## 📋 Prerequisites

- Python 3.8 or higher
- Twilio account with phone number
- (Optional) CUDA-capable GPU for faster STT/TTS processing

## 🚀 Installation

### 1. Clone and Setup

```bash
# Navigate to project directory
cd AI_tool_dev

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Server Configuration
HOST=0.0.0.0
PORT=8000

# Database
DATABASE_URL=sqlite:///./voice_ai.db

# TTS Configuration
TTS_MODEL=tts_models/en/ljspeech/tacotron2-DDC
TTS_VOICE=default

# STT Configuration
STT_MODEL=base
STT_DEVICE=cpu
```

### 3. Get Twilio Credentials

1. Sign up at [Twilio](https://www.twilio.com/)
2. Get your Account SID and Auth Token from the dashboard
3. Purchase a phone number or use a trial number
4. Update `.env` with your credentials

### 4. Setup Public URL (for Twilio webhooks)

For development, use ngrok or similar:

```bash
# Install ngrok
# Download from https://ngrok.com/

# Start your FastAPI server
python main.py

# In another terminal, expose it
ngrok http 8000

# Use the ngrok URL in Twilio webhook settings
# Example: https://abc123.ngrok.io/twilio/incoming
```

## 🎮 Usage

### Start the Server

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Configure Twilio Webhooks

1. Go to Twilio Console → Phone Numbers → Manage → Active Numbers
2. Click on your phone number
3. Set Voice & Fax webhook URL to: `https://your-public-url.com/twilio/incoming`
4. Set HTTP method to: `POST`
5. Save configuration

### Make a Test Call

Call your Twilio phone number. The AI will:
1. Greet you
2. Listen to your request
3. Respond naturally
4. Handle appointment booking or answer questions

### API Endpoints

#### Get Call Logs
```bash
GET /logs
```

#### Get Specific Call Log
```bash
GET /logs/{call_sid}
```

#### Make Outbound Call
```bash
POST /call/outbound
Content-Type: application/x-www-form-urlencoded

phone_number=+1234567890&message=Hello, this is a test call
```

## 🧪 Testing

### Test STT Module

```python
from stt_module import STTEngine

stt = STTEngine()
text = stt.transcribe("path/to/audio.wav")
print(text)
```

### Test TTS Module

```python
from tts_module import TTSEngine

tts = TTSEngine()
audio_path = tts.synthesize("Hello, this is a test message")
print(f"Audio saved to: {audio_path}")
```

### Test Conversation Flow

```python
from conversation_flow import ConversationManager

manager = ConversationManager()
response = manager.process_user_input("I want to book an appointment")
print(response)
```

## 📁 Project Structure

```
AI_tool_dev/
├── main.py                 # FastAPI backend and Twilio integration
├── stt_module.py          # Speech-to-Text engine
├── tts_module.py          # Text-to-Speech engine
├── conversation_flow.py   # Conversation logic and state management
├── database.py            # Database models and setup
├── config.py              # Configuration management
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (create this)
├── .env.example          # Example environment file
└── README.md             # This file
```

## 🔧 Configuration Options

### STT Models
- `tiny`: Fastest, least accurate
- `base`: Balanced (default)
- `small`: Better accuracy
- `medium`: High accuracy
- `large`: Best accuracy, slowest

### TTS Models
- `tts_models/en/ljspeech/tacotron2-DDC`: Default
- `tts_models/en/ljspeech/glow-tts`: Alternative
- `tts_models/en/vctk/vits`: Multi-speaker

### Device Selection
- `cpu`: Default, works everywhere
- `cuda`: Requires NVIDIA GPU with CUDA

## 🐛 Troubleshooting

### TTS Model Download Issues
If TTS model fails to download:
```bash
# Manually download models
python -c "from TTS.api import TTS; TTS('tts_models/en/ljspeech/tacotron2-DDC')"
```

### Twilio Webhook Errors
- Ensure your server is publicly accessible (use ngrok)
- Check webhook URL in Twilio console
- Verify SSL certificate (required for production)

### Audio Processing Issues
- Ensure audio files are in WAV format
- Check sample rate (16kHz recommended)
- Verify microphone permissions

## 📝 Example Conversation

**User**: "Hello, I'd like to book an appointment"

**AI**: "I'd be happy to help you book an appointment. What date and time would work for you?"

**User**: "Tomorrow at 4 PM"

**AI**: "Great! I have the date and time. May I have your name, please?"

**User**: "My name is John"

**AI**: "Perfect! I've booked an appointment for John on tomorrow at 4 PM. Is there anything else I can help you with?"

## 🚀 Deployment

### Production Considerations

1. **Use HTTPS**: Twilio requires HTTPS for webhooks
2. **Database**: Consider PostgreSQL for production
3. **Caching**: Add Redis for conversation state
4. **Monitoring**: Add logging and error tracking
5. **Scaling**: Use process managers like Gunicorn

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📄 License

This project is for educational/internship purposes.

## 🤝 Contributing

This is an internship project. Feel free to extend and improve!

## 📞 Support

For issues or questions, check:
- Twilio Documentation: https://www.twilio.com/docs
- Coqui TTS: https://github.com/coqui-ai/TTS
- Faster-Whisper: https://github.com/guillaumekln/faster-whisper

---

**Built with ❤️ for AI Voice Receptionist System**

