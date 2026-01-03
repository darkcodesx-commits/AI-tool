print("🔥 load_data_to_db.py STARTED")

import pandas as pd
import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "data", "appointments.csv")
DB_PATH = os.path.join(BASE_DIR, "database", "appointments.db")

print("CSV PATH:", CSV_PATH)
print("DB PATH:", DB_PATH)

df = pd.read_csv(CSV_PATH)
print("Rows in CSV:", len(df))

conn = sqlite3.connect(DB_PATH)
df.to_sql("appointments", conn, if_exists="replace", index=False)
conn.close()

print("✅ Appointment history loaded into database")
input("Press Enter to exit")
