"""
Data models for the appointment system
"""
from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime


class Doctor(BaseModel):
    """Doctor model"""
    id: int
    name: str
    specialization: str
    available_from: str
    available_to: str


class AppointmentCreate(BaseModel):
    """Model for creating an appointment"""
    doctor_id: int
    patient_name: str
    phone: str
    problem: str
    date: str
    time: str
    
    @validator('phone')
    def validate_phone(cls, v):
        """Validate phone number (should be 10 digits)"""
        # Remove spaces and dashes
        cleaned = v.replace(" ", "").replace("-", "")
        if not cleaned.isdigit() or len(cleaned) != 10:
            raise ValueError("Phone number must be 10 digits")
        return cleaned
    
    @validator('patient_name')
    def validate_name(cls, v):
        """Validate patient name"""
        if len(v.strip()) < 2:
            raise ValueError("Name must be at least 2 characters")
        return v.strip()
    
    @validator('problem')
    def validate_problem(cls, v):
        """Validate problem description"""
        if len(v.strip()) < 5:
            raise ValueError("Problem description must be at least 5 characters")
        return v.strip()


class Appointment(BaseModel):
    """Appointment model with all fields"""
    id: int
    doctor_id: int
    patient_name: str
    phone: str
    problem: str
    date: str
    time: str
    status: str


class ChatMessage(BaseModel):
    """Chat message model"""
    message: str
    session_id: Optional[str] = None
    doctor_id: Optional[int] = None


class ChatResponse(BaseModel):
    """Chatbot response model"""
    response: str
    session_id: str
    appointment_data: Optional[dict] = None
    is_complete: bool = False

