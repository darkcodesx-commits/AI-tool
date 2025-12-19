"""
Database setup and connection management for SQLite
"""
import sqlite3
from datetime import datetime
from typing import Optional

# Database file path
DB_PATH = "appointments.db"


def get_db_connection():
    """Create and return a database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # This allows accessing columns by name
    return conn


def init_database():
    """Initialize database tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create Doctors table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            specialization TEXT NOT NULL,
            available_from TEXT NOT NULL,
            available_to TEXT NOT NULL
        )
    """)
    
    # Create Appointments table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS appointments (
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
        )
    """)
    
    # Insert sample doctors if table is empty
    cursor.execute("SELECT COUNT(*) FROM doctors")
    if cursor.fetchone()[0] == 0:
        sample_doctors = [
            ("Dr. Priya Sharma", "Cardiologist", "09:00", "17:00"),
            ("Dr. Rajesh Kumar", "Dermatologist", "10:00", "18:00"),
            ("Dr. Anjali Patel", "Pediatrician", "09:30", "16:30"),
            ("Dr. Vikram Singh", "Orthopedic", "08:00", "15:00"),
            ("Dr. Meera Reddy", "General Physician", "09:00", "18:00"),
        ]
        cursor.executemany("""
            INSERT INTO doctors (name, specialization, available_from, available_to)
            VALUES (?, ?, ?, ?)
        """, sample_doctors)
    
    conn.commit()
    conn.close()
    print("Database initialized successfully!")


if __name__ == "__main__":
    init_database()

