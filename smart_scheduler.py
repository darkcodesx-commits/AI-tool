import os
import joblib
import pandas as pd

print("\n🚀 Smart Scheduler Started\n")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "saved_models")

# Load models
noshow_model = joblib.load(os.path.join(MODEL_DIR, "noshow_model.pkl"))
peak_model = joblib.load(os.path.join(MODEL_DIR, "peak_hour_model.pkl"))

# -----------------------------
# USER INPUT
# -----------------------------
hour = int(input("Enter appointment hour (0–23): "))
age = int(input("Enter patient age: "))
sms = int(input("SMS received? (1 = Yes, 0 = No): "))

# Create DataFrame with SAME feature names used in training
X = pd.DataFrame([{
    "hour": hour,
    "Age": age,
    "SMS_received": sms
}])

# -----------------------------
# PREDICTIONS
# -----------------------------
noshow_prob = noshow_model.predict_proba(X)[0][1]
peak = peak_model.predict(X)[0]

print("\n📊 Prediction Results")
print(f"⚠️ No-show probability: {noshow_prob:.2%}")

if peak == 1:
    print("⏰ Peak hour detected — consider rescheduling")
else:
    print("✅ Slot is non-peak — good choice")

print("\n🎯 Smart Scheduler Finished\n")
