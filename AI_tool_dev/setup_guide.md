# Quick Setup Guide

## Step 1: Install Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install packages
pip install -r requirements.txt
```

**Note**: TTS and Whisper models will be downloaded automatically on first use. This may take a few minutes.

## Step 2: Get Twilio Account

1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free account
3. Get your Account SID and Auth Token from the dashboard
4. Get a phone number (free trial numbers available)

## Step 3: Create .env File

Create a `.env` file in the project root:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

HOST=0.0.0.0
PORT=8000

DATABASE_URL=sqlite:///./voice_ai.db

TTS_MODEL=tts_models/en/ljspeech/tacotron2-DDC
TTS_VOICE=default

STT_MODEL=base
STT_DEVICE=cpu
```

## Step 4: Test the System

```bash
python test_system.py
```

This will verify all components are working.

## Step 5: Start the Server

```bash
python main.py
```

Or:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Step 6: Expose Server Publicly (for Twilio webhooks)

### Option A: Using ngrok (Recommended for testing)

1. Download ngrok from https://ngrok.com/
2. Start your server (Step 5)
3. In another terminal:
   ```bash
   ngrok http 8000
   ```
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### Option B: Deploy to Cloud

Deploy to Heroku, AWS, or any cloud provider with a public URL.

## Step 7: Configure Twilio Webhook

1. Go to Twilio Console → Phone Numbers → Manage → Active Numbers
2. Click on your phone number
3. In "Voice & Fax" section:
   - **A CALL COMES IN**: Set to `https://your-ngrok-url.ngrok.io/twilio/incoming`
   - **HTTP Method**: POST
4. Save

## Step 8: Test with a Phone Call

Call your Twilio phone number! The AI should answer and start a conversation.

## Troubleshooting

### "Module not found" errors
- Make sure virtual environment is activated
- Run `pip install -r requirements.txt` again

### TTS model download fails
- Check internet connection
- Models are large (100MB+), be patient
- Try: `python -c "from TTS.api import TTS; TTS('tts_models/en/ljspeech/tacotron2-DDC')"`

### Twilio webhook not working
- Ensure server is publicly accessible
- Check ngrok is running
- Verify webhook URL in Twilio console
- Check server logs for errors

### Audio issues
- Ensure microphone permissions are granted
- Check audio format (WAV, 16kHz recommended)

## Next Steps

- Customize conversation flow in `conversation_flow.py`
- Add more appointment booking logic
- Integrate with your calendar system
- Add more natural language understanding
- Improve TTS voice quality

