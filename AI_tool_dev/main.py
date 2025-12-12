"""
FastAPI backend for Voice AI Receptionist System
"""
from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.responses import Response, PlainTextResponse
from twilio.twiml.voice_response import VoiceResponse, Gather
from twilio.rest import Client
import logging
import os
import tempfile
import base64
from typing import Optional

from config import settings
from database import get_db, CallLog, init_db, SQLALCHEMY_AVAILABLE
from stt_module import STTEngine
from tts_module import TTSEngine
from conversation_flow import ConversationManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Voice AI Receptionist", version="1.0.0")

# Initialize engines (singleton pattern)
stt_engine: Optional[STTEngine] = None
tts_engine: Optional[TTSEngine] = None
twilio_client: Optional[Client] = None

# Conversation managers (one per call)
conversation_managers: dict = {}


def get_stt_engine() -> STTEngine:
    """Get or create STT engine"""
    global stt_engine
    if stt_engine is None:
        stt_engine = STTEngine()
    return stt_engine


def get_tts_engine() -> TTSEngine:
    """Get or create TTS engine"""
    global tts_engine
    if tts_engine is None:
        tts_engine = TTSEngine()
    return tts_engine


def get_twilio_client() -> Client:
    """Get or create Twilio client"""
    global twilio_client
    if twilio_client is None:
        twilio_client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
    return twilio_client


@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    logger.info("Initializing Voice AI Receptionist...")
    try:
        init_db()
        logger.info("Database initialized")
    except Exception as e:
        logger.warning(f"Database initialization warning: {str(e)}")
    logger.info("Voice AI Receptionist ready!")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Voice AI Receptionist API",
        "status": "running",
        "endpoints": {
            "incoming_call": "/twilio/incoming",
            "outgoing_call": "/call/outbound",
            "call_status": "/twilio/status",
            "call_logs": "/logs"
        }
    }


@app.post("/twilio/incoming")
async def handle_incoming_call(request: Request):
    """
    Handle incoming phone calls from Twilio
    """
    form_data = await request.form()
    call_sid = form_data.get("CallSid")
    from_number = form_data.get("From")
    
    logger.info(f"Incoming call from {from_number}, CallSid: {call_sid}")
    
    # Initialize conversation manager for this call
    conversation_managers[call_sid] = ConversationManager()
    
    # Create TwiML response
    response = VoiceResponse()
    
    # Get greeting message
    greeting = conversation_managers[call_sid].get_greeting()
    
    # Use Twilio's built-in TTS (Say verb)
    # This is more reliable for phone calls than local TTS
    response.say(greeting, voice='alice', language='en-US')
    
    # Gather user input
    gather = Gather(
        input='speech',
        action='/twilio/process-speech',
        method='POST',
        speech_timeout='auto',
        language='en-US'
    )
    response.append(gather)
    
    # If no input, redirect
    response.redirect('/twilio/incoming')
    
    return Response(content=str(response), media_type="application/xml")


@app.post("/twilio/process-speech")
async def process_speech(request: Request):
    """
    Process user speech input
    """
    form_data = await request.form()
    call_sid = form_data.get("CallSid")
    speech_result = form_data.get("SpeechResult", "")
    confidence = form_data.get("Confidence", "0")
    
    logger.info(f"Processing speech for call {call_sid}: {speech_result}")
    
    response = VoiceResponse()
    
    if call_sid not in conversation_managers:
        conversation_managers[call_sid] = ConversationManager()
    
    conv_manager = conversation_managers[call_sid]
    
    # Process user input
    try:
        ai_response = conv_manager.process_user_input(speech_result)
        
        # Log conversation
        if SQLALCHEMY_AVAILABLE:
            try:
                db = next(get_db())
                if db:
                    call_log = db.query(CallLog).filter(CallLog.call_sid == call_sid).first()
                    if call_log:
                        call_log.transcript = f"{call_log.transcript}\nUser: {speech_result}\nAI: {ai_response}"
                        db.commit()
            except Exception as e:
                logger.warning(f"Database logging failed: {str(e)}")
        
        # Respond to user
        response.say(ai_response, voice='alice', language='en-US')
        
        # Check if conversation is closing
        if conv_manager.state.value == "closing":
            response.say("Thank you for calling. Goodbye!")
            response.hangup()
        else:
            # Continue conversation
            gather = Gather(
                input='speech',
                action='/twilio/process-speech',
                method='POST',
                speech_timeout='auto',
                language='en-US'
            )
            response.append(gather)
            response.redirect('/twilio/process-speech')
    
    except Exception as e:
        logger.error(f"Error processing speech: {str(e)}")
        response.say("I'm sorry, I didn't catch that. Could you please repeat?")
        gather = Gather(
            input='speech',
            action='/twilio/process-speech',
            method='POST',
            speech_timeout='auto',
            language='en-US'
        )
        response.append(gather)
    
    return Response(content=str(response), media_type="application/xml")


@app.post("/twilio/status")
async def call_status(request: Request):
    """
    Handle call status updates from Twilio
    """
    form_data = await request.form()
    call_sid = form_data.get("CallSid")
    call_status = form_data.get("CallStatus")
    duration = form_data.get("CallDuration", "0")
    
    logger.info(f"Call status update: {call_sid} - {call_status}")
    
    # Update call log
    if SQLALCHEMY_AVAILABLE:
        try:
            db = next(get_db())
            if db:
                call_log = db.query(CallLog).filter(CallLog.call_sid == call_sid).first()
                
                if call_log:
                    call_log.status = call_status
                    call_log.duration = float(duration) if duration else 0.0
                    db.commit()
                else:
                    # Create new call log
                    call_log = CallLog(
                        call_sid=call_sid,
                        phone_number=form_data.get("From", ""),
                        direction="inbound",
                        status=call_status,
                        duration=float(duration) if duration else 0.0
                    )
                    db.add(call_log)
                    db.commit()
        except Exception as e:
            logger.warning(f"Database update failed: {str(e)}")
    
    # Clean up conversation manager
    if call_sid in conversation_managers:
        del conversation_managers[call_sid]
    
    return PlainTextResponse("OK")


@app.post("/call/outbound")
async def make_outbound_call(
    phone_number: str = Form(...),
    message: str = Form("Hello! This is an automated call from our office.")
):
    """
    Make an outbound call to a phone number
    
    Args:
        phone_number: Phone number to call (E.164 format)
        message: Initial message to play
    """
    try:
        twilio = get_twilio_client()
        
        # Get the URL for TwiML (you'll need to set this to your public URL)
        # For development, use ngrok or similar
        twiml_url = f"http://your-public-url.com/twilio/outbound-handler"
        
        logger.info(f"Making outbound call to {phone_number}")
        
        call = twilio.calls.create(
            to=phone_number,
            from_=settings.twilio_phone_number,
            url=twiml_url,
            method='POST'
        )
        
        # Log the call
        if SQLALCHEMY_AVAILABLE:
            try:
                db = next(get_db())
                if db:
                    call_log = CallLog(
                        call_sid=call.sid,
                        phone_number=phone_number,
                        direction="outbound",
                        status="initiated"
                    )
                    db.add(call_log)
                    db.commit()
            except Exception as e:
                logger.warning(f"Database logging failed: {str(e)}")
        
        return {
            "success": True,
            "call_sid": call.sid,
            "status": call.status,
            "message": "Outbound call initiated"
        }
    
    except Exception as e:
        logger.error(f"Error making outbound call: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/twilio/outbound-handler")
async def handle_outbound_call(request: Request):
    """
    Handle outbound call flow
    """
    form_data = await request.form()
    call_sid = form_data.get("CallSid")
    
    logger.info(f"Handling outbound call: {call_sid}")
    
    response = VoiceResponse()
    response.say("Hello! This is an automated call. How can I help you today?", voice='alice')
    
    gather = Gather(
        input='speech',
        action='/twilio/process-speech',
        method='POST',
        speech_timeout='auto',
        language='en-US'
    )
    response.append(gather)
    
    return Response(content=str(response), media_type="application/xml")


@app.get("/logs")
async def get_call_logs(skip: int = 0, limit: int = 100):
    """
    Get call logs
    """
    if not SQLALCHEMY_AVAILABLE:
        return {"total": 0, "logs": [], "message": "Database not available"}
    
    try:
        db = next(get_db())
        if not db:
            return {"total": 0, "logs": [], "message": "Database not available"}
        logs = db.query(CallLog).offset(skip).limit(limit).all()
        return {
            "total": len(logs),
            "logs": [
                {
                    "id": log.id,
                    "call_sid": log.call_sid,
                    "phone_number": log.phone_number,
                    "direction": log.direction,
                    "status": log.status,
                    "duration": log.duration,
                    "transcript": log.transcript,
                    "created_at": log.created_at.isoformat() if log.created_at else None
                }
                for log in logs
            ]
        }
    except Exception as e:
        logger.error(f"Error getting call logs: {str(e)}")
        return {"total": 0, "logs": [], "error": str(e)}


@app.get("/logs/{call_sid}")
async def get_call_log(call_sid: str):
    """
    Get specific call log by CallSid
    """
    if not SQLALCHEMY_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        db = next(get_db())
        if not db:
            raise HTTPException(status_code=503, detail="Database not available")
        log = db.query(CallLog).filter(CallLog.call_sid == call_sid).first()
        if not log:
            raise HTTPException(status_code=404, detail="Call log not found")
    
    return {
        "id": log.id,
        "call_sid": log.call_sid,
        "phone_number": log.phone_number,
        "direction": log.direction,
        "status": log.status,
        "duration": log.duration,
        "transcript": log.transcript,
        "created_at": log.created_at.isoformat() if log.created_at else None
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.host, port=settings.port)

