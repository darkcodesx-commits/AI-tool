# 🚀 Quick Start Guide

Follow these steps to get the AI Appointment System running quickly.

## Step 1: Backend Setup

Open a terminal/command prompt and run:

```bash
# Navigate to backend folder
cd backend

# Create virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# OR (Linux/Mac)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python database.py

# Start server
python main.py
```

✅ Backend should now be running on `http://localhost:8000`

## Step 2: Frontend Setup

Open a **NEW** terminal/command prompt and run:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ Frontend should now be running on `http://localhost:5173`

## Step 3: Use the Application

1. Open your browser and go to `http://localhost:5173`
2. You'll see a list of doctors
3. Click "Book Appointment" on any doctor
4. Chat with the AI assistant to book your appointment!

## 🎯 Testing the System

### Test Chatbot Flow:
1. Say "Hello" or "Hi" to start
2. Enter your name: "John Doe"
3. Enter phone: "9876543210"
4. Describe problem: "I have a headache"
5. Enter date: "15-01-2024" or "2024-01-15"
6. Enter time: "14:00" or "2:00 PM"
7. Type "yes" to confirm

### Check Backend Console:
After booking, you should see a confirmation message printed in the backend terminal.

## ⚠️ Troubleshooting

**Backend not starting?**
- Make sure Python 3.8+ is installed: `python --version`
- Check if port 8000 is free
- Try: `pip install --upgrade pip` then reinstall requirements

**Frontend not starting?**
- Make sure Node.js 16+ is installed: `node --version`
- Delete `node_modules` and run `npm install` again
- Check if port 5173 is free

**CORS errors?**
- Make sure backend is running before starting frontend
- Check that backend is on port 8000

**Database errors?**
- Delete `backend/appointments.db` and run `python database.py` again

## 📞 Need Help?

Check the main README.md for detailed documentation and API endpoints.

