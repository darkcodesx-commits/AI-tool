"""
Rule-based chatbot for appointment booking
Handles conversation flow and data collection
"""
import re
from typing import Dict, Optional, Tuple
from datetime import datetime, timedelta


class AppointmentChatbot:
    """Rule-based chatbot for collecting appointment details"""
    
    def __init__(self):
        # Conversation states
        self.states = {
            "greeting": 0,
            "ask_name": 1,
            "ask_phone": 2,
            "ask_problem": 3,
            "ask_date": 4,
            "ask_time": 5,
            "confirm": 6,
            "complete": 7
        }
        
        # Session storage (in production, use Redis or database)
        self.sessions: Dict[str, Dict] = {}
    
    def get_next_state(self, current_state: int) -> int:
        """Get next state in the conversation flow"""
        return current_state + 1
    
    def validate_phone(self, phone: str) -> bool:
        """Validate phone number"""
        cleaned = phone.replace(" ", "").replace("-", "")
        return cleaned.isdigit() and len(cleaned) == 10
    
    def validate_date(self, date_str: str) -> Tuple[bool, Optional[str]]:
        """Validate date format (YYYY-MM-DD) and check if it's in the future"""
        try:
            # Try different date formats
            date_formats = ["%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%Y/%m/%d"]
            parsed_date = None
            
            for fmt in date_formats:
                try:
                    parsed_date = datetime.strptime(date_str.strip(), fmt)
                    break
                except ValueError:
                    continue
            
            if parsed_date is None:
                return False, "Invalid date format. Please use DD-MM-YYYY or YYYY-MM-DD"
            
            # Check if date is in the future
            today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            if parsed_date < today:
                return False, "Please select a future date"
            
            # Return in standard format
            return True, parsed_date.strftime("%Y-%m-%d")
        except Exception as e:
            return False, f"Invalid date: {str(e)}"
    
    def validate_time(self, time_str: str) -> Tuple[bool, Optional[str]]:
        """Validate time format (HH:MM)"""
        try:
            # Try different time formats
            time_formats = ["%H:%M", "%H:%M:%S", "%I:%M %p", "%I:%M%p"]
            parsed_time = None
            
            for fmt in time_formats:
                try:
                    parsed_time = datetime.strptime(time_str.strip(), fmt)
                    break
                except ValueError:
                    continue
            
            if parsed_time is None:
                return False, None
            
            return True, parsed_time.strftime("%H:%M")
        except Exception:
            return False, None
    
    def extract_info(self, message: str, field: str) -> Optional[str]:
        """Extract information from user message using simple patterns"""
        message_lower = message.lower()
        
        if field == "phone":
            # Extract phone number
            numbers = re.findall(r'\d{10}', message.replace(" ", "").replace("-", ""))
            if numbers:
                return numbers[0]
            return None
        
        elif field == "date":
            # Try to extract date
            # Look for common date patterns
            date_patterns = [
                r'\d{1,2}[-/]\d{1,2}[-/]\d{4}',
                r'\d{4}[-/]\d{1,2}[-/]\d{1,2}',
            ]
            for pattern in date_patterns:
                match = re.search(pattern, message)
                if match:
                    return match.group()
            return None
        
        elif field == "time":
            # Extract time
            time_patterns = [
                r'\d{1,2}:\d{2}',
                r'\d{1,2}\s*(am|pm)',
            ]
            for pattern in time_patterns:
                match = re.search(pattern, message_lower)
                if match:
                    return match.group()
            return None
        
        return None
    
    def process_message(self, message: str, session_id: str, doctor_id: Optional[int] = None) -> Dict:
        """Process user message and return chatbot response"""
        
        # Initialize session if new
        if session_id not in self.sessions:
            self.sessions[session_id] = {
                "state": self.states["greeting"],
                "data": {
                    "doctor_id": doctor_id,
                    "patient_name": "",
                    "phone": "",
                    "problem": "",
                    "date": "",
                    "time": ""
                }
            }
        
        session = self.sessions[session_id]
        current_state = session["state"]
        data = session["data"]
        
        message_lower = message.lower().strip()
        
        # Handle greetings
        if current_state == self.states["greeting"]:
            if any(word in message_lower for word in ["hi", "hello", "hey", "start", "book"]):
                session["state"] = self.states["ask_name"]
                return {
                    "response": "Hello! I'm your AI assistant. I'll help you book an appointment. What's your name?",
                    "session_id": session_id,
                    "appointment_data": data,
                    "is_complete": False
                }
            else:
                return {
                    "response": "Hello! I'm here to help you book an appointment. Say 'hi' or 'book appointment' to start.",
                    "session_id": session_id,
                    "appointment_data": data,
                    "is_complete": False
                }
        
        # Ask for name
        elif current_state == self.states["ask_name"]:
            if len(message.strip()) >= 2:
                data["patient_name"] = message.strip()
                session["state"] = self.states["ask_phone"]
                return {
                    "response": f"Nice to meet you, {data['patient_name']}! What's your phone number?",
                    "session_id": session_id,
                    "appointment_data": data,
                    "is_complete": False
                }
            else:
                return {
                    "response": "Please provide your full name.",
                    "session_id": session_id,
                    "appointment_data": data,
                    "is_complete": False
                }
        
        # Ask for phone
        elif current_state == self.states["ask_phone"]:
            extracted_phone = self.extract_info(message, "phone")
            if extracted_phone and self.validate_phone(extracted_phone):
                data["phone"] = extracted_phone
                session["state"] = self.states["ask_problem"]
                return {
                    "response": "Thank you! Can you briefly describe your health problem or reason for the appointment?",
                    "session_id": session_id,
                    "appointment_data": data,
                    "is_complete": False
                }
            else:
                return {
                    "response": "Please provide a valid 10-digit phone number.",
                    "session_id": session_id,
                    "appointment_data": data,
                    "is_complete": False
                }
        
        # Ask for problem
        elif current_state == self.states["ask_problem"]:
            if len(message.strip()) >= 5:
                data["problem"] = message.strip()
                session["state"] = self.states["ask_date"]
                return {
                    "response": "Got it! When would you like to schedule the appointment? Please provide the date (DD-MM-YYYY or YYYY-MM-DD).",
                    "session_id": session_id,
                    "appointment_data": data,
                    "is_complete": False
                }
            else:
                return {
                    "response": "Please provide a brief description of your health problem (at least 5 characters).",
                    "session_id": session_id,
                    "appointment_data": data,
                    "is_complete": False
                }
        
        # Ask for date
        elif current_state == self.states["ask_date"]:
            extracted_date = self.extract_info(message, "date")
            date_to_validate = extracted_date if extracted_date else message.strip()
            
            is_valid, result = self.validate_date(date_to_validate)
            if is_valid:
                data["date"] = result
                session["state"] = self.states["ask_time"]
                return {
                    "response": f"Great! You've selected {data['date']}. What time would you prefer? (Please use 24-hour format like 14:30 or 2:30 PM)",
                    "session_id": session_id,
                    "appointment_data": data,
                    "is_complete": False
                }
            else:
                return {
                    "response": result or "Please provide a valid date in DD-MM-YYYY or YYYY-MM-DD format.",
                    "session_id": session_id,
                    "appointment_data": data,
                    "is_complete": False
                }
        
        # Ask for time
        elif current_state == self.states["ask_time"]:
            extracted_time = self.extract_info(message, "time")
            time_to_validate = extracted_time if extracted_time else message.strip()
            
            is_valid, result = self.validate_time(time_to_validate)
            if is_valid:
                data["time"] = result
                session["state"] = self.states["confirm"]
                return {
                    "response": f"Perfect! Let me confirm your details:\n\n"
                               f"Name: {data['patient_name']}\n"
                               f"Phone: {data['phone']}\n"
                               f"Problem: {data['problem']}\n"
                               f"Date: {data['date']}\n"
                               f"Time: {data['time']}\n\n"
                               f"Type 'yes' to confirm or 'no' to start over.",
                    "session_id": session_id,
                    "appointment_data": data,
                    "is_complete": False
                }
            else:
                return {
                    "response": "Please provide a valid time (e.g., 14:30 or 2:30 PM).",
                    "session_id": session_id,
                    "appointment_data": data,
                    "is_complete": False
                }
        
        # Confirm appointment
        elif current_state == self.states["confirm"]:
            if "yes" in message_lower or "confirm" in message_lower:
                session["state"] = self.states["complete"]
                return {
                    "response": "Excellent! Your appointment details have been collected. The system will now check availability and confirm your booking.",
                    "session_id": session_id,
                    "appointment_data": data,
                    "is_complete": True
                }
            elif "no" in message_lower or "cancel" in message_lower:
                # Reset session but preserve doctor_id
                current_doctor_id = data.get("doctor_id") or doctor_id
                self.sessions[session_id] = {
                    "state": self.states["greeting"],
                    "data": {
                        "doctor_id": current_doctor_id,
                        "patient_name": "",
                        "phone": "",
                        "problem": "",
                        "date": "",
                        "time": ""
                    }
                }
                return {
                    "response": "No problem! Let's start over. What's your name?",
                    "session_id": session_id,
                    "appointment_data": self.sessions[session_id]["data"],
                    "is_complete": False
                }
            else:
                return {
                    "response": "Please type 'yes' to confirm or 'no' to start over.",
                    "session_id": session_id,
                    "appointment_data": data,
                    "is_complete": False
                }
        
        # Complete state
        else:
            return {
                "response": "Your appointment has been processed. Is there anything else I can help you with?",
                "session_id": session_id,
                "appointment_data": data,
                "is_complete": True
            }
    
    def get_session_data(self, session_id: str) -> Optional[Dict]:
        """Get current session data"""
        return self.sessions.get(session_id)
    
    def clear_session(self, session_id: str):
        """Clear session data"""
        if session_id in self.sessions:
            del self.sessions[session_id]


# Global chatbot instance
chatbot = AppointmentChatbot()

