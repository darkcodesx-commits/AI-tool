"""
FastAPI backend for AI Appointment System
Main API endpoints and server setup
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sqlite3
from datetime import datetime
import uuid

from database import get_db_connection, init_database
from models import Doctor, AppointmentCreate, Appointment, ChatMessage, ChatResponse
from chatbot import chatbot

# Initialize FastAPI app
app = FastAPI(
    title="AI Appointment System",
    description="AI-based Doctor Appointment Confirmation System",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_database()
    # Avoid non-ASCII in console to prevent encoding issues on Windows
    print("AI Appointment System Backend Started!")


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "AI Appointment System API", "status": "running"}


@app.get("/doctors", response_model=list[dict])
async def get_doctors():
    """Get all doctors with their availability"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM doctors")
        doctors = cursor.fetchall()
        
        result = []
        for doctor in doctors:
            result.append({
                "id": doctor["id"],
                "name": doctor["name"],
                "specialization": doctor["specialization"],
                "available_from": doctor["available_from"],
                "available_to": doctor["available_to"]
            })
        
        conn.close()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching doctors: {str(e)}")


@app.get("/doctors/{doctor_id}", response_model=dict)
async def get_doctor(doctor_id: int):
    """Get a specific doctor by ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM doctors WHERE id = ?", (doctor_id,))
        doctor = cursor.fetchone()
        
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")
        
        conn.close()
        return {
            "id": doctor["id"],
            "name": doctor["name"],
            "specialization": doctor["specialization"],
            "available_from": doctor["available_from"],
            "available_to": doctor["available_to"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching doctor: {str(e)}")


@app.get("/available-slots/{doctor_id}")
async def get_available_slots(doctor_id: int, date: str):
    """Get available time slots for a doctor on a specific date"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get doctor's working hours
        cursor.execute("SELECT available_from, available_to FROM doctors WHERE id = ?", (doctor_id,))
        doctor = cursor.fetchone()
        
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")
        
        # Get booked appointments for the date
        cursor.execute("""
            SELECT time FROM appointments 
            WHERE doctor_id = ? AND date = ? AND status = 'confirmed'
        """, (doctor_id, date))
        
        booked_times = [row["time"] for row in cursor.fetchall()]
        
        # Generate available slots (every 30 minutes)
        available_from = doctor["available_from"]
        available_to = doctor["available_to"]
        
        # Parse times
        from_hour, from_min = map(int, available_from.split(":"))
        to_hour, to_min = map(int, available_to.split(":"))
        
        from_time = from_hour * 60 + from_min
        to_time = to_hour * 60 + to_min
        
        slots = []
        current = from_time
        
        while current < to_time:
            hour = current // 60
            minute = current % 60
            time_str = f"{hour:02d}:{minute:02d}"
            
            if time_str not in booked_times:
                slots.append(time_str)
            
            current += 30  # 30-minute intervals
        
        conn.close()
        return {"date": date, "available_slots": slots, "booked_slots": booked_times}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching slots: {str(e)}")


@app.post("/chat", response_model=ChatResponse)
async def chat(message: ChatMessage):
    """Handle chatbot conversation"""
    try:
        # Generate session ID if not provided
        session_id = message.session_id or str(uuid.uuid4())
        
        # Process message through chatbot
        response = chatbot.process_message(
            message.message,
            session_id,
            doctor_id=message.doctor_id
        )
        
        return ChatResponse(**response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")


@app.post("/book-appointment", response_model=dict)
async def book_appointment(appointment: AppointmentCreate):
    """Book an appointment"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if doctor exists
        cursor.execute("SELECT * FROM doctors WHERE id = ?", (appointment.doctor_id,))
        doctor = cursor.fetchone()
        
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")
        
        # Check if slot is already booked
        cursor.execute("""
            SELECT id FROM appointments 
            WHERE doctor_id = ? AND date = ? AND time = ? AND status = 'confirmed'
        """, (appointment.doctor_id, appointment.date, appointment.time))
        
        existing = cursor.fetchone()
        if existing:
            raise HTTPException(
                status_code=400,
                detail="This time slot is already booked. Please choose another time."
            )
        
        # Check if time is within doctor's working hours
        doctor_from = doctor["available_from"]
        doctor_to = doctor["available_to"]
        
        appointment_time = appointment.time
        
        if appointment_time < doctor_from or appointment_time > doctor_to:
            raise HTTPException(
                status_code=400,
                detail=f"Doctor is available from {doctor_from} to {doctor_to}. Please choose a time within this range."
            )
        
        # Insert appointment
        cursor.execute("""
            INSERT INTO appointments (doctor_id, patient_name, phone, problem, date, time, status)
            VALUES (?, ?, ?, ?, ?, ?, 'confirmed')
        """, (
            appointment.doctor_id,
            appointment.patient_name,
            appointment.phone,
            appointment.problem,
            appointment.date,
            appointment.time
        ))
        
        appointment_id = cursor.lastrowid
        
        conn.commit()
        conn.close()
        
        # Send notifications (console for now, can be extended to SMS/Email)
        send_notification(doctor, appointment, appointment_id)
        
        return {
            "success": True,
            "message": "Appointment booked successfully!",
            "appointment_id": appointment_id,
            "appointment": {
                "id": appointment_id,
                "doctor_name": doctor["name"],
                "patient_name": appointment.patient_name,
                "date": appointment.date,
                "time": appointment.time
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error booking appointment: {str(e)}")


def send_notification(doctor, appointment, appointment_id):
    """Send notification to console (extensible for SMS/Email/WhatsApp)"""
    print("\n" + "="*60)
    print("📅 APPOINTMENT CONFIRMATION")
    print("="*60)
    print(f"Appointment ID: {appointment_id}")
    print(f"Doctor: {doctor['name']} ({doctor['specialization']})")
    print(f"Patient: {appointment.patient_name}")
    print(f"Phone: {appointment.phone}")
    print(f"Date: {appointment.date}")
    print(f"Time: {appointment.time}")
    print(f"Problem: {appointment.problem}")
    print("="*60)
    print("\n✅ Confirmation sent to patient and doctor!")
    print("💡 In production, this would send SMS/Email/WhatsApp notifications\n")


@app.get("/appointments/{doctor_id}")
async def get_appointments(doctor_id: int, date: str = None):
    """Get appointments for a doctor (optionally filtered by date)"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if date:
            cursor.execute("""
                SELECT * FROM appointments 
                WHERE doctor_id = ? AND date = ?
                ORDER BY time
            """, (doctor_id, date))
        else:
            cursor.execute("""
                SELECT * FROM appointments 
                WHERE doctor_id = ?
                ORDER BY date, time
            """, (doctor_id,))
        
        appointments = cursor.fetchall()
        
        result = []
        for apt in appointments:
            result.append({
                "id": apt["id"],
                "doctor_id": apt["doctor_id"],
                "patient_name": apt["patient_name"],
                "phone": apt["phone"],
                "problem": apt["problem"],
                "date": apt["date"],
                "time": apt["time"],
                "status": apt["status"]
            })
        
        conn.close()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching appointments: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

