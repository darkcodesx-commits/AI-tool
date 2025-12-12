"""
Conversation flow logic for multi-turn dialogues
"""
import logging
from typing import Dict, List, Optional
from enum import Enum

logger = logging.getLogger(__name__)


class ConversationState(Enum):
    """States in the conversation flow"""
    GREETING = "greeting"
    LISTENING = "listening"
    UNDERSTANDING = "understanding"
    RESPONDING = "responding"
    APPOINTMENT_BOOKING = "appointment_booking"
    INFORMATION_GATHERING = "information_gathering"
    CLOSING = "closing"


class ConversationManager:
    """Manages conversation flow and context"""
    
    def __init__(self):
        self.context: Dict = {}
        self.state: ConversationState = ConversationState.GREETING
        self.appointment_info: Dict = {
            "date": None,
            "time": None,
            "name": None,
            "phone": None,
            "reason": None
        }
    
    def get_greeting(self) -> str:
        """Get initial greeting message"""
        return "Hello! Thank you for calling. I'm your AI receptionist. How can I help you today?"
    
    def process_user_input(self, text: str) -> str:
        """
        Process user input and generate appropriate response
        
        Args:
            text: User's transcribed speech
            
        Returns:
            AI response text
        """
        text_lower = text.lower().strip()
        
        # Update state based on input
        if self.state == ConversationState.GREETING:
            return self._handle_initial_request(text_lower)
        
        elif self.state == ConversationState.APPOINTMENT_BOOKING:
            return self._handle_appointment_booking(text_lower)
        
        elif self.state == ConversationState.INFORMATION_GATHERING:
            return self._handle_information_gathering(text_lower)
        
        else:
            return self._handle_general_query(text_lower)
    
    def _handle_initial_request(self, text: str) -> str:
        """Handle user's initial request"""
        # Check for appointment booking keywords
        appointment_keywords = ["appointment", "book", "schedule", "meeting", "reservation"]
        if any(keyword in text for keyword in appointment_keywords):
            self.state = ConversationState.APPOINTMENT_BOOKING
            return "I'd be happy to help you book an appointment. What date and time would work for you?"
        
        # Check for information requests
        info_keywords = ["hours", "open", "closed", "location", "address", "contact"]
        if any(keyword in text for keyword in info_keywords):
            self.state = ConversationState.INFORMATION_GATHERING
            return self._handle_information_query(text)
        
        # Default response
        return "I can help you with booking appointments or answering questions. What would you like to do?"
    
    def _handle_appointment_booking(self, text: str) -> str:
        """Handle appointment booking conversation"""
        # Extract date information
        date_keywords = ["tomorrow", "today", "monday", "tuesday", "wednesday", 
                        "thursday", "friday", "saturday", "sunday"]
        time_keywords = ["am", "pm", "morning", "afternoon", "evening"]
        
        # Check for date
        if not self.appointment_info["date"]:
            for keyword in date_keywords:
                if keyword in text:
                    self.appointment_info["date"] = keyword
                    break
        
        # Check for time
        if not self.appointment_info["time"]:
            # Look for time patterns like "4 pm", "2:30", etc.
            import re
            time_pattern = r'(\d{1,2})\s*(?::(\d{2}))?\s*(am|pm)?'
            match = re.search(time_pattern, text)
            if match:
                hour = match.group(1)
                minute = match.group(2) or "00"
                period = match.group(3) or ""
                self.appointment_info["time"] = f"{hour}:{minute} {period}".strip()
        
        # Check for name
        if not self.appointment_info["name"]:
            name_patterns = ["my name is", "i'm", "i am", "call me"]
            for pattern in name_patterns:
                if pattern in text:
                    # Try to extract name (simple extraction)
                    parts = text.split(pattern)
                    if len(parts) > 1:
                        potential_name = parts[1].split()[0] if parts[1].split() else None
                        if potential_name:
                            self.appointment_info["name"] = potential_name
        
        # Check if we have enough information
        if self.appointment_info["date"] and self.appointment_info["time"]:
            if not self.appointment_info["name"]:
                return "Great! I have the date and time. May I have your name, please?"
            
            # Confirm appointment
            self.state = ConversationState.CLOSING
            date = self.appointment_info["date"]
            time = self.appointment_info["time"]
            name = self.appointment_info["name"]
            
            return f"Perfect! I've booked an appointment for {name} on {date} at {time}. Is there anything else I can help you with?"
        
        # Ask for missing information
        if not self.appointment_info["date"]:
            return "What date would you like to schedule the appointment?"
        if not self.appointment_info["time"]:
            return "What time would work best for you?"
        
        return "I'm still gathering information. Could you please provide the date and time for your appointment?"
    
    def _handle_information_query(self, text: str) -> str:
        """Handle information queries"""
        if "hours" in text or "open" in text or "closed" in text:
            return "Our office hours are Monday through Friday, 9 AM to 5 PM. We're closed on weekends."
        
        if "location" in text or "address" in text:
            return "We're located at 123 Main Street, City, State, 12345. Would you like directions?"
        
        if "contact" in text or "phone" in text:
            return "You can reach us at 555-1234 during business hours, or email us at info@example.com."
        
        return "Is there anything specific you'd like to know about our services?"
    
    def _handle_general_query(self, text: str) -> str:
        """Handle general queries"""
        if "thank" in text or "thanks" in text:
            self.state = ConversationState.CLOSING
            return "You're welcome! Have a great day!"
        
        if "goodbye" in text or "bye" in text:
            self.state = ConversationState.CLOSING
            return "Thank you for calling. Have a wonderful day!"
        
        return "I'm here to help. Would you like to book an appointment or get information about our services?"
    
    def reset(self):
        """Reset conversation state"""
        self.state = ConversationState.GREETING
        self.appointment_info = {
            "date": None,
            "time": None,
            "name": None,
            "phone": None,
            "reason": None
        }
        self.context = {}
    
    def get_transcript_summary(self) -> Dict:
        """Get summary of conversation for logging"""
        return {
            "state": self.state.value,
            "appointment_info": self.appointment_info,
            "context": self.context
        }

