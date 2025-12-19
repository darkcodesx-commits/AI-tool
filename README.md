# 🏥 AI-Based Doctor Appointment Confirmation System

A complete, lightweight AI-based doctor appointment booking system designed as a third-party service for clinics and hospitals in India. This system features an AI chatbot that acts as a receptionist, collecting patient information and confirming appointments.

## ✨ Features

- **Doctor Listing**: View all available doctors with their specializations and working hours
- **AI Chatbot**: Interactive WhatsApp-style chatbot that collects patient details step-by-step
- **Appointment Booking**: Automated appointment booking with availability checking
- **Double Booking Prevention**: System prevents booking the same time slot twice
- **Console Notifications**: Confirmation messages printed to console (extensible for SMS/Email/WhatsApp)
- **Clean UI**: Modern, responsive design with Tailwind CSS

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLite** - Lightweight database
- **Pydantic** - Data validation
- **Rule-based Chatbot** - CPU-friendly conversation logic

### Frontend
- **React** - UI library
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client

## 📁 Project Structure

```
ai-appointment-system/
│
├── backend/
│   ├── main.py           # FastAPI server and API endpoints
│   ├── chatbot.py        # Rule-based chatbot logic
│   ├── database.py       # Database setup and connection
│   ├── models.py         # Pydantic models
│   └── requirements.txt  # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # React entry point
│   │   ├── index.css            # Global styles
│   │   └── components/
│   │       ├── DoctorList.jsx    # Doctor listing component
│   │       └── Chatbot.jsx       # Chatbot component
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize the database:**
   ```bash
   python database.py
   ```

5. **Start the FastAPI server:**
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   The backend will run on `http://localhost:8000`

### Frontend Setup

1. **Open a new terminal and navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

## 📖 Usage Guide

### 1. View Doctors
- Open the application in your browser
- You'll see a list of available doctors with their specializations
- Each doctor card shows their working hours

### 2. Book an Appointment
- Click "Book Appointment" on any doctor card
- The AI chatbot will start a conversation
- Follow the chatbot's prompts:
  - **Name**: Enter your full name
  - **Phone**: Enter your 10-digit phone number
  - **Problem**: Briefly describe your health issue
  - **Date**: Provide appointment date (DD-MM-YYYY or YYYY-MM-DD)
  - **Time**: Provide preferred time (HH:MM format)
- Confirm your details when prompted

### 3. Confirmation
- Once confirmed, the system checks doctor availability
- If the slot is available, appointment is booked
- Confirmation message is displayed in the chat
- Console notification is printed (check backend terminal)

## 🔌 API Endpoints

### GET `/doctors`
Get all available doctors

**Response:**
```json
[
  {
    "id": 1,
    "name": "Dr. Priya Sharma",
    "specialization": "Cardiologist",
    "available_from": "09:00",
    "available_to": "17:00"
  }
]
```

### GET `/doctors/{doctor_id}`
Get a specific doctor by ID

### GET `/available-slots/{doctor_id}?date=YYYY-MM-DD`
Get available time slots for a doctor on a specific date

**Response:**
```json
{
  "date": "2024-01-15",
  "available_slots": ["09:00", "09:30", "10:00", ...],
  "booked_slots": ["14:00", "15:30"]
}
```

### POST `/chat`
Send a message to the chatbot

**Request:**
```json
{
  "message": "Hello",
  "session_id": "session_123"
}
```

**Response:**
```json
{
  "response": "Hello! I'm your AI assistant...",
  "session_id": "session_123",
  "appointment_data": {
    "patient_name": "",
    "phone": "",
    "problem": "",
    "date": "",
    "time": ""
  },
  "is_complete": false
}
```

### POST `/book-appointment`
Book an appointment

**Request:**
```json
{
  "doctor_id": 1,
  "patient_name": "John Doe",
  "phone": "9876543210",
  "problem": "Chest pain",
  "date": "2024-01-15",
  "time": "14:00"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment booked successfully!",
  "appointment_id": 1,
  "appointment": {
    "id": 1,
    "doctor_name": "Dr. Priya Sharma",
    "patient_name": "John Doe",
    "date": "2024-01-15",
    "time": "14:00"
  }
}
```

### GET `/appointments/{doctor_id}?date=YYYY-MM-DD`
Get appointments for a doctor (optionally filtered by date)

## 🗄️ Database Schema

### Doctors Table
```sql
CREATE TABLE doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    available_from TEXT NOT NULL,
    available_to TEXT NOT NULL
);
```

### Appointments Table
```sql
CREATE TABLE appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id INTEGER NOT NULL,
    patient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    problem TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'confirmed',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors (id)
);
```

## 🤖 Chatbot Logic

The chatbot uses a rule-based conversation flow:

1. **Greeting** - Welcomes the user
2. **Ask Name** - Collects patient name
3. **Ask Phone** - Validates and collects phone number
4. **Ask Problem** - Collects health problem description
5. **Ask Date** - Validates date format and ensures future date
6. **Ask Time** - Validates time format
7. **Confirm** - Shows summary and asks for confirmation
8. **Complete** - Books the appointment

The chatbot validates all inputs and asks again if invalid data is provided.

## 🔔 Notification System

Currently, notifications are printed to the console. The code is structured to easily extend to:
- SMS notifications (using Twilio, etc.)
- Email notifications (using SMTP)
- WhatsApp notifications (using WhatsApp Business API)

Check the `send_notification()` function in `backend/main.py` to add your preferred notification method.

## 🎨 Customization

### Adding More Doctors
Edit `backend/database.py` and add more entries to the `sample_doctors` list, or insert directly into the database.

### Changing Working Hours
Update the `available_from` and `available_to` fields in the doctors table.

### Styling
Modify Tailwind classes in the React components or update `frontend/tailwind.config.js` for custom themes.

## 🐛 Troubleshooting

### Backend won't start
- Make sure Python 3.8+ is installed
- Check if port 8000 is already in use
- Verify all dependencies are installed: `pip install -r requirements.txt`

### Frontend won't start
- Make sure Node.js 16+ is installed
- Run `npm install` to install dependencies
- Check if port 5173 is already in use

### CORS Errors
- Ensure backend is running on `http://localhost:8000`
- Check CORS settings in `backend/main.py`

### Database Errors
- Delete `appointments.db` and run `python database.py` again to reset

## 📝 Notes

- This is an MVP/demo system suitable for:
  - Startup demos
  - Final year projects
  - Internship showcases
  - Learning purposes

- For production use, consider:
  - Adding authentication
  - Using PostgreSQL instead of SQLite
  - Implementing proper session management (Redis)
  - Adding rate limiting
  - Implementing proper error logging
  - Adding unit tests

## 📄 License

This project is open source and available for educational and commercial use.

## 👨‍💻 Author

Built as a complete AI appointment system for clinics and hospitals in India.

---

**Happy Coding! 🚀**

