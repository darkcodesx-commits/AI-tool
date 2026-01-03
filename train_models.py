import os
import pandas as pd
import sqlite3
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

print("🚀 Training started")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "database", "appointments.db")
MODEL_DIR = os.path.join(BASE_DIR, "saved_models")
os.makedirs(MODEL_DIR, exist_ok=True)

# -----------------------------
# LOAD DATA
# -----------------------------
conn = sqlite3.connect(DB_PATH)
df = pd.read_sql("SELECT * FROM appointments", conn)
conn.close()

print("Rows loaded:", len(df))
print("Columns:", list(df.columns))

# -----------------------------
# FEATURE ENGINEERING
# -----------------------------
# Use AppointmentDay for hour extraction
df["AppointmentDay"] = pd.to_datetime(df["AppointmentDay"])
df["hour"] = df["AppointmentDay"].dt.hour

# Convert No-show to binary (Yes=1, No=0)
df["no_show"] = df["No-show"].map({"Yes": 1, "No": 0})

# Create peak-hour label (example: 10 AM – 12 PM)
df["is_peak"] = df["hour"].between(10, 12).astype(int)

# Optional extra features (realistic)
features = ["hour", "Age", "SMS_received"]

X = df[features]
y_noshow = df["no_show"]
y_peak = df["is_peak"]

# -----------------------------
# NO-SHOW MODEL
# -----------------------------
print("🧠 Training No-show model...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y_noshow, test_size=0.2, random_state=42
)

noshow_model = RandomForestClassifier(n_estimators=200, random_state=42)
noshow_model.fit(X_train, y_train)

acc1 = accuracy_score(y_test, noshow_model.predict(X_test))
joblib.dump(noshow_model, os.path.join(MODEL_DIR, "noshow_model.pkl"))

print(f"✅ No-show model saved | Accuracy: {acc1:.2f}")

# -----------------------------
# PEAK-HOUR MODEL
# -----------------------------
print("🧠 Training Peak-hour model...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y_peak, test_size=0.2, random_state=42
)

peak_model = RandomForestClassifier(n_estimators=200, random_state=42)
peak_model.fit(X_train, y_train)

acc2 = accuracy_score(y_test, peak_model.predict(X_test))
joblib.dump(peak_model, os.path.join(MODEL_DIR, "peak_hour_model.pkl"))

print(f"✅ Peak-hour model saved | Accuracy: {acc2:.2f}")

print("🎯 TRAINING COMPLETE")
